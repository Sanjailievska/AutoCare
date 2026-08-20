// Seeds realistic demo data into a fresh AutoCare Supabase project.
//
// Why a script and not plain SQL: Supabase auth users can't be created by
// inserting into auth.users directly (passwords must go through GoTrue).
// This script uses the service-role key to create real, logins-capable
// demo accounts, then inserts the related domain data as those users.
//
// Usage:
//   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/seed.mjs
//
// All demo accounts use the password: Demo1234!
// All seeded rows are flagged is_demo = true so they're easy to find
// and bulk-delete later (see supabase/reset_demo.sql).

import { createClient } from '@supabase/supabase-js'

const url = process.env.SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !serviceKey) {
  console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars first.')
  process.exit(1)
}

const admin = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } })
const DEMO_PASSWORD = 'Demo1234!'

async function createUser(email, full_name, role) {
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: DEMO_PASSWORD,
    email_confirm: true,
    user_metadata: { full_name, role },
  })
  if (error) throw error
  // trigger creates the profile row; mark it as demo + make sure role stuck
  await admin.from('profiles').update({ is_demo: true, role }).eq('id', data.user.id)
  return data.user.id
}

async function main() {
  console.log('Creating demo shop owners...')
  const shop1Owner = await createUser('garage.autofix@demo.autocare.dev', 'Marko Ilievski', 'shop')
  const shop2Owner = await createUser('garage.speedtech@demo.autocare.dev', 'Elena Petrova', 'shop')
  const shop3Owner = await createUser('garage.citymotors@demo.autocare.dev', 'Igor Dimitrov', 'shop')

  console.log('Creating demo customers...')
  const cust1 = await createUser('john.doe@demo.autocare.dev', 'John Doe', 'customer')
  const cust2 = await createUser('ana.k@demo.autocare.dev', 'Ana Kovacevska', 'customer')
  const cust3 = await createUser('petar.n@demo.autocare.dev', 'Petar Naumov', 'customer')

  console.log('Creating shops...')
  const { data: shops, error: shopErr } = await admin.from('repair_shops').insert([
    { owner_id: shop1Owner, name: 'AutoFix Garage', description: 'Family-run full-service garage specializing in German makes.', address: 'Ul. Partizanska 12', city: 'Veles', phone: '+389 43 111 222', email: 'garage.autofix@demo.autocare.dev', opening_hours: 'Mon–Fri 08:00–18:00, Sat 09:00–14:00', is_demo: true },
    { owner_id: shop2Owner, name: 'SpeedTech Auto Service', description: 'Modern diagnostics and performance tuning for all makes.', address: 'Bul. Ilinden 45', city: 'Skopje', phone: '+389 2 333 444', email: 'garage.speedtech@demo.autocare.dev', opening_hours: 'Mon–Sat 08:00–20:00', is_demo: true },
    { owner_id: shop3Owner, name: 'City Motors', description: 'Quick, honest repairs — brakes, tires, and oil changes.', address: 'Ul. Makedonija 7', city: 'Bitola', phone: '+389 47 555 666', email: 'garage.citymotors@demo.autocare.dev', opening_hours: 'Mon–Fri 08:30–17:30', is_demo: true },
  ]).select()
  if (shopErr) throw shopErr
  const [shop1, shop2, shop3] = shops

  console.log('Creating mechanics...')
  await admin.from('mechanics').insert([
    { shop_id: shop1.id, full_name: 'Darko Stefanov', specialization: 'Engine & Diagnostics' },
    { shop_id: shop1.id, full_name: 'Ivana Trajkova', specialization: 'Brakes & Suspension' },
    { shop_id: shop2.id, full_name: 'Boris Aleksov', specialization: 'Electrical Systems' },
    { shop_id: shop3.id, full_name: 'Vlade Ristov', specialization: 'General Repair' },
  ])

  console.log('Creating services...')
  const svc = (shop_id, name, category, base_price, estimated_duration, description) => ({ shop_id, name, category, base_price, estimated_duration, description })
  const { data: services } = await admin.from('services').insert([
    svc(shop1.id, 'Oil & Filter Change', 'Oil & Filters', 45, '30 min', 'Full synthetic oil and filter replacement.'),
    svc(shop1.id, 'Brake Pad Replacement', 'Brakes', 120, '1.5 hr', 'Front or rear pad replacement with inspection.'),
    svc(shop1.id, 'Full Diagnostic Check', 'Engine', 60, '45 min', 'Computer diagnostics for warning lights and performance issues.'),
    svc(shop2.id, 'Battery Replacement', 'Battery', 90, '20 min', 'Battery testing and replacement, includes disposal.'),
    svc(shop2.id, 'AC Regas & Inspection', 'Air Conditioning', 70, '1 hr', 'Refrigerant recharge and leak check.'),
    svc(shop2.id, 'Transmission Service', 'Transmission', 180, '2 hr', 'Fluid replacement and filter service.'),
    svc(shop3.id, 'Tire Rotation & Balance', 'Tires', 35, '30 min', 'All-four rotation with wheel balancing.'),
    svc(shop3.id, 'Suspension Check', 'Suspension', 55, '45 min', 'Shocks, struts, and bushings inspection.'),
  ]).select()

  console.log('Creating vehicles...')
  const { data: vehicles } = await admin.from('vehicles').insert([
    { customer_id: cust1, make: 'BMW', model: '320d', year: 2018, engine: '2.0 Diesel', fuel_type: 'Diesel', transmission: 'Automatic', mileage: 98000, license_plate: 'VE-123-AB', vin: 'WBA8E9C50GK123456' },
    { customer_id: cust1, make: 'Volkswagen', model: 'Golf 7', year: 2016, engine: '1.6 TDI', fuel_type: 'Diesel', transmission: 'Manual', mileage: 142000, license_plate: 'VE-456-CD', vin: 'WVWZZZ1KZAW123457' },
    { customer_id: cust2, make: 'Škoda', model: 'Octavia', year: 2020, engine: '1.5 TSI', fuel_type: 'Petrol', transmission: 'Automatic', mileage: 41000, license_plate: 'SK-789-EF', vin: 'TMBJJ7NE0L0123458' },
    { customer_id: cust3, make: 'Toyota', model: 'Corolla', year: 2019, engine: '1.8 Hybrid', fuel_type: 'Hybrid', transmission: 'CVT', mileage: 63000, license_plate: 'BT-321-GH', vin: 'SB1KZ56E00E123459' },
  ]).select()

  console.log('Creating repair requests across the full status range...')
  const [bmw, golf, octavia, corolla] = vehicles
  const [oilChange, brakePads, diagCheck, battery, acRegas, transService, tireRotation, suspCheck] = services

  // 1. Freshly submitted, untouched
  const { data: r1 } = await admin.from('repair_requests').insert({
    customer_id: cust1, vehicle_id: bmw.id, shop_id: shop1.id, service_id: diagCheck.id,
    category: 'Engine', title: 'Check engine light on', description: 'Warning light came on this morning, engine feels a bit rough at idle.',
    urgency: 'normal', preferred_date: null, status: 'SUBMITTED',
  }).select().single()

  // 2. Accepted, no diagnosis yet
  const { data: r2 } = await admin.from('repair_requests').insert({
    customer_id: cust2, vehicle_id: octavia.id, shop_id: shop2.id, service_id: acRegas.id,
    category: 'Air Conditioning', title: 'AC not cooling', description: 'Air conditioning blows warm air even on max setting.',
    urgency: 'low', status: 'ACCEPTED',
  }).select().single()

  // 3. Full happy-path completed with review — the "brake problem" example from the brief
  const { data: r3 } = await admin.from('repair_requests').insert({
    customer_id: cust1, vehicle_id: bmw.id, shop_id: shop1.id, service_id: brakePads.id,
    category: 'Brakes', title: 'Brake problem', description: 'Grinding noise when braking, especially at low speed.',
    urgency: 'urgent', status: 'COMPLETED',
  }).select().single()
  const { data: mechs1 } = await admin.from('mechanics').select('id').eq('shop_id', shop1.id).limit(1)
  await admin.from('repair_requests').update({ status: 'ACCEPTED', assigned_mechanic_id: mechs1[0].id }).eq('id', r3.id)
  await admin.from('diagnoses').insert({ repair_request_id: r3.id, mechanic_id: mechs1[0].id, description: 'Front brake pads worn below minimum thickness; discs show scoring.', recommended_repairs: 'Replace front pads and discs.' })
  const { data: est3 } = await admin.from('estimates').insert({ repair_request_id: r3.id, notes: 'Includes parts and labor.' }).select().single()
  await admin.from('estimate_items').insert([
    { estimate_id: est3.id, description: 'Brake pads (front set)', item_type: 'PART', quantity: 1, unit_price: 80 },
    { estimate_id: est3.id, description: 'Brake discs (front pair)', item_type: 'PART', quantity: 1, unit_price: 140 },
    { estimate_id: est3.id, description: 'Labor', item_type: 'LABOR', quantity: 1, unit_price: 60 },
  ])
  await admin.from('estimates').update({ status: 'APPROVED' }).eq('id', est3.id)
  const { data: rep3 } = await admin.from('repairs').select('*').eq('repair_request_id', r3.id).single()
  await admin.from('repairs').update({ status: 'COMPLETED', final_cost: 280, notes: 'Pads and discs replaced, test-driven, no more noise.' }).eq('id', rep3.id)
  await admin.from('reviews').insert({ customer_id: cust1, shop_id: shop1.id, repair_request_id: r3.id, rating: 5, comment: 'Fast and honest service, brakes feel brand new.' })

  // 4. In repair right now
  const { data: r4 } = await admin.from('repair_requests').insert({
    customer_id: cust3, vehicle_id: corolla.id, shop_id: shop3.id, service_id: suspCheck.id,
    category: 'Suspension', title: 'Clunking noise over bumps', description: 'Hear a clunk from the front left over speed bumps.',
    urgency: 'normal', status: 'ACCEPTED',
  }).select().single()
  const { data: mechs3 } = await admin.from('mechanics').select('id').eq('shop_id', shop3.id).limit(1)
  await admin.from('repair_requests').update({ assigned_mechanic_id: mechs3[0].id }).eq('id', r4.id)
  await admin.from('diagnoses').insert({ repair_request_id: r4.id, mechanic_id: mechs3[0].id, description: 'Worn front-left sway bar link.', recommended_repairs: 'Replace sway bar link.' })
  const { data: est4 } = await admin.from('estimates').insert({ repair_request_id: r4.id }).select().single()
  await admin.from('estimate_items').insert([
    { estimate_id: est4.id, description: 'Sway bar link (front left)', item_type: 'PART', quantity: 1, unit_price: 25 },
    { estimate_id: est4.id, description: 'Labor', item_type: 'LABOR', quantity: 1, unit_price: 40 },
  ])
  await admin.from('estimates').update({ status: 'APPROVED' }).eq('id', est4.id)

  // 5. Estimate sent, awaiting customer decision
  const { data: r5 } = await admin.from('repair_requests').insert({
    customer_id: cust1, vehicle_id: golf.id, shop_id: shop2.id, service_id: transService.id,
    category: 'Transmission', title: 'Rough gear shifting', description: 'Transmission hesitates when shifting from 1st to 2nd gear.',
    urgency: 'normal', status: 'ACCEPTED',
  }).select().single()
  const { data: mechs2 } = await admin.from('mechanics').select('id').eq('shop_id', shop2.id).limit(1)
  await admin.from('repair_requests').update({ assigned_mechanic_id: mechs2[0].id }).eq('id', r5.id)
  await admin.from('diagnoses').insert({ repair_request_id: r5.id, mechanic_id: mechs2[0].id, description: 'Transmission fluid degraded and low.', recommended_repairs: 'Full fluid and filter service.' })
  await admin.from('estimates').insert({ repair_request_id: r5.id }).select().single().then(async ({ data: est5 }) => {
    await admin.from('estimate_items').insert([
      { estimate_id: est5.id, description: 'Transmission fluid (8L)', item_type: 'PART', quantity: 8, unit_price: 12 },
      { estimate_id: est5.id, description: 'Filter kit', item_type: 'PART', quantity: 1, unit_price: 35 },
      { estimate_id: est5.id, description: 'Labor', item_type: 'LABOR', quantity: 1, unit_price: 55 },
    ])
  })

  // 6. Older completed service for history depth (oil change)
  const { data: r6 } = await admin.from('repair_requests').insert({
    customer_id: cust1, vehicle_id: bmw.id, shop_id: shop1.id, service_id: oilChange.id,
    category: 'Oil & Filters', title: 'Routine oil change', description: 'Scheduled maintenance, oil and filter change.',
    urgency: 'low', status: 'COMPLETED', assigned_mechanic_id: mechs1[0].id,
  }).select().single()
  await admin.from('estimates').insert({ repair_request_id: r6.id }).select().single().then(async ({ data: est6 }) => {
    await admin.from('estimate_items').insert([{ estimate_id: est6.id, description: 'Full synthetic oil + filter', item_type: 'SERVICE', quantity: 1, unit_price: 120 }])
    await admin.from('estimates').update({ status: 'APPROVED' }).eq('id', est6.id)
  })
  const { data: rep6 } = await admin.from('repairs').select('*').eq('repair_request_id', r6.id).single()
  await admin.from('repairs').update({ status: 'COMPLETED', final_cost: 120 }).eq('id', rep6.id)

  console.log('\nDone. Demo login credentials (password for all: Demo1234!):')
  console.log('  Shops:     garage.autofix@demo.autocare.dev, garage.speedtech@demo.autocare.dev, garage.citymotors@demo.autocare.dev')
  console.log('  Customers: john.doe@demo.autocare.dev, ana.k@demo.autocare.dev, petar.n@demo.autocare.dev')
}

main().catch((e) => { console.error(e); process.exit(1) })
