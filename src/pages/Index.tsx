import { useState } from "react";
import { Stethoscope, Mic, FileAudio, Copy, Download } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useFileTranscription } from "@/hooks/useFileTranscription";
import { TranscriptDisplay } from "@/components/TranscriptDisplay";
import { RecordingControls } from "@/components/RecordingControls";
import { FileUploader } from "@/components/FileUploader";
import { StatusBar } from "@/components/StatusBar";

const Index = () => {
  const speech = useSpeechRecognition();
  const fileSTT = useFileTranscription();
  const [activeTab, setActiveTab] = useState("realtime");

  const activeSegments =
    activeTab === "realtime" ? speech.segments : fileSTT.segments;
  const activeError =
    activeTab === "realtime" ? speech.error : fileSTT.error;

  const totalWords = activeSegments.reduce(
    (sum, seg) => sum + seg.words.length,
    0
  );

  const fullText = activeSegments
    .map((seg) => seg.words.map((w) => w.text).join(" "))
    .join(" ");

  const handleCopy = () => {
    if (!fullText) return;
    navigator.clipboard.writeText(fullText);
    toast.success("클립보드에 복사되었습니다");
  };

  const handleDownload = () => {
    if (!fullText) return;
    const blob = new Blob([fullText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transcript_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("파일이 다운로드되었습니다");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground tracking-tight">
                MediScribe
              </h1>
              <p className="text-xs text-muted-foreground">
                병원 음성 인식 시스템
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              disabled={!fullText}
              className="gap-1.5"
            >
              <Copy className="w-4 h-4" />
              복사
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownload}
              disabled={!fullText}
              className="gap-1.5"
            >
              <Download className="w-4 h-4" />
              저장
            </Button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="container max-w-4xl mx-auto px-4 py-8 space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 max-w-sm">
            <TabsTrigger value="realtime" className="gap-2">
              <Mic className="w-4 h-4" />
              실시간 인식
            </TabsTrigger>
            <TabsTrigger value="file" className="gap-2">
              <FileAudio className="w-4 h-4" />
              파일 업로드
            </TabsTrigger>
          </TabsList>

          <TabsContent value="realtime" className="space-y-4 mt-6">
            <RecordingControls
              isListening={speech.isListening}
              onStart={speech.startListening}
              onStop={speech.stopListening}
              onReset={speech.resetTranscript}
              disabled={!speech.isSupported}
            />
            <TranscriptDisplay
              segments={speech.segments}
              interimText={speech.interimText}
              currentWordIndex={speech.currentWordIndex}
              showCursor={speech.isListening}
            />
          </TabsContent>

          <TabsContent value="file" className="space-y-4 mt-6">
            <FileUploader
              onFileSelect={fileSTT.transcribeFile}
              isProcessing={fileSTT.isProcessing}
              progress={fileSTT.progress}
            />
            <TranscriptDisplay segments={fileSTT.segments} />
          </TabsContent>
        </Tabs>

        <StatusBar
          error={activeError}
          isListening={speech.isListening}
          wordCount={totalWords}
        />
      </main>
    </div>
  );
};

export default Index;
