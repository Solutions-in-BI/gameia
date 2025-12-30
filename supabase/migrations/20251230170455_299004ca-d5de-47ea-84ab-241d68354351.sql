-- Create storage bucket for training videos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'training-videos',
  'training-videos',
  true,
  104857600, -- 100MB limit
  ARRAY['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime']
)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for training PDFs
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'training-pdfs',
  'training-pdfs',
  true,
  52428800, -- 50MB limit
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for training-videos bucket
CREATE POLICY "Public read access for training videos"
ON storage.objects FOR SELECT
USING (bucket_id = 'training-videos');

CREATE POLICY "Authenticated users can upload training videos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'training-videos' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their training videos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'training-videos' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can delete their training videos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'training-videos' 
  AND auth.role() = 'authenticated'
);

-- RLS policies for training-pdfs bucket
CREATE POLICY "Public read access for training pdfs"
ON storage.objects FOR SELECT
USING (bucket_id = 'training-pdfs');

CREATE POLICY "Authenticated users can upload training pdfs"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'training-pdfs' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their training pdfs"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'training-pdfs' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can delete their training pdfs"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'training-pdfs' 
  AND auth.role() = 'authenticated'
);