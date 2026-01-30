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
  Modal,
  Pressable,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { ExpensesStackParamList } from '../../navigation/ExpensesStack';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import type { Expense, Car, ExpenseCategory } from '../../types/database';

type ExpenseWithRelations = Expense & {
  cars?: Car | null;
  expense_categories?: ExpenseCategory | null;
};

type ExpensesListScreenNavigationProp = NativeStackNavigationProp<
  ExpensesStackParamList,
  'ExpensesList'
>;

function formatDate(s: string) {
  const d = new Date(s);
  return d.toLocaleDateString('sv-SE', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatAmount(amount: number, currency: string) {
  return `${Number(amount).toLocaleString('sv-SE')} ${currency}`;
}

export function ExpensesListScreen() {
  const navigation = useNavigation<ExpensesListScreenNavigationProp>();
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<ExpenseWithRelations[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterCarId, setFilterCarId] = useState<string | null>(null);
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  const fetchCars = useCallback(async () => {
    if (!user?.id) return;
    const { data } = await supabase
      .from('cars')
      .select('*')
      .eq('user_id', user.id)
      .order('name');
    setCars(data ?? []);
  }, [user?.id]);

  const fetchExpenses = useCallback(async () => {
    if (!user?.id) return;
    let q = supabase
      .from('expenses')
      .select('*, cars(*), expense_categories(*)')
      .eq('user_id', user.id)
      .order('date', { ascending: false });
    if (filterCarId) {
      q = q.eq('car_id', filterCarId);
    }
    const { data, error } = await q;
    if (error) {
      console.error('fetchExpenses', error);
      return;
    }
    setExpenses(data ?? []);
  }, [user?.id, filterCarId]);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        setLoading(true);
        await fetchCars();
        await fetchExpenses();
        if (!cancelled) setLoading(false);
      })();
      return () => {
        cancelled = true;
      };
    }, [fetchCars, fetchExpenses])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCars();
    await fetchExpenses();
    setRefreshing(false);
  };

  const handleDelete = (expense: ExpenseWithRelations) => {
    Alert.alert(
      'Ta bort utgift',
      `Vill du ta bort denna utgift (${formatAmount(expense.amount, expense.currency)})?`,
      [
        { text: 'Avbryt', style: 'cancel' },
        {
          text: 'Ta bort',
          style: 'destructive',
          onPress: async () => {
            const { error } = await supabase.from('expenses').delete().eq('id', expense.id);
            if (error) {
              Alert.alert('Fel', error.message);
            } else {
              await fetchExpenses();
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: ExpenseWithRelations }) => (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.cardContent}
        onPress={() => navigation.navigate('ExpenseForm', { expense: item })}
        activeOpacity={0.7}
      >
        <View style={styles.row}>
          <Text style={styles.amount}>{formatAmount(item.amount, item.currency)}</Text>
          <Text style={styles.date}>{formatDate(item.date)}</Text>
        </View>
        <Text style={styles.category}>{item.expense_categories?.name ?? 'Okänd kategori'}</Text>
        {item.cars?.name && (
          <Text style={styles.car}>{item.cars.name}</Text>
        )}
        {item.note ? (
          <Text style={styles.note} numberOfLines={1}>{item.note}</Text>
        ) : null}
      </TouchableOpacity>
      <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item)}>
        <Text style={styles.deleteBtnText}>Ta bort</Text>
      </TouchableOpacity>
    </View>
  );

  const selectedCarName = filterCarId
    ? cars.find((c) => c.id === filterCarId)?.name ?? 'Alla bilar'
    : 'Alla bilar';

  if (loading && expenses.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4a9eff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.filterBar}
        onPress={() => setFilterModalVisible(true)}
      >
        <Text style={styles.filterLabel}>Bil: {selectedCarName}</Text>
        <Text style={styles.filterChevron}>▼</Text>
      </TouchableOpacity>

      <FlatList
        data={expenses}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>Inga utgifter. Lägg till din första utgift.</Text>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4a9eff" />
        }
      />

      <Modal
        visible={filterModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setFilterModalVisible(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filtrera på bil</Text>
            <TouchableOpacity
              style={[styles.modalOption, !filterCarId && styles.modalOptionSelected]}
              onPress={() => {
                setFilterCarId(null);
                setFilterModalVisible(false);
              }}
            >
              <Text style={styles.modalOptionText}>Alla bilar</Text>
            </TouchableOpacity>
            {cars.map((car) => (
              <TouchableOpacity
                key={car.id}
                style={[
                  styles.modalOption,
                  filterCarId === car.id && styles.modalOptionSelected,
                ]}
                onPress={() => {
                  setFilterCarId(car.id);
                  setFilterModalVisible(false);
                }}
              >
                <Text style={styles.modalOptionText}>{car.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('ExpenseForm')}
        activeOpacity={0.8}
      >
        <Text style={styles.fabText}>+ Lägg till utgift</Text>
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
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#1a1a2e',
    borderBottomWidth: 1,
    borderBottomColor: '#2d2d44',
  },
  filterLabel: {
    fontSize: 14,
    color: '#fff',
  },
  filterChevron: {
    fontSize: 10,
    color: '#888',
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amount: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  date: {
    fontSize: 14,
    color: '#888',
  },
  category: {
    fontSize: 14,
    color: '#4a9eff',
    marginTop: 4,
  },
  car: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  note: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
    fontStyle: 'italic',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#2d2d44',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    maxWidth: 320,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  modalOption: {
    padding: 14,
    borderRadius: 8,
  },
  modalOptionSelected: {
    backgroundColor: '#4a9eff33',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#fff',
  },
});
