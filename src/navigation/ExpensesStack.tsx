import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ExpensesListScreen } from '../screens/expenses/ExpensesListScreen';
import { ExpenseFormScreen } from '../screens/expenses/ExpenseFormScreen';
import type { Expense } from '../types/database';

export type ExpensesStackParamList = {
  ExpensesList: undefined;
  ExpenseForm: { expense?: Expense } | undefined;
};

const Stack = createNativeStackNavigator<ExpensesStackParamList>();

export function ExpensesStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#1a1a2e' },
        headerTintColor: '#fff',
      }}
    >
      <Stack.Screen name="ExpensesList" component={ExpensesListScreen} options={{ title: 'Utgifter' }} />
      <Stack.Screen
        name="ExpenseForm"
        component={ExpenseFormScreen}
        options={({ route }) => ({ title: route.params?.expense ? 'Redigera utgift' : 'Lägg till utgift' })}
      />
    </Stack.Navigator>
  );
}
