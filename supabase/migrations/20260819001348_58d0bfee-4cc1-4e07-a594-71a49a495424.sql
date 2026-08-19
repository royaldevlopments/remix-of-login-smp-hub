insert into public.user_roles (user_id, role)
values ('671c796a-6075-4a62-8ff2-9ede86b8bf93', 'admin')
on conflict (user_id, role) do nothing;

insert into public.profiles (id, display_name)
values ('671c796a-6075-4a62-8ff2-9ede86b8bf93', 'Admin')
on conflict (id) do nothing;