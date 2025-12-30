import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Upload, X, FileVideo, FileText, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploaderProps {
  bucket: "training-videos" | "training-pdfs";
  accept: string;
  currentFileUrl?: string;
  onUpload: (url: string) => void;
  onRemove: () => void;
  label: string;
  description?: string;
  maxSizeMB?: number;
}

export function FileUploader({
  bucket,
  accept,
  currentFileUrl,
  onUpload,
  onRemove,
  label,
  description,
  maxSizeMB = 100,
}: FileUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    if (!file) return;

    // Validate file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      toast.error(`Arquivo muito grande. Máximo: ${maxSizeMB}MB`);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      clearInterval(progressInterval);

      if (error) throw error;

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      setUploadProgress(100);
      onUpload(publicUrlData.publicUrl);
      toast.success("Arquivo enviado com sucesso!");
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Erro ao enviar arquivo");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleRemove = async () => {
    if (!currentFileUrl) return;

    try {
      // Extract file path from URL
      const urlParts = currentFileUrl.split(`/${bucket}/`);
      if (urlParts.length > 1) {
        const filePath = urlParts[1];
        await supabase.storage.from(bucket).remove([filePath]);
      }
      onRemove();
      toast.success("Arquivo removido");
    } catch (error) {
      console.error("Remove error:", error);
      onRemove(); // Still remove from state even if storage delete fails
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleUpload(e.target.files[0]);
    }
  };

  const isVideo = bucket === "training-videos";
  const Icon = isVideo ? FileVideo : FileText;

  if (currentFileUrl) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
          <div className="flex items-center gap-3">
            <Icon className="w-8 h-8 text-primary" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {isVideo ? "Vídeo carregado" : "PDF carregado"}
              </p>
              <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                {currentFileUrl.split("/").pop()}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            className="text-destructive hover:text-destructive"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Preview */}
        {isVideo && (
          <video
            src={currentFileUrl}
            controls
            className="w-full rounded-lg max-h-[300px] bg-black"
          />
        )}
        {!isVideo && (
          <iframe
            src={currentFileUrl}
            className="w-full h-[400px] rounded-lg border"
            title="PDF Preview"
          />
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
        dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25",
        isUploading && "pointer-events-none opacity-70"
      )}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        className="hidden"
      />

      {isUploading ? (
        <div className="space-y-4">
          <Loader2 className="w-12 h-12 mx-auto text-primary animate-spin" />
          <div className="space-y-2">
            <p className="text-sm font-medium">Enviando arquivo...</p>
            <Progress value={uploadProgress} className="w-48 mx-auto" />
            <p className="text-xs text-muted-foreground">{uploadProgress}%</p>
          </div>
        </div>
      ) : (
        <>
          <Icon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-sm font-medium mb-1">{label}</p>
          {description && (
            <p className="text-xs text-muted-foreground mb-4">{description}</p>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={() => inputRef.current?.click()}
          >
            <Upload className="w-4 h-4 mr-2" />
            Selecionar arquivo
          </Button>
          <p className="text-xs text-muted-foreground mt-3">
            ou arraste e solte aqui
          </p>
        </>
      )}
    </div>
  );
}
