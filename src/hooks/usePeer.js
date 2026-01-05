import { useCallback, useEffect, useRef, useState } from "react";
import Peer from "peerjs";

const CallStatus = {
  DISCONNECTED: "DISCONNECTED",
  CONNECTING: "CONNECTING",
  READY: "READY",
  CALLING: "CALLING",
  IN_CALL: "IN_CALL",
};

const iceServers = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
  { urls: "stun:stun2.l.google.com:19302" },
  { urls: "stun:stun3.l.google.com:19302" },
  { urls: "stun:stun4.l.google.com:19302" },
];

const peerConfig = {
  host: "0.peerjs.com",
  port: 443,
  secure: true,
  path: "/",
  debug: 2,
  config: { iceServers },
};

export function usePeer() {
  const [myPeerId, setMyPeerId] = useState("");
  const [callStatus, setCallStatus] = useState(CallStatus.DISCONNECTED);
  const [errorMsg, setErrorMsg] = useState("");
  const [incomingCall, setIncomingCall] = useState(null);
  const peerRef = useRef(null);

  const addLog = useCallback((tag, ...rest) => {
    console.log(`[${tag}]`, ...rest);
  }, []);

  const initializePeer = useCallback(async () => {
    if (peerRef.current) return;

    setCallStatus(CallStatus.CONNECTING);

    try {
      const peer = new Peer(undefined, {
        ...peerConfig,
        pingInterval: 5000,
        debug: 2,
      });

      peerRef.current = peer;

      peer.on("open", (id) => {
        addLog("peer", "open", id);
        setMyPeerId(id);
        setCallStatus(CallStatus.READY);
      });

      peer.on("call", (call) => {
        addLog("peer", "incoming-call", call.peer);
        setIncomingCall(call);
      });



      peer.on("disconnected", () => {
        addLog("peer", "disconnected – reconnecting");
        setCallStatus(CallStatus.CONNECTING);

        try {
          peer.reconnect();
        } catch (e) {
          console.error("peer reconnect failed", e);
        }
      });

      peer.on("error", (err) => {
        console.error("peer error", err);
        setErrorMsg(err?.message || "Peer error");
      });

      peer.on("close", () => {
        addLog("peer", "closed");
        setCallStatus(CallStatus.DISCONNECTED);
      });
    } catch (err) {
      console.error("initializePeer error", err);
      setErrorMsg("Peer initialization failed");
      setCallStatus(CallStatus.DISCONNECTED);
    }
  }, [addLog]);

  const leaveCall = useCallback(() => {
    if (peerRef.current) {
      peerRef.current.destroy();
      peerRef.current = null;
    }
    setCallStatus(CallStatus.DISCONNECTED);
  }, []);

  useEffect(() => {
    initializePeer();
    return () => {
      if (peerRef.current) {
        peerRef.current.destroy();
        peerRef.current = null;
      }
    };
  }, [initializePeer]);

  return {
    myPeerId,
    callStatus,
    errorMsg,
    incomingCall,
    setIncomingCall,
    peerRef,
    leaveCall,
    addLog,
  };
}
