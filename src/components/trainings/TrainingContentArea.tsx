import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  FileText, 
  ExternalLink,
  Download,
  Clock,
  Award,
  Coins
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { TrainingModule } from "./TrainingPlayerLayout";

interface TrainingContentAreaProps {
  module: TrainingModule;
  contentData?: Record<string, unknown> | null;
  videoUrl?: string | null;
  onVideoProgress?: (progress: number, duration: number) => void;
  onContentComplete?: () => void;
}

export function TrainingContentArea({
  module,
  contentData,
  videoUrl,
  onVideoProgress,
  onContentComplete,
}: TrainingContentAreaProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);

  const contentType = (contentData?.content_type as string) || module.content_type;
  const textContent = contentData?.text_content as string | undefined;
  const pdfUrl = contentData?.pdf_url as string | undefined;
  const linkUrl = contentData?.link_url as string | undefined;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      if (video.duration && onVideoProgress) {
        onVideoProgress(video.currentTime / video.duration * 100, video.currentTime);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      onContentComplete?.();
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('ended', handleEnded);
    };
  }, [onVideoProgress, onContentComplete]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleSeek = (value: number[]) => {
    const video = videoRef.current;
    if (!video || !duration) return;
    video.currentTime = (value[0] / 100) * duration;
  };

  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      video.requestFullscreen();
    }
  };

  const changePlaybackRate = () => {
    const rates = [1, 1.25, 1.5, 1.75, 2];
    const currentIndex = rates.indexOf(playbackRate);
    const newRate = rates[(currentIndex + 1) % rates.length];
    setPlaybackRate(newRate);
    if (videoRef.current) {
      videoRef.current.playbackRate = newRate;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      {/* Module Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">{module.name}</h1>
        {module.description && (
          <p className="text-muted-foreground">{module.description}</p>
        )}
        
        {/* Module Meta */}
        <div className="flex flex-wrap items-center gap-3 text-sm">
          {module.time_minutes && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{module.time_minutes} min</span>
            </div>
          )}
          {module.xp_reward && module.xp_reward > 0 && (
            <Badge variant="secondary" className="gap-1">
              <Award className="h-3 w-3 text-amber-500" />
              {module.xp_reward} XP
            </Badge>
          )}
          {module.coins_reward && module.coins_reward > 0 && (
            <Badge variant="secondary" className="gap-1">
              <Coins className="h-3 w-3 text-yellow-500" />
              {module.coins_reward}
            </Badge>
          )}
          {module.is_checkpoint && (
            <Badge variant="outline" className="text-amber-600 border-amber-600">
              Checkpoint
            </Badge>
          )}
        </div>
      </div>

      {/* Video Content */}
      {(contentType === 'video' || videoUrl) && (
        <Card className="overflow-hidden">
          <div className="relative aspect-video bg-black">
            <video
              ref={videoRef}
              src={videoUrl || (contentData?.video_url as string)}
              className="w-full h-full"
              onClick={togglePlay}
            />
            
            {/* Play/Pause Overlay */}
            {!isPlaying && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={togglePlay}
                className="absolute inset-0 flex items-center justify-center bg-black/30"
              >
                <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center">
                  <Play className="h-8 w-8 text-primary-foreground ml-1" />
                </div>
              </motion.button>
            )}

            {/* Video Controls */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              {/* Progress Bar */}
              <Slider
                value={[progress]}
                max={100}
                step={0.1}
                onValueChange={handleSeek}
                className="mb-3"
              />

              <div className="flex items-center justify-between text-white">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={togglePlay}
                    className="text-white hover:bg-white/20"
                  >
                    {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleMute}
                    className="text-white hover:bg-white/20"
                  >
                    {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                  </Button>

                  <span className="text-sm">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={changePlaybackRate}
                    className="text-white hover:bg-white/20 text-xs"
                  >
                    {playbackRate}x
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleFullscreen}
                    className="text-white hover:bg-white/20"
                  >
                    <Maximize className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Text Content */}
      {contentType === 'text' && textContent && (
        <Card>
          <CardContent className="p-6 prose prose-sm dark:prose-invert max-w-none">
            <div 
              dangerouslySetInnerHTML={{ __html: textContent }}
              className="whitespace-pre-wrap"
            />
          </CardContent>
        </Card>
      )}

      {/* PDF Content */}
      {contentType === 'pdf' && pdfUrl && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5" />
              Material em PDF
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-[4/5] bg-muted rounded-lg overflow-hidden">
              <iframe
                src={`${pdfUrl}#toolbar=0`}
                className="w-full h-full"
                title="PDF Viewer"
              />
            </div>
            <div className="mt-4 flex gap-2">
              <Button variant="outline" asChild className="gap-2">
                <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                  Abrir em nova aba
                </a>
              </Button>
              <Button variant="outline" asChild className="gap-2">
                <a href={pdfUrl} download>
                  <Download className="h-4 w-4" />
                  Baixar
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Link Content */}
      {contentType === 'link' && linkUrl && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ExternalLink className="h-5 w-5" />
              Conteúdo Externo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Este módulo contém um link para conteúdo externo. Clique no botão abaixo para acessar.
            </p>
            <Button asChild className="gap-2">
              <a href={linkUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
                Acessar Conteúdo
              </a>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
