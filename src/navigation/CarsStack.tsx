import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CarsListScreen } from '../screens/cars/CarsListScreen';
import { CarFormScreen } from '../screens/cars/CarFormScreen';
import type { Car } from '../types/database';

export type CarsStackParamList = {
  CarsList: undefined;
  CarForm: { car?: Car } | undefined;
};

const Stack = createNativeStackNavigator<CarsStackParamList>();

export function CarsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#1a1a2e' },
        headerTintColor: '#fff',
      }}
    >
      <Stack.Screen name="CarsList" component={CarsListScreen} options={{ title: 'Mina bilar' }} />
      <Stack.Screen
        name="CarForm"
        component={CarFormScreen}
        options={({ route }) => ({ title: route.params?.car ? 'Redigera bil' : 'Lägg till bil' })}
      />
    </Stack.Navigator>
  );
}
