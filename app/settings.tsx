import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';



export default function SettingsScreen() {
  const [recoveryHours, setRecoveryHours] = useState('24');
  const [error, setError] = useState('');

  useEffect(() => {
    const loadSettings = async () => {
      const saved = await AsyncStorage.getItem('recoveryHours');
      if (saved !== null) {
        setRecoveryHours(saved);
      }
    };

    loadSettings();
  }, []);

  useEffect(() => {
    const saveSettings = async () => {
      let value = Number(recoveryHours);

      if (isNaN(value)) value = 24;

      // Clamp between 1 and 168
      value = Math.max(1, Math.min(168, value));

      await AsyncStorage.setItem(
        'recoveryHours',
        value.toString()
      );

      setRecoveryHours(value.toString());
    };

    saveSettings();
  }, [recoveryHours]);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        Recovery window (hours)
      </Text>

      <TextInput
        style={[styles.input,
          error && styles.inputError
        ]}
        keyboardType="numeric"
        value={recoveryHours}
        onChangeText={(text) => {
          const cleaned = text.replace(/[^0-9]/g, '');

          setRecoveryHours(cleaned);

          const value = Number(cleaned);

          if (!cleaned) {
            setError('Please enter a number');
          } else if (value < 1 || value > 168) {
            setError('Value must be between 1 and 168');
          } else {
            setError('');
          }
        }}
      />

      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <Text style={styles.helper}>
          Enter a value between 1 and 168 hours
        </Text>
      )}

      <Text style={styles.helper}>
        Regions used within this time will be highlighted.
      </Text>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 8,
  },
  helper: {
    fontSize: 12,
    color: '#777',
  },
  inputError: {
    borderColor: '#d11a2a',
  },
  errorText: {
    color: '#d11a2a',
    fontSize: 12,
    marginTop: 4,
  },
});
