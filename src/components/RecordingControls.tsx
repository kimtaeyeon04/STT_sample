import { Mic, MicOff, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RecordingControlsProps {
  isListening: boolean;
  onStart: () => void;
  onStop: () => void;
  onReset: () => void;
  disabled?: boolean;
}

export function RecordingControls({
  isListening,
  onStart,
  onStop,
  onReset,
  disabled,
}: RecordingControlsProps) {
  return (
    <div className="flex items-center gap-3">
      {isListening ? (
        <Button
          onClick={onStop}
          variant="destructive"
          size="lg"
          className="gap-2 min-w-[160px]"
        >
          <MicOff className="w-5 h-5" />
          인식 중지
        </Button>
      ) : (
        <Button
          onClick={onStart}
          size="lg"
          className="gap-2 min-w-[160px]"
          disabled={disabled}
        >
          <Mic className="w-5 h-5" />
          음성 인식 시작
        </Button>
      )}

      <Button
        onClick={onReset}
        variant="outline"
        size="lg"
        disabled={isListening}
        className="gap-2"
      >
        <RotateCcw className="w-4 h-4" />
        초기화
      </Button>

      {isListening && (
        <div className="flex items-center gap-2 ml-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-recording opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-recording" />
          </span>
          <span className="text-sm font-medium text-recording">녹음 중...</span>
        </div>
      )}
    </div>
  );
}
