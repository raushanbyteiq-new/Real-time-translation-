import {useState, useCallback, useEffect, useRef } from "react";

export function useDataConnection(peerRef, targetLang, translatorRef, addLog) {
  const dataConnRef = useRef(null);
  const [remoteFloatingText, setRemoteFloatingText] = useState("");

  const setupDataConnection = useCallback(
    (conn) => {
      if (!conn) return;
      if (dataConnRef.current && dataConnRef.current.peer !== conn.peer) {
        try { dataConnRef.current.close(); } catch {}
      }
      dataConnRef.current = conn;

      conn.on("open", () => {
        addLog("data", "open ->", conn.peer);
        try { conn.send(`TARGET_LANG:${targetLang}`); }
        catch (e) { addLog("data", "send TARGET_LANG failed", e.message); }
      });

      conn.on("data", async (data) => {
        if (typeof data === "string" && data.startsWith("TARGET_LANG:")) {
          addLog("data", "remote target lang:", data.split(":")[1]);
          return;
        }

        if (typeof data === "string") {
          let finalText = data;

          let currentTranslator = translatorRef.current;
          if (!currentTranslator) {
            setTranslationStatus("Translator needs manual initialization");
            addLog("ai", "Translator not ready - requires download, click 'Initialize Translator'");
            finalText = data;
          }
          if (currentTranslator) {
            try {
              setTranslationStatus("Translating...");
              addLog("ai", "Translating text...");
              finalText = await currentTranslator.translate(data);
              setTranslationStatus("Translation complete");
              addLog("ai", "Translation Complete!");
              setTranslationStatus("");
            } catch (err) {
              setTranslationStatus(`Translation error: ${err.message}`);
              addLog("ai", `Translation error: ${err.message}`);
            }
          }

          setRemoteFloatingText(finalText);
          addLog("data", "received:", finalText);
          setTimeout(() => setRemoteFloatingText(""), 5000);
        }
      });

      conn.on("close", () => {
        // cleanup
      });
      conn.on("error", (err) => {
        // error handling
      });
    },
    [addLog, targetLang, translatorRef]
  );

  useEffect(() => {
    if (dataConnRef.current) {
      dataConnRef.current.on("data", async (data) => {
        if (typeof data === "string" && data.startsWith("TARGET_LANG:")) {
          addLog("data", "remote target lang:", data.split(":")[1]);
          return;
        }

        if (typeof data === "string") {
          let finalText = data;

          let currentTranslator = translatorRef.current;
          if (!currentTranslator) {
            setTranslationStatus("Translator needs manual initialization");
            addLog("ai", "Translator not ready - requires download, click 'Initialize Translator'");
            finalText = data;
          }
          if (currentTranslator) {
            try {
              setTranslationStatus("Translating...");
              addLog("ai", "Translating text...");
              finalText = await currentTranslator.translate(data);
              setTranslationStatus("Translation complete");
              addLog("ai", "Translation Complete!");
              setTranslationStatus("");
            } catch (err) {
              setTranslationStatus(`Translation error: ${err.message}`);
              addLog("ai", `Translation error: ${err.message}`);
            }
          }

          setRemoteFloatingText(finalText);
          addLog("data", "received:", finalText);
          setTimeout(() => setRemoteFloatingText(""), 5000);
        }
      });
    }
  }, [translatorRef, addLog]);

  return {
    dataConnRef,
    remoteFloatingText,
    setupDataConnection,
  };
}
