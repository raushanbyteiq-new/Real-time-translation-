import React, { useCallback, useEffect, useRef, useState } from "react";
import Peer from "peerjs";
// import { TEXT_API_URL } from "./config/api";
/**
 * WebRTCWithTranslation.jsx
 *
 * Single-file component:
 * - PeerJS for audio/video + data channel
 * - Minimal Web Speech API (STT) built-in
 * - Sends translated text over data channel
 *
 * IMPORTANT: set TEXT_API_URL to your translation endpoint.
 */

// --- CONFIG ---
// const TEXT_API_URL = process.env.REACT_APP_TEXT_API_URL || ""; // provide your endpoint

const GEMINI_API_KEY="Akdwinskgeignkszifkw"; 
const iceServers = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
  { urls: "stun:stun2.l.google.com:19302" },
  { urls: "stun:stun3.l.google.com:19302" },
  { urls: "stun:stun4.l.google.com:19302" },
];

const TEXT_API_URL = "";
const peerConfig = {
  host: "0.peerjs.com",
  port: 443,
  secure: true,
  path: "/",
  debug: 2,
  config: { iceServers },
};

const CallStatus = {
  DISCONNECTED: "DISCONNECTED",
  CONNECTING: "CONNECTING",
  READY: "READY",
  CALLING: "CALLING",
  IN_CALL: "IN_CALL",
};

export default function WebRTCWithTranslation1() {
  // Peer + streams
  const [myPeerId, setMyPeerId] = useState("");
  const [remotePeerId, setRemotePeerId] = useState("");
  const [callStatus, setCallStatus] = useState(CallStatus.DISCONNECTED);
  const [incomingCall, setIncomingCall] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const DIRECTIONS = {
    JA_EN: { source: "ja", target: "en" },
    EN_JA: { source: "en", target: "ja" },
  };
  const [activeDirection, setActiveDirection] = useState(null);
  const [translationStatus, setTranslationStatus] = useState("");

  const [translator, setTranslator] = useState(null);

  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  // translation UI
  const [sourceLang, setSourceLang] = useState("");
  const [targetLang, setTargetLang] = useState("ja"); // e.g., Hindi captions
  // const [remoteFloatingText, setRemoteFloatingText] = useState("");
  const [remoteFloatingTexts, setRemoteFloatingTexts] = useState([]);

  const [isTranslating, setIsTranslating] = useState(false);

  // speech recognition
  const [isSpeechActive, setIsSpeechActive] = useState(false);

  // media controls
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);

  // refs
  const peerRef = useRef(null);
  const callRef = useRef(null);
  const dataConnRef = useRef(null);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const recognitionRef = useRef(null);
  const translatorRef = useRef(null);

  const videoTrackRef = useRef(null);
  const audioTrackRef = useRef(null);

  // assign stream -> video element reliably
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

  useEffect(() => {
    if (isSpeechActive) {
      stopSpeechRecognition();
      setTimeout(startSpeechRecognition, 150);
    }
  }, [activeDirection]);

  // Update translator ref
  useEffect(() => {
    translatorRef.current = translator;
  }, [translator]);

  // Restart Speech Recognition if language changes while active
  useEffect(() => {
    if (isSpeechActive && recognitionRef.current) {
      stopSpeechRecognition();
      // Small timeout to allow cleanup
      setTimeout(() => startSpeechRecognition(), 100);
    }
  }, [sourceLang]);

  // -----------------------------------
  // Helper: log
  // -----------------------------------
  const addLog = useCallback((tag, ...rest) => {
    console.log(`[${tag}]`, ...rest);
  }, []);


   // addRemoteCaption helper
    const addRemoteCaption = useCallback((text) => {
    const id = Date.now() + Math.random();

    setRemoteFloatingTexts((prev) => [...prev, { id, text }]);

    setTimeout(() => {
      setRemoteFloatingTexts((prev) => prev.filter((item) => item.id !== id));
    }, 5000);
  }, []);
  // -----------------------------------
  // Helper: getTranslatorAPI
  // -----------------------------------
  const getTranslatorAPI = useCallback(() => {
    if (self.translation) return self.translation; // Old standard
    if (self.window && self.window.ai && self.window.ai.translator)
      return self.window.ai.translator; // Newest standard
    if (self.Translator) return self.Translator; // Alternative
    return null;
  }, []);

  // -----------------------------------
  // Initialize Translator (requires user gesture)
  // -----------------------------------
  const initializeTranslatorFor = useCallback(
    async (directionKey) => {
      try {
        // 1️⃣ If some translator already exists → destroy it
        if (translatorRef.current) {
          try {
            translatorRef.current.destroy?.(); // if supported
          } catch {}
          setTranslator(null);
        }

        // 2️⃣ Update UI state FIRST
        setActiveDirection(directionKey);

        const { source, target } = DIRECTIONS[directionKey];
        setSourceLang(source);
        setTargetLang(target);

        // 3️⃣ Normal initialization logic
        const api = getTranslatorAPI();
        if (!api) {
          setTranslationStatus("API not found");
          return;
        }

        setTranslationStatus("Checking availability...");

        const languagePair = {
          sourceLanguage: source,
          targetLanguage: target,
        };

        let availability = "readily";
        if (api.canTranslate) {
          availability = await api.canTranslate(languagePair);
        }

        if (availability === "no") {
          setTranslationStatus("Model not available");
          return;
        }

        setTranslationStatus("Creating translator...");

        const createFn = api.create || api.createTranslator;
        const trans = await createFn.call(api, languagePair);

        setTranslator(trans);
        setTranslationStatus("Translator ready");
      } catch (err) {
        setTranslationStatus(`Error: ${err.message}`);
      }
    },
    [getTranslatorAPI]
  );

  // -----------------------------------
  // Media Control Functions
  // -----------------------------------
  const toggleMic = useCallback(() => {
    if (audioTrackRef.current) {
      audioTrackRef.current.enabled = !audioTrackRef.current.enabled;
      setIsMicOn(audioTrackRef.current.enabled);
    }
  }, []);

  const toggleCamera = useCallback(() => {
    if (videoTrackRef.current) {
      videoTrackRef.current.enabled = !videoTrackRef.current.enabled;
      setIsCameraOn(videoTrackRef.current.enabled);
    }
  }, []);

  const toggleScreenShare = useCallback(async () => {
    if (isScreenSharing) {
      // Stop screenshare, switch back to camera if available
      try {
        let videoTrack = null;
        if (isCameraOn) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
          });
          videoTrack = stream.getVideoTracks()[0];
        }
        if (callRef.current) {
          const sender = callRef.current.peerConnection
            .getSenders()
            .find((s) => s.track && s.track.kind === "video");
          if (sender) {
            sender.replaceTrack(videoTrack);
          }
        }
        videoTrackRef.current = videoTrack;
        setIsScreenSharing(false);
        // Update local stream for display
        setLocalStream((prev) => {
          const newStream = new MediaStream();
          if (videoTrack) newStream.addTrack(videoTrack);
          if (audioTrackRef.current) newStream.addTrack(audioTrackRef.current);
          return newStream;
        });
      } catch (err) {
        console.error("Error stopping screenshare", err);
      }
    } else {
      // Start screenshare
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
        });
        const videoTrack = stream.getVideoTracks()[0];
        if (callRef.current) {
          const sender = callRef.current.peerConnection
            .getSenders()
            .find((s) => s.track && s.track.kind === "video");
          if (sender) {
            sender.replaceTrack(videoTrack);
          }
        }
        videoTrackRef.current = videoTrack;
        setIsScreenSharing(true);
        // Update local stream for display
        setLocalStream((prev) => {
          const newStream = new MediaStream();
          newStream.addTrack(videoTrack);
          if (audioTrackRef.current) newStream.addTrack(audioTrackRef.current);
          return newStream;
        });
      } catch (err) {
        console.error("Error starting screenshare", err);
      }
    }
  }, [isScreenSharing]);

  // -----------------------------------
  // Minimal Translation function
  // Replace with your robust API / auth as needed.
  // -----------------------------------
  const translateText = useCallback(
    async (text) => {
      if (!TEXT_API_URL) {
        // no API configured: just return the original for testing
        return text;
      }
      try {
        setIsTranslating(true);
        const prompt = `Translate this text to ${targetLang}: "${text}"`;
        const payload = {
          contents: [{ parts: [{ text: prompt }] }],
          systemInstruction: {
            parts: [{ text: "Return only the translated text." }],
          },
        };

        // const res = await fetch(TEXT_API_URL, {
        //   method: "POST",
        //   headers: { "Content-Type": "application/json" },
        //   body: JSON.stringify(payload),
        // });
        // if (!res.ok) throw new Error("Translation API returned error");
        // const json = await res.json();
        // // adapt to the response shape you get from your API
        // const translated =
        //   json?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
        //   json?.translatedText ||
        //   "";
        return text;
      } catch (err) {
        console.error("translateText error:", err);
        return text; // fallback to original
      } finally {
        setIsTranslating(false);
      }
    },
    [targetLang]
  );

  // Reset translator when target language changes
  useEffect(() => {
    setTranslator(null);
    setTranslationStatus("");
  }, [targetLang]);

  // -----------------------------------
  // Initialize Peer + getUserMedia
  // -----------------------------------
  const initializePeer = useCallback(async () => {
    // Prevent double initialization
    if (peerRef.current) return;

    setCallStatus(CallStatus.CONNECTING);

    try {
      // Try to get video and audio; if video fails, get audio only
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
      } catch (videoErr) {
        console.warn("Camera access denied, trying audio only", videoErr);
        stream = await navigator.mediaDevices.getUserMedia({
          video: false,
          audio: true,
        });
        setIsCameraOn(false);
      }

      setLocalStream(stream);
      videoTrackRef.current = stream.getVideoTracks()[0] || null;
      audioTrackRef.current = stream.getAudioTracks()[0] || null;

      const peer = new Peer(undefined, {
        ...peerConfig,
        pingInterval: 5000, // keep WS alive
        debug: 2,
      });

      peerRef.current = peer;

      peer.on("open", (id) => {
        addLog("peer", "open", id);
        setMyPeerId(id);
        setCallStatus(CallStatus.READY);
      });

      // Incoming data channel
      peer.on("connection", (conn) => {
        addLog("peer", "data-connection", conn.peer);
        setupDataConnection(conn);
      });

      // Incoming media call
      peer.on("call", (call) => {
        addLog("peer", "incoming-call", call.peer);
        setIncomingCall(call);
      });

      // 🔴 IMPORTANT: reconnect on signaling drop
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
      setErrorMsg("Media access denied");
      setCallStatus(CallStatus.DISCONNECTED);
    }
  }, [addLog, peerConfig]);

  useEffect(() => {
    initializePeer();

    return () => {
      // 🔇 Stop speech recognition safely
      if (recognitionRef.current) {
        try {
          recognitionRef.current.onresult = null;
          recognitionRef.current.onend = null;
          recognitionRef.current.onerror = null;
          recognitionRef.current.stop?.();
        } catch {}
        recognitionRef.current = null;
      }

      // 📞 Close active call
      if (callRef.current) {
        try {
          callRef.current.close();
        } catch {}
        callRef.current = null;
      }

      // 📡 Close data channel
      if (dataConnRef.current) {
        try {
          dataConnRef.current.close();
        } catch {}
        dataConnRef.current = null;
      }

      // ❗ DO NOT destroy peer here
      // peerRef.current.destroy(); ❌
      // Peer must survive component remounts

      // 🎤 Stop media tracks
      if (localStream) {
        localStream.getTracks().forEach((t) => {
          try {
            t.stop();
          } catch {}
        });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const leaveCall = () => {
    if (peerRef.current) {
      peerRef.current.destroy(); // ✅ ONLY HERE
      peerRef.current = null;
    }
    setCallStatus(CallStatus.DISCONNECTED);
  };
  // -----------------------------------
  // Data connection helper
  // -----------------------------------
const setupDataConnection = useCallback((conn) => {
  if (!conn) return;

  dataConnRef.current = conn;

  conn.on("data", async (data) => {
    if (typeof data !== "string") return;

    let finalText = data;

    const currentTranslator = translatorRef.current;
    if (currentTranslator) {
      try {
        finalText = await currentTranslator.translate(data);
      } catch {}
    }

    addRemoteCaption(finalText);
  });
}, [addRemoteCaption]);


  // Helper to add floating caption


  // Update data handler when translator changes
  // useEffect(() => {
  //   if (dataConnRef.current) {
  //     dataConnRef.current.on("data", async (data) => {
  //       // 1. Control Messages
  //       if (typeof data === "string" && data.startsWith("TARGET_LANG:")) {
  //         addLog("data", "remote target lang:", data.split(":")[1]);
  //         return;
  //       }

  //       // 2. Text Messages
  //       if (typeof data === "string") {
  //         let finalText = data;

  //         // --- CHROME AI INTEGRATION START ---
  //         let currentTranslator = translatorRef.current;
  //         if (!currentTranslator) {
  //           // Do not auto-initialize to avoid NotAllowedError
  //           setTranslationStatus("Translator needs manual initialization");
  //           addLog(
  //             "ai",
  //             "Translator not ready - requires download, click 'Initialize Translator'"
  //           );
  //           finalText = data; // no translation
  //         }
  //         if (currentTranslator) {
  //           try {
  //             setTranslationStatus("Translating...");
  //             addLog("ai", "Translating text...");
  //             finalText = await currentTranslator.translate(data);
  //             setTranslationStatus("Translation complete");
  //             addLog("ai", "Translation Complete!");
  //             setTranslationStatus("");
  //           } catch (err) {
  //             setTranslationStatus(`Translation error: ${err.message}`);
  //             addLog("ai", `Translation error: ${err.message}`);
  //           }
  //         }
  //         // --- CHROME AI INTEGRATION END ---

  //         addRemoteCaption(finalText);
  //       }
  //     });
  //   }
  // }, [translator, addLog]);

  // -----------------------------------
  // Start Call (initiator)
  // -----------------------------------
  const startCall = useCallback(async () => {
    if (!peerRef.current) {
      setErrorMsg("Peer not ready yet.");
      return;
    }
    if (!localStream) {
      setErrorMsg("Local stream not ready.");
      return;
    }
    if (!remotePeerId) {
      setErrorMsg("Enter remote Peer ID.");
      return;
    }
    if (
      callStatus !== CallStatus.READY &&
      callStatus !== CallStatus.DISCONNECTED
    ) {
      addLog("call", "invalid status for starting a call", callStatus);
      // don't block, but return
      return;
    }

    setErrorMsg("");
    setCallStatus(CallStatus.CALLING);

    try {
      // --- Data Channel ---
      let conn;
      try {
        conn = peerRef.current.connect(remotePeerId, { reliable: true });
      } catch (err) {
        addLog("data", "connect threw", err);
        setErrorMsg("Failed to connect Data Channel");
        setCallStatus(CallStatus.READY);
        return;
      }

      setupDataConnection(conn);

      conn.on("open", () => {
        addLog("data", "initiator data channel open");
      });

      conn.on("error", (e) => {
        addLog("data", "conn error", e);
      });

      // --- Media Call ---
      const call = peerRef.current.call(remotePeerId, localStream);
      callRef.current = call;

      call.on("stream", (stream) => {
        addLog("call", "remote stream received");
        setRemoteStream(stream);
        setCallStatus(CallStatus.IN_CALL);
      });

      call.on("error", (err) => {
        addLog("call", "error", err);
        setErrorMsg("Call failed.");
        endCall();
      });

      call.on("close", () => {
        addLog("call", "remote closed");
        endCall();
      });
    } catch (err) {
      console.error("startCall error", err);
      setErrorMsg("Call setup failed.");
      setCallStatus(CallStatus.READY);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localStream, remotePeerId, callStatus, setupDataConnection, addLog]);

  // -----------------------------------
  // Answer incoming call
  // -----------------------------------
  const answerCall = useCallback(async () => {
    if (!incomingCall) return;
    if (!localStream) return setErrorMsg("Local stream missing.");

    try {
      incomingCall.answer(localStream);
      callRef.current = incomingCall;

      incomingCall.on("stream", (stream) => {
        setRemoteStream(stream);
        setCallStatus(CallStatus.IN_CALL);
      });

      incomingCall.on("close", () => endCall());
      incomingCall.on("error", (err) => {
        addLog("call", "answer call error", err);
        endCall();
      });

      setIncomingCall(null);
    } catch (err) {
      console.error("answerCall err", err);
      setErrorMsg("Failed to answer call.");
    }
  }, [incomingCall, localStream, addLog]);

  // -----------------------------------
  // End call
  // -----------------------------------
  const endCall = useCallback(() => {
    // stop media call
    if (callRef.current) {
      try {
        callRef.current.close();
      } catch {}
      callRef.current = null;
    }
    // close data channel
    if (dataConnRef.current) {
      try {
        dataConnRef.current.close();
      } catch {}
      dataConnRef.current = null;
    }

    // stop STT
    stopSpeechRecognition();

    setRemoteStream(null);
    setCallStatus(CallStatus.READY);
  }, []);

  // -----------------------------------
  // Speech Recognition (minimal)
  // -----------------------------------
  // 1. Add this REF at the top of your component (inside the function)
  // This tracks if the user WANTS STT to be on, regardless of what the browser thinks.
  const isSpeechActiveRef = useRef(false);

  // -----------------------------------
  // Speech Recognition (Robust "Restart" Loop)
  // -----------------------------------
  const startSpeechRecognition = useCallback(() => {
    // Basic Check
    if (
      !("SpeechRecognition" in window || "webkitSpeechRecognition" in window)
    ) {
      setErrorMsg("SpeechRecognition not supported.");
      return;
    }

    // Update Intent: We WANT it to run
    isSpeechActiveRef.current = true;
    setIsSpeechActive(true);

    // Define the runner function
    const startInstance = () => {
      // If user pressed "Stop", don't restart
      if (!isSpeechActiveRef.current) return;

      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      // ⚠️ THE MAGIC FIX: Set this to FALSE
      // This prevents the "Zombie" freeze. It stops after every sentence,
      // allowing us to cleanly restart it in 'onend'.
      recognition.continuous = false;

      recognition.lang = sourceLang || "en-US";
      recognition.interimResults = false;

      recognition.onresult = async (ev) => {
        try {
          const transcript = ev.results[0][0].transcript.trim();
          if (transcript.length > 0) {
            // addLog("stt", "transcript:", transcript);

            // Translate & Send
            const translated = await translateText(transcript);
            if (dataConnRef.current && dataConnRef.current.open) {
              dataConnRef.current.send(translated);
              // addLog("data-send", translated);
            }
          }
        } catch (err) {
          console.error("onresult processing error", err);
        }
      };

      // ERROR HANDLER: If it errors (like 'no-speech'), just restart
      recognition.onerror = (event) => {
        // Ignore trivial errors, but log others
        if (event.error !== "no-speech") {
          addLog("stt", "error (restarting):", event.error);
        }
      };

      // ON END: The vital loop
      recognition.onend = () => {
        // If the user still wants it on, RESTART immediately
        if (isSpeechActiveRef.current) {
          // Small delay prevents CPU overload if it crashes rapidly
          setTimeout(() => {
            try {
              startInstance(); // <--- RECURSIVE RESTART
            } catch (e) {
              console.log("Restart failed", e);
            }
          }, 1);
        } else {
          addLog("stt", "Stopped manually.");
        }
      };

      // Save reference so we can kill it manually if needed
      recognitionRef.current = recognition;

      try {
        recognition.start();
      } catch (err) {
        // Sometimes it says "already started", which is fine.
      }
    };

    // Kick off the loop
    startInstance();
    addLog("stt", "Started (Robust Mode)");
  }, [addLog, sourceLang, translateText]);

  const stopSpeechRecognition = useCallback(() => {
    // Update Intent: We WANT it to stop
    isSpeechActiveRef.current = false;
    setIsSpeechActive(false);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop(); // This triggers onend, which sees the flag is false, and stops.
      } catch {}
      recognitionRef.current = null;
    }
    addLog("stt", "Stopping...");
  }, [addLog]);
  // toggle expose
  const toggleSpeech = useCallback(() => {
    if (isSpeechActive) stopSpeechRecognition();
    else startSpeechRecognition();
  }, [isSpeechActive, startSpeechRecognition, stopSpeechRecognition]);

  // -----------------------------------
  // UI
  // -----------------------------------
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-400">
        WebRTC Video Call with Translation
      </h1>

      {errorMsg && (
        <div className="bg-red-600 p-4 rounded-lg text-white mb-4">
          {errorMsg}
        </div>
      )}

      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800 p-4 rounded-lg">
          <h4 className="font-semibold mb-3 text-blue-300">Your Video</h4>
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="w-full rounded-lg shadow-lg bg-black"
          />
        </div>

        <div className="relative bg-gray-800 p-4 rounded-lg">
          <h4 className="font-semibold mb-3 text-blue-300">Remote Video</h4>

          <div className="absolute left-1/2 transform -translate-x-1/2 bottom-4 space-y-2 z-20">
            {remoteFloatingTexts.map((item) => (
              <div
                key={item.id}
                className="px-4 py-2 rounded-lg text-white text-sm bg-black bg-opacity-70"
              >
                {item.text}
              </div>
            ))}
          </div>

          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full rounded-lg shadow-lg bg-black"
          />
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-800 p-4 rounded-lg">
          <label className="block text-sm font-medium text-blue-300 mb-2">
            Your Peer ID
          </label>
          <input
            readOnly
            value={myPeerId}
            className="w-full rounded-lg border border-gray-600 p-3 bg-gray-700 text-white"
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
            className="w-full rounded-lg border border-gray-600 p-3 bg-gray-700 text-white"
          />
        </div>
      </div>

      <div className="mb-6 bg-gray-800 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-4 text-blue-300">Controls</h3>
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <select
            value={sourceLang}
            onChange={(e) => setSourceLang(e.target.value)}
            className="px-4 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white"
          >
            <option value="" disabled>
              Select Source Language
            </option>
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
            <option value="" disabled>
              Select Target Language
            </option>
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
              isSpeechActive
                ? "bg-yellow-600 text-white"
                : "bg-blue-600 text-white hover:bg-blue-700"
            } ${!sourceLang ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {isSpeechActive ? "Stop STT" : "Start STT"}
          </button>

          <div className="flex gap-4">
            <button
              onClick={() => initializeTranslatorFor("JA_EN")}
              className={`px-4 py-2 rounded-lg font-medium
      ${
        activeDirection === "JA_EN"
          ? "bg-green-600"
          : "bg-gray-700 hover:bg-gray-600"
      }`}
            >
              JA → EN
            </button>

            <button
              onClick={() => initializeTranslatorFor("EN_JA")}
              className={`px-4 py-2 rounded-lg font-medium
      ${
        activeDirection === "EN_JA"
          ? "bg-green-600"
          : "bg-gray-700 hover:bg-gray-600"
      }`}
            >
              EN → JA
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={toggleMic}
            className={`px-4 py-2 rounded-lg font-medium ${
              isMicOn
                ? "bg-green-600 text-white hover:bg-green-700"
                : "bg-red-600 text-white hover:bg-red-700"
            }`}
          >
            {isMicOn ? "Mic On" : "Mic Off"}
          </button>

          <button
            onClick={toggleCamera}
            className={`px-4 py-2 rounded-lg font-medium ${
              isCameraOn
                ? "bg-green-600 text-white hover:bg-green-700"
                : "bg-red-600 text-white hover:bg-red-700"
            }`}
          >
            {isCameraOn ? "Camera On" : "Camera Off"}
          </button>

          <button
            onClick={toggleScreenShare}
            className={`px-4 py-2 rounded-lg font-medium ${
              isScreenSharing
                ? "bg-orange-600 text-white hover:bg-orange-700"
                : "bg-indigo-600 text-white hover:bg-indigo-700"
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

      {/* Incoming call modal */}
      {incomingCall && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg space-y-4 max-w-sm w-full mx-4">
            <h3 className="text-xl font-semibold text-blue-300">
              Incoming Call
            </h3>
            <p className="text-gray-300">From: {incomingCall.peer}</p>
            <div className="flex space-x-4 justify-end">
              <button
                onClick={answerCall}
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
      )}

      <div className="mt-6 bg-gray-800 p-4 rounded-lg text-sm text-gray-300">
        <h4 className="font-semibold mb-2 text-blue-300">Status</h4>
        <div className="grid grid-cols-2 gap-2">
          <div>
            Call Status: <span className="text-white">{callStatus}</span>
          </div>
          <div>
            Translating:{" "}
            <span className="text-white">{isTranslating ? "Yes" : "No"}</span>
          </div>
          <div>
            Data Channel:{" "}
            <span className="text-white">
              {dataConnRef.current
                ? dataConnRef.current.open
                  ? "Open"
                  : "Closed"
                : "None"}
            </span>
          </div>
          <div>
            Translation Status:{" "}
            <span className="text-white">{translationStatus}</span>
          </div>
          <div>
            Mic: <span className="text-white">{isMicOn ? "On" : "Off"}</span>
          </div>
          <div>
            Camera:{" "}
            <span className="text-white">{isCameraOn ? "On" : "Off"}</span>
          </div>
          <div>
            Screen Share:{" "}
            <span className="text-white">
              {isScreenSharing ? "Active" : "Inactive"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
