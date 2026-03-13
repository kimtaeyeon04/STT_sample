import { AlertCircle, CheckCircle2, Info } from "lucide-react";

interface StatusBarProps {
  error: string | null;
  isListening: boolean;
  wordCount: number;
}

export function StatusBar({ error, isListening, wordCount }: StatusBarProps) {
  if (error) {
    return (
      <div className="flex items-center gap-2 text-destructive bg-destructive/10 rounded-lg px-4 py-3 text-sm">
        <AlertCircle className="w-4 h-4 shrink-0" />
        {error}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between text-sm text-muted-foreground bg-muted/50 rounded-lg px-4 py-3">
      <div className="flex items-center gap-2">
        {isListening ? (
          <CheckCircle2 className="w-4 h-4 text-success" />
        ) : (
          <Info className="w-4 h-4" />
        )}
        <span>
          {isListening ? "음성을 인식하고 있습니다" : "준비 완료"}
        </span>
      </div>
      <span className="tabular-nums">단어 수: {wordCount}</span>
    </div>
  );
}
