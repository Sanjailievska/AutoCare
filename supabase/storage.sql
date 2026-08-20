-- =====================================================================
-- AutoCare — Storage buckets + policies
-- Run AFTER schema.sql and rls.sql
-- Buckets are private; access is brokered through signed/authenticated
-- reads scoped to the same rules as the underlying rows.
-- =====================================================================

insert into storage.buckets (id, name, public)
values
  ('vehicle-images', 'vehicle-images', false),
  ('request-images', 'request-images', false),
  ('repair-images', 'repair-images', false),
  ('shop-logos', 'shop-logos', true)  -- logos are fine to be public (marketing/browse pages)
on conflict (id) do nothing;

-- Folder convention: every object is stored as "<owning-row-uuid>/<filename>",
-- e.g. vehicle-images/<vehicle_id>/photo.jpg, request-images/<request_id>/1.jpg

-- vehicle-images: owner of the vehicle can read/write; shops with a related request can read
create policy "vehicle_images_read" on storage.objects for select
  using (
    bucket_id = 'vehicle-images' and (
      exists (select 1 from vehicles v where v.id::text = (storage.foldername(name))[1] and v.customer_id = auth.uid())
      or exists (
        select 1 from vehicles v join repair_requests r on r.vehicle_id = v.id
        where v.id::text = (storage.foldername(name))[1] and is_my_shop(r.shop_id)
      )
      or my_role() = 'admin'
    )
  );
create policy "vehicle_images_write" on storage.objects for insert
  with check (
    bucket_id = 'vehicle-images'
    and exists (select 1 from vehicles v where v.id::text = (storage.foldername(name))[1] and v.customer_id = auth.uid())
  );
create policy "vehicle_images_delete" on storage.objects for delete
  using (
    bucket_id = 'vehicle-images'
    and exists (select 1 from vehicles v where v.id::text = (storage.foldername(name))[1] and v.customer_id = auth.uid())
  );

-- request-images: customer who owns the request can read/write; the assigned shop can read
create policy "request_images_read" on storage.objects for select
  using (
    bucket_id = 'request-images' and (
      exists (select 1 from repair_requests r where r.id::text = (storage.foldername(name))[1] and r.customer_id = auth.uid())
      or exists (select 1 from repair_requests r where r.id::text = (storage.foldername(name))[1] and is_my_shop(r.shop_id))
      or my_role() = 'admin'
    )
  );
create policy "request_images_write" on storage.objects for insert
  with check (
    bucket_id = 'request-images'
    and exists (select 1 from repair_requests r where r.id::text = (storage.foldername(name))[1] and r.customer_id = auth.uid())
  );
create policy "request_images_delete" on storage.objects for delete
  using (
    bucket_id = 'request-images'
    and exists (select 1 from repair_requests r where r.id::text = (storage.foldername(name))[1] and r.customer_id = auth.uid())
  );

-- repair-images: the owning shop can read/write; the request's customer can read
create policy "repair_images_bucket_read" on storage.objects for select
  using (
    bucket_id = 'repair-images' and (
      exists (
        select 1 from repairs rp join repair_requests r on r.id = rp.repair_request_id
        where rp.id::text = (storage.foldername(name))[1] and (is_my_shop(r.shop_id) or r.customer_id = auth.uid())
      )
      or my_role() = 'admin'
    )
  );
create policy "repair_images_bucket_write" on storage.objects for insert
  with check (
    bucket_id = 'repair-images'
    and exists (
      select 1 from repairs rp join repair_requests r on r.id = rp.repair_request_id
      where rp.id::text = (storage.foldername(name))[1] and is_my_shop(r.shop_id)
    )
  );

-- shop-logos: public read, owning shop writes
create policy "shop_logos_read" on storage.objects for select using (bucket_id = 'shop-logos');
create policy "shop_logos_write" on storage.objects for insert
  with check (
    bucket_id = 'shop-logos'
    and exists (select 1 from repair_shops s where s.id::text = (storage.foldername(name))[1] and s.owner_id = auth.uid())
  );
create policy "shop_logos_update" on storage.objects for update
  using (
    bucket_id = 'shop-logos'
    and exists (select 1 from repair_shops s where s.id::text = (storage.foldername(name))[1] and s.owner_id = auth.uid())
  );

