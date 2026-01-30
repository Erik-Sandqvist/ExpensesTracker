# Bilutgifter – utgiftsapp för bil

React Native (Expo)-app för att hålla koll på bilrelaterade utgifter. Använder Supabase för autentisering och databas.

## Krav

- Node.js 20.19.4+ (krävs för Expo SDK 54)
- npm eller yarn
- Expo Go-app på telefon (valfritt) eller Android/iOS-simulator

## Supabase-setup

1. Skapa ett projekt på [supabase.com](https://supabase.com).
2. Gå till **SQL Editor** och kör innehållet i:
   - `supabase/schema.sql` (tabeller och RLS)
   - `supabase/seed_expense_categories.sql` (kategorier: Bränsle, Service, etc.)
3. Gå till **Project Settings → API** och kopiera:
   - Project URL
   - anon public key

## Lokal körning

1. Klona/öppna projektet och installera beroenden (Expo SDK 54):

   ```bash
   npm install
   npx expo install --fix
   ```

2. Skapa filen `.env` i projektets rot (kopiera från `.env.example`):

   ```
   EXPO_PUBLIC_SUPABASE_URL=https://ditt-projekt.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=din-anon-key
   ```

3. Starta Expo:

   ```bash
   npx expo start
   ```

4. Skanna QR-koden med Expo Go eller tryck `a` (Android) / `i` (iOS) för simulator.

   **Om inget händer när du skannar QR-koden** (telefon och dator på olika nätverk eller brandvägg): starta med tunnel så att telefonen når Metro via internet:

   ```bash
   npx expo start --tunnel
   ```

   Skanna sedan den nya QR-koden med Expo Go.

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
