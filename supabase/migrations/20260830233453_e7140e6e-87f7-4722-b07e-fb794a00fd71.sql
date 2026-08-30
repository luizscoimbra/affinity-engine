CREATE POLICY "fotos perfil visiveis para logados" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'fotos-perfil');
CREATE POLICY "envia propria foto" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'fotos-perfil' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "atualiza propria foto" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'fotos-perfil' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "apaga propria foto" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'fotos-perfil' AND (storage.foldername(name))[1] = auth.uid()::text);