import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

type CategorySum = { category_name: string; total: number };
type CarSum = { car_name: string; total: number };

export function OverviewScreen() {
  const { user } = useAuth();
  const [totalAmount, setTotalAmount] = useState<number | null>(null);
  const [byCategory, setByCategory] = useState<CategorySum[]>([]);
  const [byCar, setByCar] = useState<CarSum[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSummary = useCallback(async () => {
    if (!user?.id) return;

    const { data: expenses } = await supabase
      .from('expenses')
      .select('amount, category_id, car_id, expense_categories(name), cars(name)')
      .eq('user_id', user.id);

    if (!expenses || expenses.length === 0) {
      setTotalAmount(0);
      setByCategory([]);
      setByCar([]);
      return;
    }

    const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    setTotalAmount(total);

    const categoryMap = new Map<string, number>();
    const carMap = new Map<string, number>();

    for (const e of expenses) {
      const cat = (e as { expense_categories?: { name: string } }).expense_categories?.name ?? 'Okänd';
      categoryMap.set(cat, (categoryMap.get(cat) ?? 0) + Number(e.amount));
      const car = (e as { cars?: { name: string } }).cars?.name ?? 'Okänd bil';
      carMap.set(car, (carMap.get(car) ?? 0) + Number(e.amount));
    }

    setByCategory(
      Array.from(categoryMap.entries())
        .map(([category_name, total]) => ({ category_name, total }))
        .sort((a, b) => b.total - a.total)
    );
    setByCar(
      Array.from(carMap.entries())
        .map(([car_name, total]) => ({ car_name, total }))
        .sort((a, b) => b.total - a.total)
    );
  }, [user?.id]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      await fetchSummary();
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [fetchSummary]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchSummary();
    setRefreshing(false);
  };

  if (loading && totalAmount === null) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4a9eff" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scroll}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4a9eff" />
      }
    >
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Totalt (alla utgifter)</Text>
        <Text style={styles.totalAmount}>
          {totalAmount != null ? `${Number(totalAmount).toLocaleString('sv-SE')} SEK` : '–'}
        </Text>
      </View>

      {byCategory.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Per kategori</Text>
          <View style={styles.card}>
            {byCategory.map(({ category_name, total }) => (
              <View key={category_name} style={styles.row}>
                <Text style={styles.rowLabel}>{category_name}</Text>
                <Text style={styles.rowValue}>{total.toLocaleString('sv-SE')} SEK</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {byCar.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Per bil</Text>
          <View style={styles.card}>
            {byCar.map(({ car_name, total }) => (
              <View key={car_name} style={styles.row}>
                <Text style={styles.rowLabel}>{car_name}</Text>
                <Text style={styles.rowValue}>{total.toLocaleString('sv-SE')} SEK</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {totalAmount === 0 && (
        <Text style={styles.empty}>Inga utgifter registrerade ännu.</Text>
      )}
    </ScrollView>
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
  scroll: {
    padding: 16,
    paddingBottom: 48,
  },
  card: {
    backgroundColor: '#2d2d44',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
  },
  totalAmount: {
    fontSize: 28,
    fontWeight: '700',
    color: '#4a9eff',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#3d3d5c',
  },
  rowLabel: {
    fontSize: 16,
    color: '#fff',
  },
  rowValue: {
    fontSize: 16,
    color: '#4a9eff',
    fontWeight: '500',
  },
  empty: {
    color: '#888',
    textAlign: 'center',
    marginTop: 24,
    fontSize: 16,
  },
});
