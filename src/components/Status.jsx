import React from "react";

export function Status({ callStatus, isTranslating, dataConnRef, translationStatus, isMicOn, isCameraOn, isScreenSharing }) {
  return (
    <div className="mt-6 bg-gray-800 p-4 rounded-lg text-sm text-gray-300">
      <h4 className="font-semibold mb-2 text-blue-300">Status</h4>
      <div className="grid grid-cols-2 gap-2">
        <div>Call Status: <span className="text-white">{callStatus}</span></div>
        <div>Translating: <span className="text-white">{isTranslating ? "Yes" : "No"}</span></div>
        <div>Data Channel: <span className="text-white">{dataConnRef.current ? (dataConnRef.current.open ? "Open" : "Closed") : "None"}</span></div>
        <div>Translation Status: <span className="text-white">{translationStatus}</span></div>
        <div>Mic: <span className="text-white">{isMicOn ? "On" : "Off"}</span></div>
        <div>Camera: <span className="text-white">{isCameraOn ? "On" : "Off"}</span></div>
        <div>Screen Share: <span className="text-white">{isScreenSharing ? "Active" : "Inactive"}</span></div>
      </div>
    </div>
  );
}
