export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Profile {
  id: string;
  email: string | null;
  display_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface Car {
  id: string;
  user_id: string;
  name: string;
  registration_number: string | null;
  brand: string | null;
  model: string | null;
  year: number | null;
  created_at: string;
  updated_at: string;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  slug: string | null;
  created_at: string;
}

export interface Expense {
  id: string;
  car_id: string;
  user_id: string;
  category_id: string;
  amount: number;
  currency: string;
  date: string;
  note: string | null;
  odometer_km: number | null;
  created_at: string;
  updated_at: string;
  cars?: Car | null;
  expense_categories?: ExpenseCategory | null;
}

export interface ExpenseInsert {
  car_id: string;
  user_id: string;
  category_id: string;
  amount: number;
  currency?: string;
  date: string;
  note?: string | null;
  odometer_km?: number | null;
}

export interface CarInsert {
  user_id: string;
  name: string;
  registration_number?: string | null;
  brand?: string | null;
  model?: string | null;
  year?: number | null;
}
