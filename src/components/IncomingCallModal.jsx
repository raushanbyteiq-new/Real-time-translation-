import React from "react";

export function IncomingCallModal({ incomingCall, answerCall, setIncomingCall }) {
  if (!incomingCall) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg space-y-4 max-w-sm w-full mx-4">
        <h3 className="text-xl font-semibold text-blue-300">Incoming Call</h3>
        <p className="text-gray-300">From: {incomingCall.peer}</p>
        <div className="flex space-x-4 justify-end">
          <button
            onClick={() => answerCall(incomingCall)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700"
          >
            Answer
          </button>
          <button
            onClick={() => setIncomingCall(null)}
            className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700"
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  );
}
