-- Ajustes no sistema de avaliações:
-- 1) Avaliação nova já entra publicada (some marketplaces exigem aprovação
--    prévia, mas isso deixava a loja "sem avaliação nenhuma" até o admin
--    aprovar manualmente — o admin continua podendo ocultar/excluir depois).
-- 2) Restringe os tipos de arquivo aceitos no bucket de avaliações também
--    no nível do Storage (defesa em profundidade, além da validação no app).
alter table public.reviews alter column status set default 'publicada';

update storage.buckets
set allowed_mime_types = array[
  'image/jpeg', 'image/png', 'image/webp',
  'video/mp4', 'video/webm', 'video/quicktime'
]
where id = 'reviews';
