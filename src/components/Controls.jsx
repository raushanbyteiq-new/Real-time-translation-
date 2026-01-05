import React from "react";

const CallStatus = {
  DISCONNECTED: "DISCONNECTED",
  CONNECTING: "CONNECTING",
  READY: "READY",
  CALLING: "CALLING",
  IN_CALL: "IN_CALL",
};

export function Controls({
  sourceLang,
  setSourceLang,
  targetLang,
  setTargetLang,
  isSpeechActive,
  toggleSpeech,
  activeDirection,
  initializeTranslatorFor,
  isMicOn,
  toggleMic,
  isCameraOn,
  toggleCamera,
  isScreenSharing,
  toggleScreenShare,
  callStatus,
  startCall,
  endCall,
  remotePeerId,
}) {
  return (
    <div className="mb-6 bg-gray-800 p-4 rounded-lg">
      <h3 className="text-lg font-semibold mb-4 text-blue-300">Controls</h3>
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <select
          value={sourceLang}
          onChange={(e) => setSourceLang(e.target.value)}
          className="px-4 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white"
        >
          <option value="" disabled>Select Source Language</option>
          <option value="en">English (US)</option>
          <option value="es">Spanish (ES)</option>
          <option value="hi">Hindi (India)</option>
          <option value="fr">French (France)</option>
          <option value="de">German (Germany)</option>
          <option value="ja">Japanese</option>
        </select>

        <select
          value={targetLang}
          onChange={(e) => setTargetLang(e.target.value)}
          className="px-4 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white"
        >
          <option value="" disabled>Select Target Language</option>
          <option value="hi">Hindi</option>
          <option value="es">Spanish</option>
          <option value="fr">French</option>
          <option value="de">German</option>
          <option value="en">English</option>
          <option value="ja">Japanese</option>
        </select>

        <button
          onClick={toggleSpeech}
          disabled={!sourceLang}
          className={`px-4 py-2 rounded-lg font-medium ${
            isSpeechActive ? "bg-yellow-600 text-white" : "bg-blue-600 text-white hover:bg-blue-700"
          } ${!sourceLang ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {isSpeechActive ? "Stop STT" : "Start STT"}
        </button>

        <div className="flex gap-4">
          <button
            onClick={() => initializeTranslatorFor("JA_EN")}
            className={`px-4 py-2 rounded-lg font-medium
              ${activeDirection === "JA_EN"
                ? "bg-green-600"
                : "bg-gray-700 hover:bg-gray-600"}`}
          >
            JA → EN
          </button>

          <button
            onClick={() => initializeTranslatorFor("EN_JA")}
            className={`px-4 py-2 rounded-lg font-medium
              ${activeDirection === "EN_JA"
                ? "bg-green-600"
                : "bg-gray-700 hover:bg-gray-600"}`}
          >
            EN → JA
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <button
          onClick={toggleMic}
          className={`px-4 py-2 rounded-lg font-medium ${
            isMicOn ? "bg-green-600 text-white hover:bg-green-700" : "bg-red-600 text-white hover:bg-red-700"
          }`}
        >
          {isMicOn ? "Mic On" : "Mic Off"}
        </button>

        <button
          onClick={toggleCamera}
          className={`px-4 py-2 rounded-lg font-medium ${
            isCameraOn ? "bg-green-600 text-white hover:bg-green-700" : "bg-red-600 text-white hover:bg-red-700"
          }`}
        >
          {isCameraOn ? "Camera On" : "Camera Off"}
        </button>

        <button
          onClick={toggleScreenShare}
          className={`px-4 py-2 rounded-lg font-medium ${
            isScreenSharing ? "bg-orange-600 text-white hover:bg-orange-700" : "bg-indigo-600 text-white hover:bg-indigo-700"
          }`}
        >
          {isScreenSharing ? "Stop Share" : "Share Screen"}
        </button>

        <div className="ml-auto">
          {callStatus === CallStatus.IN_CALL ? (
            <button
              onClick={endCall}
              className="bg-red-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-red-700"
            >
              Hang Up
            </button>
          ) : (
            <button
              onClick={startCall}
              className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700"
              disabled={!remotePeerId || callStatus !== CallStatus.READY}
            >
              Call
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
