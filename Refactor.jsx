import React, { useState,useCallback, useEffect, useRef } from "react";
import { usePeer } from "./hooks/usePeer";
import { useMedia } from "./hooks/useMedia";
import { useSpeechRecognition } from "./hooks/useSpeechRecognition";
import { useTranslation } from "./hooks/useTranslation";
import { useDataConnection } from "./hooks/useDataConnection";
import { useCall } from "./hooks/useCall";
import { VideoDisplay } from "./components/VideoDisplay";
import { Controls } from "./components/Controls";
import { Status } from "./components/Status";
import { IncomingCallModal } from "./components/IncomingCallModal";

export default function WebRTCWithTranslation1() {
  const [remotePeerId, setRemotePeerId] = useState("");
  const [sourceLang, setSourceLang] = useState("");
  const [targetLang, setTargetLang] = useState("ja");

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  /* ---------------- Media ---------------- */
  const {
    localStream,
    remoteStream,
    setRemoteStream,
    isMicOn,
    isCameraOn,
    isScreenSharing,
    toggleMic,
    toggleCamera,
    toggleScreenShare,
  } = useMedia();

  /* ---------------- Translation ---------------- */
  const {
    translator,
    translationStatus,
    initializeTranslatorFor,
    activeDirection,
  } = useTranslation();

  /* ---------------- Peer ---------------- */
  const {
    myPeerId,
    callStatus,
    errorMsg,
    incomingCall,
    setIncomingCall,
    peerRef,
    addLog,
  } = usePeer();

  /* ---------------- Data Channel ---------------- */
  const {
    dataConnRef,
    remoteFloatingText,
    setupDataConnection,
  } = useDataConnection(peerRef, targetLang, translator, addLog);

  /* ---------------- Speech Recognition ---------------- */
  const { isSpeechActive, toggleSpeech } = useSpeechRecognition(
    useCallback(async (text) => {
      // Translation handled separately via useTranslation
      return text;
    }, []),
    dataConnRef,
    addLog
  );

  /* ---------------- Call Handling ---------------- */
  const { startCall, answerCall, endCall } = useCall(
    peerRef,
    localStream,
    remotePeerId,
    callStatus,
    setupDataConnection,
    addLog,
    setIncomingCall,
    setRemoteStream
  );

  /* ---------------- Attach Streams ---------------- */
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-400">
        WebRTC Video Call with Translation
      </h1>

      {errorMsg && (
        <div className="bg-red-600 p-4 rounded-lg mb-4">
          {errorMsg}
        </div>
      )}

      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <VideoDisplay title="Your Video" videoRef={localVideoRef} />
        <VideoDisplay
          title="Remote Video"
          videoRef={remoteVideoRef}
          remoteFloatingText={remoteFloatingText}
        />
      </div>

      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-800 p-4 rounded-lg">
          <label className="block text-sm font-medium text-blue-300 mb-2">
            Your Peer ID
          </label>
          <input
            readOnly
            value={myPeerId || ""}
            className="w-full rounded-lg border border-gray-600 p-3 bg-gray-700"
          />
        </div>

        <div className="bg-gray-800 p-4 rounded-lg">
          <label className="block text-sm font-medium text-blue-300 mb-2">
            Friend's Peer ID
          </label>
          <input
            value={remotePeerId}
            onChange={(e) => setRemotePeerId(e.target.value)}
            placeholder="Enter friend's Peer ID"
            className="w-full rounded-lg border border-gray-600 p-3 bg-gray-700"
          />
        </div>
      </div>

      <Controls
        sourceLang={sourceLang}
        setSourceLang={setSourceLang}
        targetLang={targetLang}
        setTargetLang={setTargetLang}
        isSpeechActive={isSpeechActive}
        toggleSpeech={() => toggleSpeech(sourceLang)}
        activeDirection={activeDirection}
        initializeTranslatorFor={initializeTranslatorFor}
        isMicOn={isMicOn}
        toggleMic={toggleMic}
        isCameraOn={isCameraOn}
        toggleCamera={toggleCamera}
        isScreenSharing={isScreenSharing}
        toggleScreenShare={toggleScreenShare}
        callStatus={callStatus}
        startCall={startCall}
        endCall={endCall}
        remotePeerId={remotePeerId}
      />

      <IncomingCallModal
        incomingCall={incomingCall}
        answerCall={answerCall}
        setIncomingCall={setIncomingCall}
      />

      <Status
        callStatus={callStatus}
        dataConnRef={dataConnRef}
        translationStatus={translationStatus}
        isMicOn={isMicOn}
        isCameraOn={isCameraOn}
        isScreenSharing={isScreenSharing}
      />
    </div>
  );
}
