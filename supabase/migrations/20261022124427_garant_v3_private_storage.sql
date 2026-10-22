-- Private buckets. No anonymous reads and no client upload until MIME/hash pipeline exists.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values
 ('document-files','document-files',false,20971520,array['application/pdf']),
 ('document-attachments','document-attachments',false,10485760,array['application/pdf','image/jpeg','image/png']),
 ('organization-assets','organization-assets',false,2097152,array['image/jpeg','image/png']),
 ('holder-photos','holder-photos',false,2097152,array['image/jpeg','image/png'])
on conflict(id) do nothing;
do $$begin
 if exists(select 1 from storage.buckets where id in ('document-files','document-attachments','organization-assets','holder-photos') and public) then
 raise exception 'Un bucket GARANT existe avec un accès public : réconciliation requise'; end if;
end $$;
create policy garant_private_attachment_read on storage.objects for select to authenticated using (
 bucket_id in ('document-attachments','holder-photos') and exists(
 select 1 from public.document_attachments a where a.bucket_id=storage.objects.bucket_id and a.object_path=storage.objects.name)
);
create policy garant_private_pdf_read on storage.objects for select to authenticated using (
 bucket_id='document-files' and exists(
 select 1 from public.document_signatures s where s.object_path=storage.objects.name and s.independently_validated)
);
-- organization-assets deliberately deny all reads/writes until linked asset metadata is implemented.
