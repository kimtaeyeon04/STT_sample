import { useState, useRef, useCallback, useEffect } from "react";

export interface TranscriptWord {
  text: string;
  isFinal: boolean;
  timestamp: number;
}

export interface TranscriptSegment {
  words: TranscriptWord[];
  isFinal: boolean;
}

export function useSpeechRecognition() {
  const [isListening, setIsListening] = useState(false);
  const [segments, setSegments] = useState<TranscriptSegment[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [interimText, setInterimText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const segmentIndexRef = useRef(0);

  const isSupported =
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  const startListening = useCallback(() => {
    if (!isSupported) {
      setError("이 브라우저는 음성 인식을 지원하지 않습니다. Chrome을 사용해주세요.");
      return;
    }

    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SR();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "ko-KR";
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event: any) => {
      let interim = "";
      const newFinalSegments: TranscriptSegment[] = [];

      for (let i = segmentIndexRef.current; i < event.results.length; i++) {
        const result = event.results[i];
        const text = result[0].transcript.trim();

        if (result.isFinal) {
          const words = text.split(/\s+/).filter(Boolean).map((w) => ({
            text: w,
            isFinal: true,
            timestamp: Date.now(),
          }));
          newFinalSegments.push({ words, isFinal: true });
          segmentIndexRef.current = i + 1;
        } else {
          interim = text;
        }
      }

      if (newFinalSegments.length > 0) {
        setSegments((prev) => [...prev, ...newFinalSegments]);
      }

      setInterimText(interim);

      // Update current word index for cursor
      if (interim) {
        const interimWords = interim.split(/\s+/).filter(Boolean);
        setCurrentWordIndex(interimWords.length - 1);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === "not-allowed") {
        setError("마이크 접근이 거부되었습니다. 브라우저 설정에서 마이크를 허용해주세요.");
      } else if (event.error !== "aborted") {
        setError(`음성 인식 오류: ${event.error}`);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimText("");
    };

    recognitionRef.current = recognition;
    segmentIndexRef.current = 0;
    recognition.start();
  }, [isSupported]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
    setInterimText("");
    setCurrentWordIndex(-1);
  }, []);

  const resetTranscript = useCallback(() => {
    setSegments([]);
    setInterimText("");
    setCurrentWordIndex(-1);
    segmentIndexRef.current = 0;
  }, []);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  return {
    isListening,
    segments,
    interimText,
    currentWordIndex,
    error,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  };
}
