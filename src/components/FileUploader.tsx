import { useRef } from "react";
import { Upload, FileAudio, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
  progress: number;
}

export function FileUploader({ onFileSelect, isProcessing, progress }: FileUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
      e.target.value = "";
    }
  };

  return (
    <div className="space-y-4">
      <input
        ref={inputRef}
        type="file"
        accept="audio/*"
        onChange={handleChange}
        className="hidden"
      />

      <Button
        onClick={() => inputRef.current?.click()}
        variant="outline"
        size="lg"
        disabled={isProcessing}
        className="gap-2 w-full border-dashed border-2 h-20"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            파일 처리 중...
          </>
        ) : (
          <>
            <FileAudio className="w-5 h-5" />
            오디오 파일 업로드 (.mp3, .wav, .m4a 등)
          </>
        )}
      </Button>

      {isProcessing && (
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground text-center">
            {Math.round(progress)}% 완료
          </p>
        </div>
      )}
    </div>
  );
}
