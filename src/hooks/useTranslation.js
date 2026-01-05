import { useCallback, useState } from "react";

const DIRECTIONS = {
  JA_EN: { source: "ja", target: "en" },
  EN_JA: { source: "en", target: "ja" },
};

export function useTranslation() {
  const [activeDirection, setActiveDirection] = useState(null);
  const [translationStatus, setTranslationStatus] = useState("");
  const [translator, setTranslator] = useState(null);

  const getTranslatorAPI = useCallback(() => {
    if (self.translation) return self.translation;
    if (self.window && self.window.ai && self.window.ai.translator) return self.window.ai.translator;
    if (self.Translator) return self.Translator;
    return null;
  }, []);

  const initializeTranslatorFor = useCallback(
    async (directionKey) => {
      try {
        if (translator) {
          try {
            translator.destroy?.();
          } catch {}
          setTranslator(null);
        }

        setActiveDirection(directionKey);

        const { source, target } = DIRECTIONS[directionKey];

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
    [getTranslatorAPI, translator]
  );

  return {
    translator,
    translationStatus,
    setTranslationStatus,
    initializeTranslatorFor,
    activeDirection,
  };
}
