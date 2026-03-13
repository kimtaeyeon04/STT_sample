import type { TranscriptSegment } from "@/hooks/useSpeechRecognition";

interface TranscriptDisplayProps {
  segments: TranscriptSegment[];
  interimText?: string;
  currentWordIndex?: number;
  showCursor?: boolean;
}

export function TranscriptDisplay({
  segments,
  interimText = "",
  currentWordIndex = -1,
  showCursor = false,
}: TranscriptDisplayProps) {
  const interimWords = interimText.split(/\s+/).filter(Boolean);
  const hasContent = segments.length > 0 || interimWords.length > 0;

  return (
    <div className="min-h-[200px] max-h-[400px] overflow-y-auto rounded-lg bg-card border border-border p-6 font-sans">
      {!hasContent ? (
        <p className="text-muted-foreground text-center py-12 text-sm">
          음성 인식을 시작하면 여기에 텍스트가 표시됩니다...
        </p>
      ) : (
        <div className="leading-relaxed text-base space-y-1">
          {/* Final segments */}
          {segments.map((segment, sIdx) => (
            <span key={sIdx}>
              {segment.words.map((word, wIdx) => (
                <span
                  key={`${sIdx}-${wIdx}`}
                  className="text-foreground transition-colors duration-150"
                >
                  {word.text}
                  {wIdx < segment.words.length - 1 ? " " : ""}
                </span>
              ))}
              {sIdx < segments.length - 1 || interimWords.length > 0 ? " " : ""}
            </span>
          ))}

          {/* Interim (in-progress) words with cursor */}
          {interimWords.map((word, idx) => (
            <span
              key={`interim-${idx}`}
              className={`transition-all duration-150 ${
                idx === currentWordIndex && showCursor
                  ? "bg-accent text-accent-foreground rounded px-1 py-0.5 font-medium"
                  : "text-muted-foreground"
              }`}
            >
              {word}
              {idx === currentWordIndex && showCursor && (
                <span className="inline-block w-0.5 h-5 bg-primary ml-0.5 align-middle animate-cursor-blink" />
              )}
              {idx < interimWords.length - 1 ? " " : ""}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
