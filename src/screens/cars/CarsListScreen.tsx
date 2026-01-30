import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { CarsStackParamList } from '../../navigation/CarsStack';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import type { Car } from '../../types/database';

type CarsListScreenNavigationProp = NativeStackNavigationProp<CarsStackParamList, 'CarsList'>;

export function CarsListScreen() {
  const navigation = useNavigation<CarsListScreenNavigationProp>();
  const { user } = useAuth();
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCars = useCallback(async () => {
    if (!user?.id) return;
    const { data, error } = await supabase
      .from('cars')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (error) {
      console.error('fetchCars', error);
      return;
    }
    setCars(data ?? []);
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        setLoading(true);
        await fetchCars();
        if (!cancelled) setLoading(false);
      })();
      return () => {
        cancelled = true;
      };
    }, [fetchCars])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCars();
    setRefreshing(false);
  };

  const handleDelete = (car: Car) => {
    Alert.alert(
      'Ta bort bil',
      `Vill du ta bort "${car.name}"? Utgifter kopplade till bilen tas också bort.`,
      [
        { text: 'Avbryt', style: 'cancel' },
        {
          text: 'Ta bort',
          style: 'destructive',
          onPress: async () => {
            const { error } = await supabase.from('cars').delete().eq('id', car.id);
            if (error) {
              Alert.alert('Fel', error.message);
            } else {
              await fetchCars();
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: Car }) => (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.cardContent}
        onPress={() => navigation.navigate('CarForm', { car: item })}
        activeOpacity={0.7}
      >
        <Text style={styles.carName}>{item.name}</Text>
        {(item.registration_number || item.brand || item.model) && (
          <Text style={styles.carMeta}>
            {[item.registration_number, item.brand, item.model, item.year ? String(item.year) : null]
              .filter(Boolean)
              .join(' · ')}
          </Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.deleteBtn}
        onPress={() => handleDelete(item)}
      >
        <Text style={styles.deleteBtnText}>Ta bort</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading && cars.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4a9eff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={cars}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>Inga bilar. Lägg till din första bil.</Text>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4a9eff" />
        }
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CarForm')}
        activeOpacity={0.8}
      >
        <Text style={styles.fabText}>+ Lägg till bil</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#12121a',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#12121a',
  },
  list: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#2d2d44',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
    padding: 16,
  },
  carName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  carMeta: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  deleteBtn: {
    padding: 16,
  },
  deleteBtnText: {
    color: '#e74c3c',
    fontSize: 14,
  },
  empty: {
    color: '#888',
    textAlign: 'center',
    marginTop: 48,
    fontSize: 16,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    backgroundColor: '#4a9eff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  fabText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
