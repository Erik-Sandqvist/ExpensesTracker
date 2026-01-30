import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Pressable,
  FlatList,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ExpensesStackParamList } from '../../navigation/ExpensesStack';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import type { Expense, Car, ExpenseCategory } from '../../types/database';

type Props = NativeStackScreenProps<ExpensesStackParamList, 'ExpenseForm'>;

function todayISO() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

export function ExpenseFormScreen({ route, navigation }: Props) {
  const { user } = useAuth();
  const existing = route.params?.expense as (Expense & { cars?: Car; expense_categories?: ExpenseCategory }) | undefined;

  const [cars, setCars] = useState<Car[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [carId, setCarId] = useState(existing?.car_id ?? '');
  const [categoryId, setCategoryId] = useState(existing?.category_id ?? '');
  const [amount, setAmount] = useState(existing ? String(existing.amount) : '');
  const [date, setDate] = useState(existing?.date ?? todayISO());
  const [note, setNote] = useState(existing?.note ?? '');
  const [odometerKm, setOdometerKm] = useState(existing?.odometer_km ? String(existing.odometer_km) : '');
  const [loading, setLoading] = useState(false);
  const [carModalVisible, setCarModalVisible] = useState(false);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);

  const fetchCars = useCallback(async () => {
    if (!user?.id) return;
    const { data } = await supabase.from('cars').select('*').eq('user_id', user.id).order('name');
    setCars(data ?? []);
  }, [user?.id]);

  const fetchCategories = useCallback(async () => {
    const { data } = await supabase.from('expense_categories').select('*').order('name');
    setCategories(data ?? []);
  }, []);

  useEffect(() => {
    fetchCars();
    fetchCategories();
  }, [fetchCars, fetchCategories]);

  useEffect(() => {
    if (existing) {
      setCarId(existing.car_id);
      setCategoryId(existing.category_id);
      setAmount(String(existing.amount));
      setDate(existing.date);
      setNote(existing.note ?? '');
      setOdometerKm(existing.odometer_km ? String(existing.odometer_km) : '');
    } else if (cars.length === 1 && !carId) {
      setCarId(cars[0].id);
    }
  }, [existing?.id, cars]);

  const handleSave = async () => {
    if (!user?.id) return;
    if (!carId) {
      Alert.alert('Fel', 'Välj en bil.');
      return;
    }
    if (!categoryId) {
      Alert.alert('Fel', 'Välj en kategori.');
      return;
    }
    const amountNum = parseFloat(amount.replace(',', '.'));
    if (isNaN(amountNum) || amountNum <= 0) {
      Alert.alert('Fel', 'Ange ett giltigt belopp.');
      return;
    }
    if (!date.trim()) {
      Alert.alert('Fel', 'Ange datum.');
      return;
    }

    setLoading(true);

    const payload = {
      car_id: carId,
      user_id: user.id,
      category_id: categoryId,
      amount: amountNum,
      currency: 'SEK',
      date: date,
      note: note.trim() || null,
      odometer_km: odometerKm.trim() ? parseInt(odometerKm.trim(), 10) : null,
    };

    if (existing) {
      const { error } = await supabase.from('expenses').update(payload).eq('id', existing.id);
      setLoading(false);
      if (error) {
        Alert.alert('Fel', error.message);
      } else {
        navigation.goBack();
      }
    } else {
      const { error } = await supabase.from('expenses').insert(payload);
      setLoading(false);
      if (error) {
        Alert.alert('Fel', error.message);
      } else {
        navigation.goBack();
      }
    }
  };

  const selectedCar = cars.find((c) => c.id === carId);
  const selectedCategory = categories.find((c) => c.id === categoryId);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.field}>
          <Text style={styles.label}>Bil *</Text>
          <TouchableOpacity
            style={styles.picker}
            onPress={() => setCarModalVisible(true)}
            disabled={loading}
          >
            <Text style={selectedCar ? styles.pickerText : styles.pickerPlaceholder}>
              {selectedCar ? selectedCar.name : 'Välj bil'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Kategori *</Text>
          <TouchableOpacity
            style={styles.picker}
            onPress={() => setCategoryModalVisible(true)}
            disabled={loading}
          >
            <Text style={selectedCategory ? styles.pickerText : styles.pickerPlaceholder}>
              {selectedCategory ? selectedCategory.name : 'Välj kategori'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Belopp (SEK) *</Text>
          <TextInput
            style={styles.input}
            placeholder="0"
            placeholderTextColor="#888"
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            editable={!loading}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Datum *</Text>
          <TextInput
            style={styles.input}
            placeholder="ÅÅÅÅ-MM-DD"
            placeholderTextColor="#888"
            value={date}
            onChangeText={setDate}
            editable={!loading}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Antal km (valfritt)</Text>
          <TextInput
            style={styles.input}
            placeholder="Miltal"
            placeholderTextColor="#888"
            value={odometerKm}
            onChangeText={setOdometerKm}
            keyboardType="number-pad"
            editable={!loading}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Notering</Text>
          <TextInput
            style={[styles.input, styles.inputMultiline]}
            placeholder="Valfri notering"
            placeholderTextColor="#888"
            value={note}
            onChangeText={setNote}
            multiline
            numberOfLines={3}
            editable={!loading}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>{existing ? 'Spara' : 'Lägg till'}</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={carModalVisible} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setCarModalVisible(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Välj bil</Text>
            <FlatList
              data={cars}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.modalOption, carId === item.id && styles.modalOptionSelected]}
                  onPress={() => {
                    setCarId(item.id);
                    setCarModalVisible(false);
                  }}
                >
                  <Text style={styles.modalOptionText}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </Pressable>
      </Modal>

      <Modal visible={categoryModalVisible} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setCategoryModalVisible(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Välj kategori</Text>
            <FlatList
              data={categories}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.modalOption, categoryId === item.id && styles.modalOptionSelected]}
                  onPress={() => {
                    setCategoryId(item.id);
                    setCategoryModalVisible(false);
                  }}
                >
                  <Text style={styles.modalOptionText}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#12121a',
  },
  scroll: {
    padding: 16,
    paddingBottom: 48,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#888',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#2d2d44',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#fff',
  },
  inputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  picker: {
    backgroundColor: '#2d2d44',
    borderRadius: 12,
    padding: 16,
  },
  pickerText: {
    fontSize: 16,
    color: '#fff',
  },
  pickerPlaceholder: {
    fontSize: 16,
    color: '#888',
  },
  button: {
    backgroundColor: '#4a9eff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
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
    maxHeight: '70%',
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
