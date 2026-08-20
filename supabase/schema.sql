-- =====================================================================
-- AutoCare — Full schema, constraints, triggers, RLS policies
-- Run this entire file in the Supabase SQL editor on a fresh project.
-- =====================================================================

create extension if not exists "uuid-ossp";

-- ---------------------------------------------------------------------
-- ENUM TYPES
-- ---------------------------------------------------------------------
create type user_role as enum ('customer', 'shop', 'admin');
create type urgency_level as enum ('low', 'normal', 'urgent');
create type request_status as enum (
  'SUBMITTED', 'ACCEPTED', 'DIAGNOSING', 'ESTIMATE_SENT',
  'CUSTOMER_APPROVED', 'IN_REPAIR', 'READY_FOR_PICKUP', 'COMPLETED',
  'REJECTED', 'CANCELLED'
);
create type estimate_status as enum ('PENDING', 'APPROVED', 'REJECTED');
create type estimate_item_type as enum ('PART', 'LABOR', 'SERVICE');
create type repair_status as enum ('IN_REPAIR', 'READY_FOR_PICKUP', 'COMPLETED');
create type notification_type as enum (
  'REQUEST_ACCEPTED', 'REQUEST_REJECTED', 'DIAGNOSIS_ADDED', 'ESTIMATE_READY',
  'ESTIMATE_APPROVED', 'ESTIMATE_REJECTED', 'REPAIR_STARTED', 'REPAIR_READY',
  'REPAIR_COMPLETED', 'NEW_REQUEST', 'REVIEW_RECEIVED', 'SHOP_APPROVED'
);

-- ---------------------------------------------------------------------
-- PROFILES  (mirrors auth.users, one row per user, holds role)
-- ---------------------------------------------------------------------
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  phone text,
  role user_role not null default 'customer',
  avatar_url text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- REPAIR SHOPS
-- ---------------------------------------------------------------------
create table repair_shops (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  description text,
  address text,
  city text not null,
  phone text,
  email text,
  website text,
  opening_hours text,
  logo_url text,
  rating numeric(2,1) not null default 0,
  is_approved boolean not null default true,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create index idx_repair_shops_owner on repair_shops(owner_id);
create index idx_repair_shops_city on repair_shops(city);

-- ---------------------------------------------------------------------
-- MECHANICS  (staff belonging to a shop)
-- ---------------------------------------------------------------------
create table mechanics (
  id uuid primary key default uuid_generate_v4(),
  shop_id uuid not null references repair_shops(id) on delete cascade,
  profile_id uuid references profiles(id) on delete set null,
  full_name text not null,
  specialization text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create index idx_mechanics_shop on mechanics(shop_id);

-- ---------------------------------------------------------------------
-- VEHICLES
-- ---------------------------------------------------------------------
create table vehicles (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid not null references profiles(id) on delete cascade,
  make text not null,
  model text not null,
  year int not null check (year between 1900 and 2100),
  engine text,
  fuel_type text,
  transmission text,
  mileage int check (mileage >= 0),
  license_plate text,
  vin text,
  image_url text,
  created_at timestamptz not null default now()
);
create index idx_vehicles_customer on vehicles(customer_id);
create index idx_vehicles_plate on vehicles(license_plate);
create index idx_vehicles_vin on vehicles(vin);

-- ---------------------------------------------------------------------
-- SERVICES  (offered by a shop)
-- ---------------------------------------------------------------------
create table services (
  id uuid primary key default uuid_generate_v4(),
  shop_id uuid not null references repair_shops(id) on delete cascade,
  name text not null,
  description text,
  category text,
  base_price numeric(10,2),
  estimated_duration text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create index idx_services_shop on services(shop_id);

-- ---------------------------------------------------------------------
-- REPAIR REQUESTS
-- ---------------------------------------------------------------------
create table repair_requests (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid not null references profiles(id) on delete cascade,
  vehicle_id uuid not null references vehicles(id) on delete cascade,
  shop_id uuid not null references repair_shops(id) on delete cascade,
  service_id uuid references services(id) on delete set null,
  category text not null,
  title text not null,
  description text not null,
  urgency urgency_level not null default 'normal',
  preferred_date date,
  status request_status not null default 'SUBMITTED',
  assigned_mechanic_id uuid references mechanics(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_requests_customer on repair_requests(customer_id);
create index idx_requests_shop on repair_requests(shop_id);
create index idx_requests_status on repair_requests(status);
create index idx_requests_vehicle on repair_requests(vehicle_id);

create table repair_request_images (
  id uuid primary key default uuid_generate_v4(),
  repair_request_id uuid not null references repair_requests(id) on delete cascade,
  image_url text not null,
  created_at timestamptz not null default now()
);
create index idx_request_images_request on repair_request_images(repair_request_id);

-- ---------------------------------------------------------------------
-- DIAGNOSES
-- ---------------------------------------------------------------------
create table diagnoses (
  id uuid primary key default uuid_generate_v4(),
  repair_request_id uuid not null references repair_requests(id) on delete cascade,
  mechanic_id uuid references mechanics(id) on delete set null,
  description text not null,
  recommended_repairs text,
  notes text,
  created_at timestamptz not null default now()
);
create index idx_diagnoses_request on diagnoses(repair_request_id);

-- ---------------------------------------------------------------------
-- ESTIMATES
-- ---------------------------------------------------------------------
create table estimates (
  id uuid primary key default uuid_generate_v4(),
  repair_request_id uuid not null references repair_requests(id) on delete cascade,
  total_amount numeric(10,2) not null default 0,
  notes text,
  status estimate_status not null default 'PENDING',
  created_at timestamptz not null default now(),
  approved_at timestamptz
);
create index idx_estimates_request on estimates(repair_request_id);

create table estimate_items (
  id uuid primary key default uuid_generate_v4(),
  estimate_id uuid not null references estimates(id) on delete cascade,
  description text not null,
  item_type estimate_item_type not null,
  quantity numeric(10,2) not null default 1,
  unit_price numeric(10,2) not null default 0,
  total_price numeric(10,2) not null default 0
);
create index idx_estimate_items_estimate on estimate_items(estimate_id);

-- ---------------------------------------------------------------------
-- REPAIRS
-- ---------------------------------------------------------------------
create table repairs (
  id uuid primary key default uuid_generate_v4(),
  repair_request_id uuid not null unique references repair_requests(id) on delete cascade,
  mechanic_id uuid references mechanics(id) on delete set null,
  status repair_status not null default 'IN_REPAIR',
  started_at timestamptz default now(),
  completed_at timestamptz,
  final_cost numeric(10,2),
  notes text
);
create index idx_repairs_request on repairs(repair_request_id);

create table repair_images (
  id uuid primary key default uuid_generate_v4(),
  repair_id uuid not null references repairs(id) on delete cascade,
  image_url text not null,
  created_at timestamptz not null default now()
);
create index idx_repair_images_repair on repair_images(repair_id);

-- ---------------------------------------------------------------------
-- REVIEWS
-- ---------------------------------------------------------------------
create table reviews (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid not null references profiles(id) on delete cascade,
  shop_id uuid not null references repair_shops(id) on delete cascade,
  repair_request_id uuid not null unique references repair_requests(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now()
);
create index idx_reviews_shop on reviews(shop_id);

-- ---------------------------------------------------------------------
-- NOTIFICATIONS
-- ---------------------------------------------------------------------
create table notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  message text not null,
  type notification_type not null,
  related_request_id uuid references repair_requests(id) on delete cascade,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);
create index idx_notifications_user on notifications(user_id, is_read);

-- =====================================================================
-- HELPER FUNCTIONS (security definer, used inside RLS to avoid recursion)
-- =====================================================================
create or replace function my_role() returns user_role
language sql stable security definer set search_path = public as $$
  select role from profiles where id = auth.uid();
$$;

create or replace function my_shop_ids() returns setof uuid
language sql stable security definer set search_path = public as $$
  select id from repair_shops where owner_id = auth.uid();
$$;

create or replace function is_my_shop(check_shop_id uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from repair_shops where id = check_shop_id and owner_id = auth.uid());
$$;

-- =====================================================================
-- TRIGGERS
-- =====================================================================

-- keep repair_requests.updated_at fresh
create or replace function touch_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
create trigger trg_requests_touch before update on repair_requests
  for each row execute function touch_updated_at();

-- recompute estimate total from its items
create or replace function recompute_estimate_total() returns trigger
language plpgsql as $$
declare
  target_estimate uuid;
begin
  target_estimate := coalesce(new.estimate_id, old.estimate_id);
  update estimates set total_amount = (
    select coalesce(sum(total_price), 0) from estimate_items where estimate_id = target_estimate
  ) where id = target_estimate;
  return null;
end;
$$;
create trigger trg_estimate_items_recompute
  after insert or update or delete on estimate_items
  for each row execute function recompute_estimate_total();

-- auto-fill estimate_items.total_price
create or replace function set_item_total() returns trigger
language plpgsql as $$
begin
  new.total_price := round(new.quantity * new.unit_price, 2);
  return new;
end;
$$;
create trigger trg_estimate_items_total before insert or update on estimate_items
  for each row execute function set_item_total();

-- recompute shop rating from reviews
create or replace function recompute_shop_rating() returns trigger
language plpgsql as $$
declare
  target_shop uuid;
begin
  target_shop := coalesce(new.shop_id, old.shop_id);
  update repair_shops set rating = (
    select coalesce(round(avg(rating)::numeric, 1), 0) from reviews where shop_id = target_shop
  ) where id = target_shop;
  return null;
end;
$$;
create trigger trg_reviews_recompute
  after insert or update or delete on reviews
  for each row execute function recompute_shop_rating();

-- notification helper
create or replace function notify_user(p_user_id uuid, p_title text, p_message text, p_type notification_type, p_request_id uuid default null)
returns void language plpgsql security definer set search_path = public as $$
begin
  insert into notifications (user_id, title, message, type, related_request_id)
  values (p_user_id, p_title, p_message, p_type, p_request_id);
end;
$$;

-- notify shop owner on new request
create or replace function on_request_inserted() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  shop_owner uuid;
  cust_name text;
begin
  select owner_id into shop_owner from repair_shops where id = new.shop_id;
  select full_name into cust_name from profiles where id = new.customer_id;
  perform notify_user(shop_owner, 'New repair request', cust_name || ' submitted: ' || new.title, 'NEW_REQUEST', new.id);
  return new;
end;
$$;
create trigger trg_request_inserted after insert on repair_requests
  for each row execute function on_request_inserted();

-- notify customer on status change
create or replace function on_request_status_change() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  shop_name text;
  msg text;
  ntype notification_type;
begin
  if new.status = old.status then return new; end if;
  select name into shop_name from repair_shops where id = new.shop_id;
  if new.status = 'ACCEPTED' then
    msg := 'Your repair request was accepted by ' || shop_name || '.'; ntype := 'REQUEST_ACCEPTED';
  elsif new.status = 'REJECTED' then
    msg := 'Your repair request was declined by ' || shop_name || '.'; ntype := 'REQUEST_REJECTED';
  elsif new.status = 'IN_REPAIR' then
    msg := 'Your vehicle is now being repaired at ' || shop_name || '.'; ntype := 'REPAIR_STARTED';
  elsif new.status = 'READY_FOR_PICKUP' then
    msg := 'Your vehicle is ready for pickup at ' || shop_name || '.'; ntype := 'REPAIR_READY';
  elsif new.status = 'COMPLETED' then
    msg := 'Your repair at ' || shop_name || ' is complete. Thanks for choosing them!'; ntype := 'REPAIR_COMPLETED';
  else
    return new;
  end if;
  perform notify_user(new.customer_id, 'Repair update', msg, ntype, new.id);
  return new;
end;
$$;
create trigger trg_request_status_change after update on repair_requests
  for each row execute function on_request_status_change();

-- diagnosis added -> notify customer, move status forward
create or replace function on_diagnosis_inserted() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  cust uuid;
begin
  select customer_id into cust from repair_requests where id = new.repair_request_id;
  update repair_requests set status = 'DIAGNOSING' where id = new.repair_request_id and status = 'ACCEPTED';
  perform notify_user(cust, 'Diagnosis ready', 'The mechanic has diagnosed your vehicle.', 'DIAGNOSIS_ADDED', new.repair_request_id);
  return new;
end;
$$;
create trigger trg_diagnosis_inserted after insert on diagnoses
  for each row execute function on_diagnosis_inserted();

-- estimate sent -> notify + move status
create or replace function on_estimate_inserted() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  cust uuid;
begin
  select customer_id into cust from repair_requests where id = new.repair_request_id;
  update repair_requests set status = 'ESTIMATE_SENT' where id = new.repair_request_id;
  perform notify_user(cust, 'Estimate ready', 'Your repair estimate of EUR ' || new.total_amount || ' is ready for approval.', 'ESTIMATE_READY', new.repair_request_id);
  return new;
end;
$$;
create trigger trg_estimate_inserted after insert on estimates
  for each row execute function on_estimate_inserted();

-- estimate approved/rejected -> notify shop, move status, create repair row
create or replace function on_estimate_status_change() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_shop_owner uuid;
  v_cust_name text;
begin
  if new.status = old.status then return new; end if;

  select o.owner_id, p.full_name into v_shop_owner, v_cust_name
  from repair_requests r
  join repair_shops o on o.id = r.shop_id
  join profiles p on p.id = r.customer_id
  where r.id = new.repair_request_id;

  if new.status = 'APPROVED' then
    update repair_requests set status = 'CUSTOMER_APPROVED' where id = new.repair_request_id;
    update estimates set approved_at = now() where id = new.id;
    insert into repairs (repair_request_id, status) values (new.repair_request_id, 'IN_REPAIR')
      on conflict (repair_request_id) do nothing;
    update repair_requests set status = 'IN_REPAIR' where id = new.repair_request_id;
    perform notify_user(v_shop_owner, 'Estimate approved', v_cust_name || ' approved the repair estimate.', 'ESTIMATE_APPROVED', new.repair_request_id);
  elsif new.status = 'REJECTED' then
    update repair_requests set status = 'REJECTED' where id = new.repair_request_id;
    perform notify_user(v_shop_owner, 'Estimate rejected', v_cust_name || ' rejected the repair estimate.', 'ESTIMATE_REJECTED', new.repair_request_id);
  end if;
  return new;
end;
$$;
create trigger trg_estimate_status_change after update on estimates
  for each row execute function on_estimate_status_change();

-- repair status change -> mirror onto repair_requests + notify + finalize
create or replace function on_repair_status_change() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.status = old.status then return new; end if;
  update repair_requests set status = new.status::text::request_status where id = new.repair_request_id;
  if new.status = 'COMPLETED' then
    new.completed_at := now();
  end if;
  return new;
end;
$$;
create trigger trg_repair_status_change before update on repairs
  for each row execute function on_repair_status_change();

-- new profile auto-created from auth signup metadata (see also client-side upsert)
create or replace function handle_new_auth_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'customer')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
create trigger trg_new_auth_user after insert on auth.users
  for each row execute function handle_new_auth_user();


-- ---------------------------------------------------------------------
-- Demo-data marker columns (keeps seeded rows clearly separable from
-- real user data — admin can filter/bulk-delete on these)
-- ---------------------------------------------------------------------
alter table profiles add column is_demo boolean not null default false;
alter table repair_shops add column is_demo boolean not null default false;
