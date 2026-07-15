import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { useContext, useEffect, useState } from 'react';
import { Alert, Keyboard, Pressable, StyleSheet, Text, TextInput, TouchableWithoutFeedback, View } from 'react-native';
import { InjectionContext } from '../context/InjectionContext';



export default function SettingsScreen() {
  const [recoveryHours, setRecoveryHours] = useState('24');
  const [error, setError] = useState('');
  const {
    injections,
    replaceInjections,
    clearHistory,
  } = useContext(InjectionContext);


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

  const exportHistory = async () => {
    try {
      const fileUri =
        FileSystem.documentDirectory +
        'injection-history.json';

      await FileSystem.writeAsStringAsync(
        fileUri,
        JSON.stringify(injections, null, 2)
      );

      await Sharing.shareAsync(fileUri);
    } catch (error) {
      console.error(error);
    }
  };

  const importHistory = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
      });

      if (result.canceled) return;

      const uri = result.assets[0].uri;
      const contents = await FileSystem.readAsStringAsync(uri); 

      const parsed = JSON.parse(contents);

      if (!Array.isArray(parsed)) {
        Alert.alert(
          'Import failed',
          'The selected file is not a valid history export.'
        );
        return;
      }

      const valid = parsed.every((item) =>
        typeof item.id === 'string' &&
        typeof item.region === 'string' &&
        typeof item.timestamp === 'number'
      );

      if (!valid) {
        Alert.alert(
          'Import failed',
          'The file format is invalid.'
        );
        return;
      }

      Alert.alert(
        'Import History',
        `Import ${parsed.length} injections?\n\nThis will replace your current history.`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Import',
            onPress: () => replaceInjections(parsed),
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        'Import failed',
        'Could not read the selected file.'
      );
    }
  };

  const confirmClearHistory = () => {
    Alert.alert(
      'Clear History',
      'This will permanently delete all injection history.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: clearHistory,
        },
      ]
    );
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Text style={styles.label}>
          Recovery window (hours)
        </Text>

        <TextInput
          style={[styles.input,
            error && styles.inputError
          ]}
          keyboardType="numeric"
          returnKeyType='done'
          onSubmitEditing={Keyboard.dismiss}
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
        <Pressable
          style={styles.exportButton}
          onPress={exportHistory}
        >
          <Text style={styles.exportText}>
            Export History
        </Text>
      </Pressable>  

      <Pressable
        style={styles.exportButton}
        onPress={importHistory}
      >
        <Text style={styles.exportText}>
          Import History
        </Text>
      </Pressable>

      <Pressable
        style={styles.clearButton}
        onPress={confirmClearHistory}
      >
        <Text style={styles.clearText}>
          Clear History
        </Text>
      </Pressable>

      </View>    
    </TouchableWithoutFeedback>
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
  exportButton: {
    backgroundColor: '#4a90e2',
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  exportText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
  },
  clearButton: {
    marginTop: 12,
    backgroundColor: '#d9534f',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  clearText: {
    color: 'white',
    fontWeight: 'bold',
  },
  importButton: {
    backgroundColor: '#4a90e2',
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  importText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
  },
});
