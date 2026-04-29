-- Demo seed data.
-- 1. Create a user through Supabase Auth.
-- 2. Replace the UUID below with that user's auth.users.id.
-- 3. Run this file in the SQL editor.

do $$
declare
  demo_user uuid := '00000000-0000-0000-0000-000000000000';
  job_one uuid := gen_random_uuid();
  job_two uuid := gen_random_uuid();
  job_three uuid := gen_random_uuid();
begin
  insert into public.profiles (
    id,
    email,
    company_name,
    phone,
    address,
    default_labour_rate,
    default_markup,
    tax_rate,
    proposal_terms,
    preferred_suppliers,
    service_area,
    ai_tone
  )
  values (
    demo_user,
    'owner@evergreen-demo.com',
    'Evergreen Outdoor Services',
    '(555) 018-4400',
    '124 Willow Street, Portland, OR',
    72,
    28,
    8.5,
    '50% deposit due on acceptance. Balance due on substantial completion. Changes require written approval.',
    'SiteOne, Local Stone Yard, Green Valley Nursery',
    'Portland metro and surrounding suburbs',
    'Professional'
  )
  on conflict (id) do update set
    company_name = excluded.company_name,
    default_labour_rate = excluded.default_labour_rate,
    default_markup = excluded.default_markup,
    tax_rate = excluded.tax_rate;

  insert into public.jobs (
    id,
    user_id,
    job_name,
    client_name,
    client_email,
    client_phone,
    property_address,
    job_type,
    status,
    budget_range,
    desired_timeline,
    client_notes,
    site_visit_notes,
    measurements,
    estimated_value,
    created_at,
    updated_at
  )
  values (
    job_one,
    demo_user,
    'Maple Ridge Front Yard Refresh',
    'Avery Thompson',
    'avery@example.com',
    '(555) 018-1020',
    '44 Maple Ridge Lane',
    'Garden bed installation',
    'Estimating',
    '$8,000 - $12,000',
    'Before Memorial Day weekend',
    'Client wants curb appeal before listing the home. Existing beds are overgrown. Interested in low-maintenance planting and fresh edging.',
    'Front bed is roughly 52 linear feet. Soil is compacted near driveway. Downspout discharge should be redirected before mulch install.',
    'Front bed: 52 ft x 5 ft average. Walkway edge: 34 ft. Mulch depth requested: 3 in.',
    10850,
    now() - interval '10 days',
    now() - interval '2 days'
  );

  insert into public.jobs (
    id,
    user_id,
    job_name,
    client_name,
    client_email,
    client_phone,
    property_address,
    job_type,
    status,
    budget_range,
    desired_timeline,
    client_notes,
    site_visit_notes,
    measurements,
    estimated_value,
    final_value,
    actual_labour_hours,
    profit_margin,
    lessons_learned,
    issues_encountered,
    created_at,
    updated_at
  )
  values (
    job_two,
    demo_user,
    'Cedar Court Sod Replacement',
    'Marcus Lee',
    'marcus@example.com',
    '(555) 018-2085',
    '91 Cedar Court',
    'Sod installation',
    'Completed',
    '$5,000 - $7,500',
    'Completed in March',
    'Replace patchy back lawn after drainage work. Client wanted resilient turf for kids and dog.',
    'Backyard had low corner near patio. Added soil amendment and minor regrading.',
    'Back lawn: 1,180 sq ft. Access width: 42 in gate.',
    6420,
    6750,
    46,
    31,
    'Add a half-day buffer when gate access is under 48 inches. Crew spent extra time hand-carrying rolls.',
    'Drainage remained soft after rain and needed additional topsoil.',
    now() - interval '45 days',
    now() - interval '28 days'
  );

  insert into public.jobs (
    id,
    user_id,
    job_name,
    client_name,
    client_email,
    client_phone,
    property_address,
    job_type,
    status,
    budget_range,
    desired_timeline,
    client_notes,
    site_visit_notes,
    measurements,
    estimated_value,
    issues_encountered,
    created_at,
    updated_at
  )
  values (
    job_three,
    demo_user,
    'Oak Hollow Paver Patio',
    'Priya Shah',
    'priya@example.com',
    '(555) 018-9133',
    '8 Oak Hollow Drive',
    'Interlock/pavers',
    'Proposal Sent',
    '$18,000 - $25,000',
    'Early summer',
    'Client wants a 420 sq ft patio with seating wall and premium pavers. Asked for lighting as optional add-on.',
    'Good access from side yard. Existing slope toward house requires base and drainage attention.',
    'Patio area: 420 sq ft. Seating wall: 22 linear ft. Excavation depth: 9 in.',
    23800,
    'Slope toward house requires drainage attention.',
    now() - interval '20 days',
    now() - interval '3 days'
  );

  insert into public.ai_analyses (
    job_id,
    user_id,
    project_summary,
    missing_information,
    risks,
    suggested_questions,
    upsells,
    complexity_rating,
    recommended_next_step,
    raw_json
  )
  values (
    job_one,
    demo_user,
    'Refresh the front landscape beds with removals, soil preparation, low-maintenance planting, edging, mulch, and drainage attention near the driveway.',
    array['Confirm plant palette preference and deer resistance needs.', 'Confirm whether downspout redirection is included or handled by another contractor.', 'Confirm disposal expectations for removed shrubs and soil.'],
    array['Compacted soil may require additional amendment or excavation.', 'Downspout discharge can wash out mulch if not corrected.', 'Listing deadline creates schedule pressure.'],
    array['Do you want evergreen structure, flowering color, or a mix?', 'Should the proposal include downspout extension and splash control?', 'Are there HOA or listing-photo timing constraints?'],
    array['Low-voltage path lighting', 'Seasonal maintenance package', 'Premium steel edging upgrade'],
    3,
    'Confirm drainage scope and planting preferences before issuing a final proposal.',
    '{}'::jsonb
  );

  insert into public.estimate_line_items (
    job_id,
    user_id,
    category,
    description,
    quantity,
    unit,
    unit_cost,
    labour_hours,
    labour_rate,
    markup_percentage,
    total
  )
  values
    (job_one, demo_user, 'Site prep', 'Remove overgrown shrubs, weeds, and existing mulch', 1, 'allowance', 450, 14, 72, 20, 1749.60),
    (job_one, demo_user, 'Materials', 'Plants, compost, mulch, edging, and fasteners', 1, 'package', 3850, 0, 72, 28, 4928.00),
    (job_one, demo_user, 'Installation', 'Install bed edge, soil amendments, plants, and mulch', 1, 'crew day', 0, 42, 72, 18, 3568.32);

  insert into public.material_items (
    job_id,
    user_id,
    material_name,
    quantity,
    unit,
    supplier,
    estimated_cost,
    notes
  )
  values
    (job_one, demo_user, 'Triple-shred hardwood mulch', 2.5, 'cu yd', 'Green Valley Nursery', 105, 'Assumes 3 inch depth across 260 sq ft'),
    (job_one, demo_user, 'Powder-coated steel edging', 86, 'ft', 'SiteOne', 481.60, 'Includes front bed and walkway transitions');

  insert into public.proposals (
    job_id,
    user_id,
    title,
    content,
    price,
    status
  )
  values (
    job_one,
    demo_user,
    'Front Yard Landscape Refresh Proposal',
    'Dear Avery,\n\nThank you for inviting Evergreen Outdoor Services to prepare a front yard refresh for Maple Ridge Lane. This proposal includes bed cleanup, soil preparation, new low-maintenance plantings, steel edging, mulch, and cleanup.\n\nScope of Work\n- Remove overgrown shrubs, weeds, and tired mulch from front beds.\n- Prepare soil with compost amendments where needed.\n- Install selected shrubs and perennial accents.\n- Install clean edging transitions along lawn and walkway.\n- Apply hardwood mulch and complete final cleanup.\n\nNext Steps\nApprove the proposal and deposit to reserve the installation window.',
    10850,
    'Draft'
  );

  insert into public.crew_instructions (job_id, user_id, content)
  values (
    job_one,
    demo_user,
    'Job Summary: Front bed refresh with removals, soil prep, edging, planting, mulch, and drainage attention.\n\nArrival Notes: Park along curb without blocking driveway. Confirm plant layout with estimator before digging.\n\nTools Needed: Shovels, edging spade, wheelbarrows, tarp, pruners, compact rake, drill, PPE.\n\nWork Plan:\n1. Walk site and mark utilities/irrigation heads.\n2. Remove existing shrubs and weeds.\n3. Prep compacted soil near driveway.\n4. Install edging and verify curves from street view.\n5. Set plants before digging final holes.\n6. Install mulch and clean hard surfaces.'
  );
end $$;
