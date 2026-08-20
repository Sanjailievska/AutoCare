-- Wipes all demo data (and only demo data) so the platform can be reset
-- without touching real users. Run in the Supabase SQL editor.

delete from repair_shops where is_demo = true;         -- cascades to services/mechanics/requests/etc.
delete from vehicles where customer_id in (select id from profiles where is_demo = true); -- cascades to requests
delete from profiles where is_demo = true;              -- does NOT delete the auth.users row

-- To fully remove demo auth users too, delete them from
-- Authentication -> Users in the Supabase dashboard, or via the
-- admin.auth.admin.deleteUser() API — auth.users can't be touched by SQL.
