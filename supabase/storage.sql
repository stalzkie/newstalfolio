-- ─────────────────────────────────────────────────────────────────────
-- stalfolio — Storage bucket + policies
-- Run this AFTER schema.sql in the Supabase SQL Editor
-- ─────────────────────────────────────────────────────────────────────

INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolio-images', 'portfolio-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "public read portfolio-images" ON storage.objects
  FOR SELECT USING (bucket_id = 'portfolio-images');

CREATE POLICY "auth upload portfolio-images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'portfolio-images' AND auth.role() = 'authenticated'
  );

CREATE POLICY "auth update portfolio-images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'portfolio-images' AND auth.role() = 'authenticated'
  );

CREATE POLICY "auth delete portfolio-images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'portfolio-images' AND auth.role() = 'authenticated'
  );
