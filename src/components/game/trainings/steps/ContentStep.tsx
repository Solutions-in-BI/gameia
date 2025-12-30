/**
 * ContentStep - Video, text, PDF, or link content
 */

import { useState, useRef, useEffect } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  CheckCircle,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { NoteButton, ModuleNotesPanel } from "@/components/notes";
import type { EnhancedTrainingModule, StepResult } from "@/types/training";

interface ContentStepProps {
  module: EnhancedTrainingModule;
  onComplete: (result: StepResult) => void;
  onCancel: () => void;
}

export function ContentStep({ module, onComplete, onCancel }: ContentStepProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [currentTimestamp, setCurrentTimestamp] = useState(0);
  const [startTime] = useState(Date.now());
  const [canComplete, setCanComplete] = useState(false);
  const [selectedText, setSelectedText] = useState<string | undefined>(undefined);

  const contentType = module.step_config?.content_type || module.content_type;

  useEffect(() => {
    // For text content, allow completion after some time
    if (contentType === 'text') {
      const timer = setTimeout(() => setCanComplete(true), 5000);
      return () => clearTimeout(timer);
    }
  }, [contentType]);

  const handleVideoTimeUpdate = () => {
    if (videoRef.current) {
      const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setVideoProgress(progress);
      setCurrentTimestamp(Math.floor(videoRef.current.currentTime));
      if (progress >= 90) {
        setCanComplete(true);
      }
    }
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
    setCanComplete(true);
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen();
      }
    }
  };

  const handleComplete = () => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    onComplete({
      completed: true,
      score: 100,
      passed: true,
      timeSpent,
    });
  };

  // Handle text selection for annotations
  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0) {
      setSelectedText(selection.toString().trim());
    } else {
      setSelectedText(undefined);
    }
  };

  const getNoteContentType = () => {
    if (contentType === 'video') return 'video';
    if (contentType === 'pdf') return 'pdf';
    if (contentType === 'link') return 'link';
    return 'text';
  };

  return (
    <Card>
      <CardContent className="p-0">
        {/* Note Button - Top Right */}
        <div className="p-4 flex justify-end">
          <NoteButton
            trainingId={module.training_id}
            moduleId={module.id}
            contentType={getNoteContentType()}
            currentTimestamp={contentType === 'video' ? currentTimestamp : undefined}
            selectedText={selectedText}
            variant="inline"
          />
        </div>

        {/* Video Content */}
        {contentType === 'video' && module.video_url && (
          <div className="relative bg-black aspect-video">
            <video
              ref={videoRef}
              src={module.video_url}
              className="w-full h-full"
              onTimeUpdate={handleVideoTimeUpdate}
              onLoadedMetadata={(e) => setVideoDuration((e.target as HTMLVideoElement).duration)}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={handleVideoEnded}
            />

            {/* Video Controls */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
              <Progress value={videoProgress} className="h-1 mb-3" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                    onClick={togglePlay}
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                    onClick={toggleMute}
                  >
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </Button>
                  <span className="text-sm text-white/80">
                    {formatTime((videoProgress / 100) * videoDuration)} / {formatTime(videoDuration)}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                  onClick={toggleFullscreen}
                >
                  <Maximize className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Text Content */}
        {contentType === 'text' && (
          <div 
            className="p-6 prose prose-lg dark:prose-invert max-w-none"
            onMouseUp={handleTextSelection}
          >
            {(module.content_data?.text_content as string) || (
              <p className="text-muted-foreground">Sem conteúdo disponível</p>
            )}
          </div>
        )}

        {/* PDF Content */}
        {contentType === 'pdf' && module.content_data?.pdf_url && (
          <iframe
            src={module.content_data.pdf_url as string}
            className="w-full h-[600px]"
            title={module.name}
            onLoad={() => setCanComplete(true)}
          />
        )}

        {/* Link Content */}
        {contentType === 'link' && module.content_data?.external_url && (
          <div className="p-8 text-center">
            <ExternalLink className="w-16 h-16 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Recurso Externo</h3>
            <p className="text-muted-foreground mb-6">
              Acesse o recurso externo para completar esta etapa.
            </p>
            <Button
              asChild
              onClick={() => setCanComplete(true)}
            >
              <a
                href={module.content_data.external_url as string}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Abrir Link
              </a>
            </Button>
          </div>
        )}

        {/* Module Notes Panel */}
        <div className="px-4 pb-2">
          <ModuleNotesPanel 
            trainingId={module.training_id} 
            moduleId={module.id} 
          />
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border flex justify-end">
          <Button
            onClick={handleComplete}
            disabled={!canComplete}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Marcar como Concluído
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
