import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

export function ProfileScreen() {
  const { user, signOut } = useAuth();

  const handleSignOut = () => {
    Alert.alert('Logga ut', 'Vill du logga ut?', [
      { text: 'Avbryt', style: 'cancel' },
      { text: 'Logga ut', style: 'destructive', onPress: signOut },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.label}>E-post</Text>
        <Text style={styles.email}>{user?.email ?? '–'}</Text>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut} activeOpacity={0.8}>
        <Text style={styles.logoutText}>Logga ut</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#12121a',
    padding: 16,
  },
  card: {
    backgroundColor: '#2d2d44',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    color: '#888',
    marginBottom: 6,
  },
  email: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '500',
  },
  logoutButton: {
    backgroundColor: '#e74c3c',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
