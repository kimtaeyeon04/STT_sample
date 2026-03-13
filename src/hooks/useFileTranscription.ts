import { useState, useCallback } from "react";
import type { TranscriptSegment } from "./useSpeechRecognition";

export function useFileTranscription() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [segments, setSegments] = useState<TranscriptSegment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const transcribeFile = useCallback(async (file: File) => {
    setIsProcessing(true);
    setError(null);
    setSegments([]);
    setProgress(0);

    try {
      // Use Web Speech API with audio element for file transcription
      const isSupported =
        "SpeechRecognition" in window || "webkitSpeechRecognition" in (window as any);

      if (!isSupported) {
        throw new Error("이 브라우저는 음성 인식을 지원하지 않습니다.");
      }

      const audioUrl = URL.createObjectURL(file);
      const audio = new Audio(audioUrl);

      await new Promise<void>((resolve, reject) => {
        audio.onloadedmetadata = () => resolve();
        audio.onerror = () => reject(new Error("오디오 파일을 로드할 수 없습니다."));
      });

      const duration = audio.duration;
      const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SR();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "ko-KR";

      const collectedSegments: TranscriptSegment[] = [];
      let segIndex = 0;

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        for (let i = segIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            const text = result[0].transcript.trim();
            const words = text.split(/\s+/).filter(Boolean).map((w) => ({
              text: w,
              isFinal: true,
              timestamp: Date.now(),
            }));
            collectedSegments.push({ words, isFinal: true });
            setSegments([...collectedSegments]);
            segIndex = i + 1;
          }
        }
        if (audio.currentTime && duration) {
          setProgress(Math.min((audio.currentTime / duration) * 100, 100));
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        if (event.error !== "aborted") {
          reject(new Error(`음성 인식 오류: ${event.error}`));
        }
      };

      const done = new Promise<void>((resolve, reject) => {
        recognition.onerror = (e: SpeechRecognitionErrorEvent) => {
          if (e.error !== "aborted" && e.error !== "no-speech") {
            reject(new Error(`음성 인식 오류: ${e.error}`));
          }
        };

        audio.onended = () => {
          setTimeout(() => {
            recognition.stop();
            setProgress(100);
            resolve();
          }, 2000);
        };
      });

      // Note: Browser SpeechRecognition uses the microphone, not audio files directly.
      // For file transcription, we simulate by playing audio through speakers
      // and capturing via microphone. In production, use a server-side STT API.
      recognition.start();
      audio.play();

      await done;

      URL.revokeObjectURL(audioUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.");
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const resetFile = useCallback(() => {
    setSegments([]);
    setError(null);
    setProgress(0);
  }, []);

  return {
    isProcessing,
    segments,
    error,
    progress,
    transcribeFile,
    resetFile,
  };
}
