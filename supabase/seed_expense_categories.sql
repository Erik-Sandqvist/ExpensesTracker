-- Seed expense_categories. Kör efter schema.sql i Supabase SQL Editor.
INSERT INTO public.expense_categories (name, slug) VALUES
  ('Bränsle', 'fuel'),
  ('Service', 'service'),
  ('Försäkring', 'insurance'),
  ('Parkering', 'parking'),
  ('Vägtull', 'toll'),
  ('Övrigt', 'other')
ON CONFLICT (slug) DO NOTHING;
