create table public.waste_sort_scores (
  employee_id text primary key,
  score integer not null,
  correct_count integer not null,
  sorted_count integer not null,
  accuracy smallint not null,
  mode text not null,
  played_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint waste_sort_scores_employee_id_format
    check (employee_id ~ '^[0-9]{7}$'),
  constraint waste_sort_scores_score_nonnegative check (score >= 0),
  constraint waste_sort_scores_counts_valid
    check (
      correct_count >= 0
      and sorted_count >= 0
      and correct_count <= sorted_count
    ),
  constraint waste_sort_scores_accuracy_range check (accuracy between 0 and 100),
  constraint waste_sort_scores_mode_valid
    check (mode in ('learn', 'practice', 'challenge'))
);

comment on table public.waste_sort_scores is
  'Stores only the latest waste sorting game score for each employee.';
comment on column public.waste_sort_scores.employee_id is
  'Unique seven-digit employee identifier.';

create index waste_sort_scores_leaderboard_idx
  on public.waste_sort_scores (score desc, accuracy desc, played_at asc)
  include (correct_count, sorted_count, mode);

alter table public.waste_sort_scores enable row level security;

-- The Next.js server accesses this table with a Supabase secret/service-role key.
-- Browser clients do not receive direct table privileges.
revoke all on table public.waste_sort_scores from anon, authenticated;
grant select, insert, update on table public.waste_sort_scores to service_role;
