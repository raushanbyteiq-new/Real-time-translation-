import { useCallback, useRef } from "react";

const CallStatus = {
  DISCONNECTED: "DISCONNECTED",
  CONNECTING: "CONNECTING",
  READY: "READY",
  CALLING: "CALLING",
  IN_CALL: "IN_CALL",
};

export function useCall(peerRef, localStream, remotePeerId, callStatus, setupDataConnection, addLog, setIncomingCall, setRemoteStream) {
  const callRef = useRef(null);

  const endCall = useCallback(() => {
    // Stop media call
    if (callRef.current) {
      try {
        callRef.current.close();
      } catch {}
      callRef.current = null;
    }

    // Close data channel - this should be handled by useDataConnection
  }, []);

  const startCall = useCallback(async () => {
    if (!peerRef.current) {
      console.error("Peer not ready yet.");
      return;
    }
    if (!localStream) {
      console.error("Local stream not ready.");
      return;
    }
    if (!remotePeerId) {
      console.error("Enter remote Peer ID.");
      return;
    }
    if (callStatus !== CallStatus.READY && callStatus !== CallStatus.DISCONNECTED) {
      addLog("call", "invalid status for starting a call", callStatus);
      return;
    }

    try {
      // Data Channel
      let conn;
      try {
        conn = peerRef.current.connect(remotePeerId, { reliable: true });
      } catch (err) {
        addLog("data", "connect threw", err);
        console.error("Failed to connect Data Channel");
        return;
      }

      setupDataConnection(conn);

      conn.on("open", () => {
        addLog("data", "initiator data channel open");
      });

      conn.on("error", (e) => {
        addLog("data", "conn error", e);
      });

      // Media Call
      const call = peerRef.current.call(remotePeerId, localStream);
      callRef.current = call;

      call.on("stream", (stream) => {
        addLog("call", "remote stream received");
        setRemoteStream(stream);
      });

      call.on("error", (err) => {
        addLog("call", "error", err);
        endCall();
      });

      call.on("close", () => {
        addLog("call", "remote closed");
        endCall();
      });
    } catch (err) {
      console.error("startCall error", err);
    }
  }, [peerRef, localStream, remotePeerId, callStatus, setupDataConnection, addLog]);

  const answerCall = useCallback(async (incomingCall) => {
    if (!incomingCall) return;
    if (!localStream) {
      console.error("Local stream missing.");
      return;
    }

    try {
      incomingCall.answer(localStream);
      callRef.current = incomingCall;

      incomingCall.on("stream", (stream) => {
        addLog("call", "remote stream received");
        setRemoteStream(stream);
      });

      incomingCall.on("close", () => endCall());
      incomingCall.on("error", (err) => {
        addLog("call", "answer call error", err);
        endCall();
      });

      // Create data channel for the answerer
      const conn = peerRef.current.connect(incomingCall.peer, { reliable: true });
      setupDataConnection(conn);

      setIncomingCall(null);
    } catch (err) {
      console.error("answerCall err", err);
    }
  }, [localStream, addLog, setIncomingCall, peerRef, setupDataConnection]);



  return {
    startCall,
    answerCall,
    endCall,
  };
}
