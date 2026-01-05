import { useCallback, useRef, useState } from "react";

export function useSpeechRecognition(translateText, dataConnRef, addLog) {
  const [isSpeechActive, setIsSpeechActive] = useState(false);
  const recognitionRef = useRef(null);
  const isSpeechActiveRef = useRef(false);

  const startSpeechRecognition = useCallback((sourceLang) => {
    if (!("SpeechRecognition" in window || "webkitSpeechRecognition" in window)) {
      console.error("SpeechRecognition not supported.");
      return;
    }

    isSpeechActiveRef.current = true;
    setIsSpeechActive(true);

    const startInstance = () => {
      if (!isSpeechActiveRef.current) return;

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = false;
      recognition.lang = sourceLang || "en-US";
      recognition.interimResults = false;

      recognition.onresult = async (ev) => {
        try {
          const transcript = ev.results[0][0].transcript.trim();
          if (transcript.length > 0) {
            addLog("stt", "transcript:", transcript);

            const translated = await translateText(transcript);
            if (dataConnRef.current && dataConnRef.current.open) {
              dataConnRef.current.send(translated);
              addLog("data-send", translated);
            }
          }
        } catch (err) {
          console.error("onresult processing error", err);
        }
      };

      recognition.onerror = (event) => {
        if (event.error !== 'no-speech') {
          addLog("stt", "error (restarting):", event.error);
        }
      };

      recognition.onend = () => {
        if (isSpeechActiveRef.current) {
          setTimeout(() => {
            try {
              startInstance();
            } catch (e) {
              console.log("Restart failed", e);
            }
          }, 100);
        } else {
          addLog("stt", "Stopped manually.");
        }
      };

      recognitionRef.current = recognition;

      try {
        recognition.start();
      } catch (err) {
        // Sometimes it says "already started", which is fine.
      }
    };

    startInstance();
    addLog("stt", "Started (Robust Mode)");
  }, [translateText, dataConnRef, addLog]);

  const stopSpeechRecognition = useCallback(() => {
    isSpeechActiveRef.current = false;
    setIsSpeechActive(false);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
    addLog("stt", "Stopping...");
  }, [addLog]);

  const toggleSpeech = useCallback((sourceLang) => {
    if (isSpeechActive) stopSpeechRecognition();
    else startSpeechRecognition(sourceLang);
  }, [isSpeechActive, startSpeechRecognition, stopSpeechRecognition]);

  return {
    isSpeechActive,
    startSpeechRecognition,
    stopSpeechRecognition,
    toggleSpeech,
  };
}
