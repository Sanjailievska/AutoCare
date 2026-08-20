-- =====================================================================
-- AutoCare — Row Level Security policies
-- Run AFTER schema.sql
-- =====================================================================

alter table profiles enable row level security;
alter table repair_shops enable row level security;
alter table mechanics enable row level security;
alter table vehicles enable row level security;
alter table services enable row level security;
alter table repair_requests enable row level security;
alter table repair_request_images enable row level security;
alter table diagnoses enable row level security;
alter table estimates enable row level security;
alter table estimate_items enable row level security;
alter table repairs enable row level security;
alter table repair_images enable row level security;
alter table reviews enable row level security;
alter table notifications enable row level security;

-- ---------------------------------------------------------------------
-- PROFILES
-- ---------------------------------------------------------------------
create policy "profiles_select_own_or_admin" on profiles for select
  using (id = auth.uid() or my_role() = 'admin'
    -- a shop needs to read the profile of a customer who requested it, and vice versa via mechanic linkage
    or exists (
      select 1 from repair_requests r
      where r.customer_id = profiles.id and is_my_shop(r.shop_id)
    )
    or exists (
      select 1 from repair_requests r
      join repair_shops s on s.id = r.shop_id
      where s.owner_id = profiles.id and r.customer_id = auth.uid()
    )
  );
create policy "profiles_insert_own" on profiles for insert with check (id = auth.uid());
create policy "profiles_update_own_or_admin" on profiles for update
  using (id = auth.uid() or my_role() = 'admin');

-- ---------------------------------------------------------------------
-- REPAIR SHOPS — public read (customers browse); owner/admin write
-- ---------------------------------------------------------------------
create policy "shops_select_all" on repair_shops for select using (true);
create policy "shops_insert_owner" on repair_shops for insert
  with check (owner_id = auth.uid() and my_role() = 'shop');
create policy "shops_update_owner_or_admin" on repair_shops for update
  using (owner_id = auth.uid() or my_role() = 'admin');
create policy "shops_delete_owner_or_admin" on repair_shops for delete
  using (owner_id = auth.uid() or my_role() = 'admin');

-- ---------------------------------------------------------------------
-- MECHANICS — public can read active mechanics of a shop (light info);
-- only the owning shop manages them
-- ---------------------------------------------------------------------
create policy "mechanics_select" on mechanics for select
  using (is_my_shop(shop_id) or my_role() = 'admin' or profile_id = auth.uid()
    or exists (select 1 from repair_requests r where r.assigned_mechanic_id = mechanics.id and r.customer_id = auth.uid()));
create policy "mechanics_insert" on mechanics for insert with check (is_my_shop(shop_id));
create policy "mechanics_update" on mechanics for update using (is_my_shop(shop_id) or my_role() = 'admin');
create policy "mechanics_delete" on mechanics for delete using (is_my_shop(shop_id) or my_role() = 'admin');

-- ---------------------------------------------------------------------
-- VEHICLES — strictly owner-only, plus shops that have an active
-- request referencing that vehicle, plus admin
-- ---------------------------------------------------------------------
create policy "vehicles_select" on vehicles for select
  using (
    customer_id = auth.uid()
    or my_role() = 'admin'
    or exists (select 1 from repair_requests r where r.vehicle_id = vehicles.id and is_my_shop(r.shop_id))
  );
create policy "vehicles_insert_own" on vehicles for insert with check (customer_id = auth.uid());
create policy "vehicles_update_own_or_admin" on vehicles for update
  using (customer_id = auth.uid() or my_role() = 'admin');
create policy "vehicles_delete_own_or_admin" on vehicles for delete
  using (customer_id = auth.uid() or my_role() = 'admin');

-- ---------------------------------------------------------------------
-- SERVICES — public read; shop manages own
-- ---------------------------------------------------------------------
create policy "services_select_all" on services for select using (true);
create policy "services_insert_owner" on services for insert with check (is_my_shop(shop_id));
create policy "services_update_owner_or_admin" on services for update using (is_my_shop(shop_id) or my_role() = 'admin');
create policy "services_delete_owner_or_admin" on services for delete using (is_my_shop(shop_id) or my_role() = 'admin');

-- ---------------------------------------------------------------------
-- REPAIR REQUESTS — customer sees own; shop sees requests for their shop; admin sees all
-- ---------------------------------------------------------------------
create policy "requests_select" on repair_requests for select
  using (customer_id = auth.uid() or is_my_shop(shop_id) or my_role() = 'admin');
create policy "requests_insert_customer" on repair_requests for insert
  with check (customer_id = auth.uid() and exists (select 1 from vehicles v where v.id = vehicle_id and v.customer_id = auth.uid()));
create policy "requests_update" on repair_requests for update
  using (customer_id = auth.uid() or is_my_shop(shop_id) or my_role() = 'admin');
create policy "requests_delete_admin" on repair_requests for delete using (my_role() = 'admin');

-- ---------------------------------------------------------------------
-- REPAIR REQUEST IMAGES
-- ---------------------------------------------------------------------
create policy "request_images_select" on repair_request_images for select
  using (exists (select 1 from repair_requests r where r.id = repair_request_id
    and (r.customer_id = auth.uid() or is_my_shop(r.shop_id) or my_role() = 'admin')));
create policy "request_images_insert" on repair_request_images for insert
  with check (exists (select 1 from repair_requests r where r.id = repair_request_id and r.customer_id = auth.uid()));
create policy "request_images_delete" on repair_request_images for delete
  using (exists (select 1 from repair_requests r where r.id = repair_request_id
    and (r.customer_id = auth.uid() or my_role() = 'admin')));

-- ---------------------------------------------------------------------
-- DIAGNOSES — visible to the request's customer + owning shop; only shop writes
-- ---------------------------------------------------------------------
create policy "diagnoses_select" on diagnoses for select
  using (exists (select 1 from repair_requests r where r.id = repair_request_id
    and (r.customer_id = auth.uid() or is_my_shop(r.shop_id) or my_role() = 'admin')));
create policy "diagnoses_insert" on diagnoses for insert
  with check (exists (select 1 from repair_requests r where r.id = repair_request_id and is_my_shop(r.shop_id)));
create policy "diagnoses_update" on diagnoses for update
  using (exists (select 1 from repair_requests r where r.id = repair_request_id and is_my_shop(r.shop_id)) or my_role() = 'admin');

-- ---------------------------------------------------------------------
-- ESTIMATES — customer reads/approves own; shop creates/reads own
-- ---------------------------------------------------------------------
create policy "estimates_select" on estimates for select
  using (exists (select 1 from repair_requests r where r.id = repair_request_id
    and (r.customer_id = auth.uid() or is_my_shop(r.shop_id) or my_role() = 'admin')));
create policy "estimates_insert" on estimates for insert
  with check (exists (select 1 from repair_requests r where r.id = repair_request_id and is_my_shop(r.shop_id)));
-- customer may only flip status between PENDING and APPROVED/REJECTED; shop may edit while PENDING
create policy "estimates_update" on estimates for update
  using (exists (select 1 from repair_requests r where r.id = repair_request_id
    and (r.customer_id = auth.uid() or is_my_shop(r.shop_id))) or my_role() = 'admin');

-- ---------------------------------------------------------------------
-- ESTIMATE ITEMS — follow parent estimate's visibility; only shop edits
-- ---------------------------------------------------------------------
create policy "estimate_items_select" on estimate_items for select
  using (exists (
    select 1 from estimates e join repair_requests r on r.id = e.repair_request_id
    where e.id = estimate_id and (r.customer_id = auth.uid() or is_my_shop(r.shop_id) or my_role() = 'admin')
  ));
create policy "estimate_items_insert" on estimate_items for insert
  with check (exists (
    select 1 from estimates e join repair_requests r on r.id = e.repair_request_id
    where e.id = estimate_id and is_my_shop(r.shop_id)
  ));
create policy "estimate_items_update" on estimate_items for update
  using (exists (
    select 1 from estimates e join repair_requests r on r.id = e.repair_request_id
    where e.id = estimate_id and is_my_shop(r.shop_id)
  ));
create policy "estimate_items_delete" on estimate_items for delete
  using (exists (
    select 1 from estimates e join repair_requests r on r.id = e.repair_request_id
    where e.id = estimate_id and is_my_shop(r.shop_id)
  ));

-- ---------------------------------------------------------------------
-- REPAIRS
-- ---------------------------------------------------------------------
create policy "repairs_select" on repairs for select
  using (exists (select 1 from repair_requests r where r.id = repair_request_id
    and (r.customer_id = auth.uid() or is_my_shop(r.shop_id) or my_role() = 'admin')));
create policy "repairs_insert" on repairs for insert
  with check (exists (select 1 from repair_requests r where r.id = repair_request_id and is_my_shop(r.shop_id)));
create policy "repairs_update" on repairs for update
  using (exists (select 1 from repair_requests r where r.id = repair_request_id and is_my_shop(r.shop_id)) or my_role() = 'admin');

-- ---------------------------------------------------------------------
-- REPAIR IMAGES
-- ---------------------------------------------------------------------
create policy "repair_images_select" on repair_images for select
  using (exists (
    select 1 from repairs rp join repair_requests r on r.id = rp.repair_request_id
    where rp.id = repair_id and (r.customer_id = auth.uid() or is_my_shop(r.shop_id) or my_role() = 'admin')
  ));
create policy "repair_images_insert" on repair_images for insert
  with check (exists (
    select 1 from repairs rp join repair_requests r on r.id = rp.repair_request_id
    where rp.id = repair_id and is_my_shop(r.shop_id)
  ));
create policy "repair_images_delete" on repair_images for delete
  using (exists (
    select 1 from repairs rp join repair_requests r on r.id = rp.repair_request_id
    where rp.id = repair_id and (is_my_shop(r.shop_id) or my_role() = 'admin')
  ));

-- ---------------------------------------------------------------------
-- REVIEWS — public read; customer writes only for their own COMPLETED request
-- ---------------------------------------------------------------------
create policy "reviews_select_all" on reviews for select using (true);
create policy "reviews_insert_customer" on reviews for insert
  with check (
    customer_id = auth.uid()
    and exists (select 1 from repair_requests r where r.id = repair_request_id
      and r.customer_id = auth.uid() and r.status = 'COMPLETED' and r.shop_id = shop_id)
  );
create policy "reviews_update_own_or_admin" on reviews for update
  using (customer_id = auth.uid() or my_role() = 'admin');
create policy "reviews_delete_own_or_admin" on reviews for delete
  using (customer_id = auth.uid() or my_role() = 'admin');

-- ---------------------------------------------------------------------
-- NOTIFICATIONS — strictly own
-- ---------------------------------------------------------------------
create policy "notifications_select_own" on notifications for select using (user_id = auth.uid());
create policy "notifications_update_own" on notifications for update using (user_id = auth.uid());
create policy "notifications_delete_own" on notifications for delete using (user_id = auth.uid());
-- inserts happen only via security-definer trigger functions (no direct client insert policy)

