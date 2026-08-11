comment on table public.waste_sort_scores is
  'Stores the highest waste sorting game score for each employee.';

create or replace function public.preserve_highest_waste_sort_score()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if new.score < old.score then
    return old;
  end if;

  return new;
end;
$$;

revoke all on function public.preserve_highest_waste_sort_score()
  from public, anon, authenticated;
grant execute on function public.preserve_highest_waste_sort_score()
  to service_role;

drop trigger if exists preserve_highest_waste_sort_score
  on public.waste_sort_scores;

create trigger preserve_highest_waste_sort_score
before update of score on public.waste_sort_scores
for each row
execute function public.preserve_highest_waste_sort_score();
