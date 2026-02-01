import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FontAwesome5 } from '@expo/vector-icons';
import { CarsStack } from './CarsStack';
import { ExpensesStack } from './ExpensesStack';
import { OverviewScreen } from '../screens/overview/OverviewScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';

export type MainTabParamList = {
  CarsTab: undefined;
  ExpensesTab: undefined;
  OverviewTab: undefined;
  ProfileTab: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#4a9eff',
        tabBarInactiveTintColor: '#666',
        headerStyle: { backgroundColor: '#1a1a2e' },
        headerTintColor: '#fff',
        tabBarStyle: { backgroundColor: '#1a1a2e', borderTopColor: '#2d2d44' },
      }}
    >
      <Tab.Screen
        name="CarsTab"
        component={CarsStack}
        options={{
          title: 'Bilar',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="car" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ExpensesTab"
        component={ExpensesStack}
        options={{
          title: 'Utgifter',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="receipt" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="OverviewTab"
        component={OverviewScreen}
        options={{
          title: 'Översikt',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="chart-bar" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="user" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
