# Bilutgifter – utgiftsapp för bil

React Native (Expo)-app för att hålla koll på bilrelaterade utgifter. Använder Supabase för autentisering och databas.

## Krav

- Node.js 20.19.4+ (krävs för Expo SDK 54)
- npm eller yarn
- Expo Go-app på telefon (valfritt) eller Android/iOS-simulator


## Funktioner

- **Inloggning/registrering** med e-post och lösenord (Supabase Auth)
- **Bilar** – lägg till, redigera och ta bort bilar (namn, regnr, märke, modell, år)
- **Utgifter** – registrera utgifter per bil med kategori, belopp, datum, notering och valfritt miltal
- **Kategorier** – Bränsle, Service, Försäkring, Parkering, Vägtull, Övrigt (från databas)
- **Översikt** – totalt och summering per kategori respektive per bil
- **Profil** – visa e-post och logga ut

## Projektstruktur

- `App.tsx` – rot med AuthProvider och RootNavigator
- `src/contexts/AuthContext.tsx` – auth-state och signIn/signUp/signOut
- `src/lib/supabase.ts` – Supabase-klient med AsyncStorage för session
- `src/navigation/` – Auth-stack, Main-tabs, Cars-stack, Expenses-stack
- `src/screens/` – Login, Register, Cars (lista/form), Expenses (lista/form), Overview, Profile
- `src/types/database.ts` – TypeScript-typer för tabeller
- `supabase/schema.sql` – tabeller och RLS
- `supabase/seed_expense_categories.sql` – seed för kategorier
