-- Storage restrictions for the shared web/mobile backend.

-- Resumes are PDF-only and limited to 10 MB.
update storage.buckets
set
  public = false,
  file_size_limit = 10485760,
  allowed_mime_types = array['application/pdf']::text[]
where id = 'resumes';

-- Profile pictures are private, PNG/JPG only, and limited to 2 MB.
insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)

values (
  'avatars',
  'avatars',
  false,
  2097152,
  array['image/png', 'image/jpeg']::text[]
)
on conflict (id) do update
set
  public = false,
  file_size_limit = 2097152,
  allowed_mime_types = array['image/png', 'image/jpeg']::text[];

drop policy if exists avatars_owner_select on storage.objects;
create policy avatars_owner_select
on storage.objects
for select
to authenticated
using (
  bucket_id = 'avatars'
  and (
    owner_id = (select auth.uid()::text)
    or public.is_admin()
  )
);

drop policy if exists avatars_owner_insert on storage.objects;
create policy avatars_owner_insert
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'avatars'
  and (
    owner_id = (select auth.uid()::text)
    or public.is_admin()
  )
);

drop policy if exists avatars_owner_update on storage.objects;
create policy avatars_owner_update
on storage.objects
for update
to authenticated
using (
  bucket_id = 'avatars'
  and (
    owner_id = (select auth.uid()::text)
    or public.is_admin()
  )
)
with check (
  bucket_id = 'avatars'
  and (
    owner_id = (select auth.uid()::text)
    or public.is_admin()
  )
);

drop policy if exists avatars_owner_delete on storage.objects;
create policy avatars_owner_delete
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'avatars'
  and (
    owner_id = (select auth.uid()::text)
    or public.is_admin()
  )
);
