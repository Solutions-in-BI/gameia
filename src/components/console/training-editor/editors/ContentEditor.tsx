import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Video, FileIcon, Link2 } from "lucide-react";
import { RichTextEditor } from "./RichTextEditor";
import { FileUploader } from "./FileUploader";
import type { TrainingModule } from "@/hooks/useTrainingEditor";

interface ContentEditorProps {
  module: TrainingModule;
  onChange: (data: Partial<TrainingModule>) => void;
}

export function ContentEditor({ module, onChange }: ContentEditorProps) {
  const contentType = module.content_type || "text";
  const contentData = (module.content_data || {}) as Record<string, string>;

  const handleContentTypeChange = (type: string) => {
    onChange({ content_type: type });
  };

  const handleContentDataChange = (key: string, value: string) => {
    onChange({
      content_data: {
        ...contentData,
        [key]: value,
      },
    });
  };

  return (
    <div className="space-y-4">
      <Tabs value={contentType} onValueChange={handleContentTypeChange}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="text" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Texto
          </TabsTrigger>
          <TabsTrigger value="video" className="flex items-center gap-2">
            <Video className="w-4 h-4" />
            Vídeo
          </TabsTrigger>
          <TabsTrigger value="pdf" className="flex items-center gap-2">
            <FileIcon className="w-4 h-4" />
            PDF
          </TabsTrigger>
          <TabsTrigger value="link" className="flex items-center gap-2">
            <Link2 className="w-4 h-4" />
            Link
          </TabsTrigger>
        </TabsList>

        <TabsContent value="text" className="mt-4">
          <Card>
            <CardContent className="pt-4 space-y-4">
              <div className="space-y-2">
                <Label>Conteúdo do Texto</Label>
                <RichTextEditor
                  content={contentData.text || ""}
                  onChange={(html) => handleContentDataChange("text", html)}
                  placeholder="Escreva o conteúdo do módulo aqui..."
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="video" className="mt-4">
          <Card>
            <CardContent className="pt-4 space-y-6">
              {/* Option 1: Upload */}
              <div className="space-y-2">
                <Label>Upload de Vídeo</Label>
                <FileUploader
                  bucket="training-videos"
                  accept="video/mp4,video/webm,video/ogg,video/quicktime"
                  currentFileUrl={contentData.uploaded_video_url}
                  onUpload={(url) => {
                    handleContentDataChange("uploaded_video_url", url);
                    // Clear external URL when uploading
                    handleContentDataChange("video_url", "");
                    onChange({ video_url: url });
                  }}
                  onRemove={() => {
                    handleContentDataChange("uploaded_video_url", "");
                    onChange({ video_url: "" });
                  }}
                  label="Arraste um vídeo ou clique para selecionar"
                  description="MP4, WebM, OGG ou MOV (máx. 100MB)"
                  maxSizeMB={100}
                />
              </div>

              {/* Divider */}
              {!contentData.uploaded_video_url && (
                <>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        ou use uma URL externa
                      </span>
                    </div>
                  </div>

                  {/* Option 2: External URL */}
                  <div className="space-y-2">
                    <Label>URL do Vídeo (YouTube, Vimeo, etc.)</Label>
                    <Input
                      value={module.video_url || contentData.video_url || ""}
                      onChange={(e) => {
                        onChange({ video_url: e.target.value });
                        handleContentDataChange("video_url", e.target.value);
                      }}
                      placeholder="https://youtube.com/watch?v=... ou https://vimeo.com/..."
                    />
                    <p className="text-xs text-muted-foreground">
                      Suporta YouTube, Vimeo e links diretos de vídeo
                    </p>
                  </div>

                  {/* Preview for external URL */}
                  {(module.video_url || contentData.video_url) && (
                    <div className="space-y-2">
                      <Label>Preview</Label>
                      <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                        {(module.video_url || contentData.video_url)?.includes("youtube.com") ||
                        (module.video_url || contentData.video_url)?.includes("youtu.be") ? (
                          <iframe
                            src={getYouTubeEmbedUrl(module.video_url || contentData.video_url || "")}
                            className="w-full h-full"
                            allowFullScreen
                            title="YouTube video"
                          />
                        ) : (module.video_url || contentData.video_url)?.includes("vimeo.com") ? (
                          <iframe
                            src={getVimeoEmbedUrl(module.video_url || contentData.video_url || "")}
                            className="w-full h-full"
                            allowFullScreen
                            title="Vimeo video"
                          />
                        ) : (
                          <video
                            src={module.video_url || contentData.video_url}
                            controls
                            className="w-full h-full"
                          />
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pdf" className="mt-4">
          <Card>
            <CardContent className="pt-4 space-y-6">
              {/* Option 1: Upload */}
              <div className="space-y-2">
                <Label>Upload de PDF</Label>
                <FileUploader
                  bucket="training-pdfs"
                  accept="application/pdf"
                  currentFileUrl={contentData.uploaded_pdf_url}
                  onUpload={(url) => {
                    handleContentDataChange("uploaded_pdf_url", url);
                    handleContentDataChange("pdf_url", "");
                  }}
                  onRemove={() => {
                    handleContentDataChange("uploaded_pdf_url", "");
                  }}
                  label="Arraste um PDF ou clique para selecionar"
                  description="Apenas arquivos PDF (máx. 50MB)"
                  maxSizeMB={50}
                />
              </div>

              {/* Divider */}
              {!contentData.uploaded_pdf_url && (
                <>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        ou use uma URL externa
                      </span>
                    </div>
                  </div>

                  {/* Option 2: External URL */}
                  <div className="space-y-2">
                    <Label>URL do PDF</Label>
                    <Input
                      value={contentData.pdf_url || ""}
                      onChange={(e) => handleContentDataChange("pdf_url", e.target.value)}
                      placeholder="https://exemplo.com/documento.pdf"
                    />
                  </div>

                  {/* Preview for external URL */}
                  {contentData.pdf_url && (
                    <div className="space-y-2">
                      <Label>Preview</Label>
                      <iframe
                        src={contentData.pdf_url}
                        className="w-full h-[400px] rounded-lg border"
                        title="PDF Preview"
                      />
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="link" className="mt-4">
          <Card>
            <CardContent className="pt-4 space-y-4">
              <div className="space-y-2">
                <Label>URL do Link</Label>
                <Input
                  value={contentData.link_url || ""}
                  onChange={(e) => handleContentDataChange("link_url", e.target.value)}
                  placeholder="https://..."
                />
              </div>

              <div className="space-y-2">
                <Label>Título do Link (opcional)</Label>
                <Input
                  value={contentData.link_title || ""}
                  onChange={(e) => handleContentDataChange("link_title", e.target.value)}
                  placeholder="Título para exibição"
                />
              </div>

              <div className="space-y-2">
                <Label>Descrição (opcional)</Label>
                <Textarea
                  value={contentData.link_description || ""}
                  onChange={(e) => handleContentDataChange("link_description", e.target.value)}
                  placeholder="Breve descrição do conteúdo do link"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Helper functions for video embeds
function getYouTubeEmbedUrl(url: string): string {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  const videoId = match && match[2].length === 11 ? match[2] : null;
  return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
}

function getVimeoEmbedUrl(url: string): string {
  const regExp = /vimeo\.com\/(\d+)/;
  const match = url.match(regExp);
  const videoId = match ? match[1] : null;
  return videoId ? `https://player.vimeo.com/video/${videoId}` : "";
}
