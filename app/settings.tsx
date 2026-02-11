import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';



export default function SettingsScreen() {
  const [recoveryHours, setRecoveryHours] = useState('24');

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
      await AsyncStorage.setItem('recoveryHours', recoveryHours);
    };

    saveSettings();
  }, [recoveryHours]);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        Recovery window (hours)
      </Text>

      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={recoveryHours}
        onChangeText={setRecoveryHours}
      />

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
});
