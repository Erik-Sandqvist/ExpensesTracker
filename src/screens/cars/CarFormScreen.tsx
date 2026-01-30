import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { CarsStackParamList } from '../../navigation/CarsStack';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import type { Car } from '../../types/database';

type Props = NativeStackScreenProps<CarsStackParamList, 'CarForm'>;

export function CarFormScreen({ route, navigation }: Props) {
  const { user } = useAuth();
  const existing = route.params?.car;
  const [name, setName] = useState(existing?.name ?? '');
  const [registrationNumber, setRegistrationNumber] = useState(existing?.registration_number ?? '');
  const [brand, setBrand] = useState(existing?.brand ?? '');
  const [model, setModel] = useState(existing?.model ?? '');
  const [year, setYear] = useState(existing?.year ? String(existing.year) : '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (existing) {
      setName(existing.name);
      setRegistrationNumber(existing.registration_number ?? '');
      setBrand(existing.brand ?? '');
      setModel(existing.model ?? '');
      setYear(existing.year ? String(existing.year) : '');
    }
  }, [existing?.id]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Fel', 'Ange ett namn på bilen.');
      return;
    }
    if (!user?.id) return;
    setLoading(true);

    const payload = {
      user_id: user.id,
      name: name.trim(),
      registration_number: registrationNumber.trim() || null,
      brand: brand.trim() || null,
      model: model.trim() || null,
      year: year.trim() ? parseInt(year.trim(), 10) : null,
    };

    if (existing) {
      const { error } = await supabase.from('cars').update(payload).eq('id', existing.id);
      setLoading(false);
      if (error) {
        Alert.alert('Fel', error.message);
      } else {
        navigation.goBack();
      }
    } else {
      const { error } = await supabase.from('cars').insert(payload);
      setLoading(false);
      if (error) {
        Alert.alert('Fel', error.message);
      } else {
        navigation.goBack();
      }
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.field}>
          <Text style={styles.label}>Namn *</Text>
          <TextInput
            style={styles.input}
            placeholder="t.ex. Volvo V70"
            placeholderTextColor="#888"
            value={name}
            onChangeText={setName}
            editable={!loading}
          />
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Registreringsnummer</Text>
          <TextInput
            style={styles.input}
            placeholder="ABC 123"
            placeholderTextColor="#888"
            value={registrationNumber}
            onChangeText={setRegistrationNumber}
            autoCapitalize="characters"
            editable={!loading}
          />
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Märke</Text>
          <TextInput
            style={styles.input}
            placeholder="Volvo"
            placeholderTextColor="#888"
            value={brand}
            onChangeText={setBrand}
            editable={!loading}
          />
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Modell</Text>
          <TextInput
            style={styles.input}
            placeholder="V70"
            placeholderTextColor="#888"
            value={model}
            onChangeText={setModel}
            editable={!loading}
          />
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Årsmodell</Text>
          <TextInput
            style={styles.input}
            placeholder="2020"
            placeholderTextColor="#888"
            value={year}
            onChangeText={setYear}
            keyboardType="number-pad"
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
});
