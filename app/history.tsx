import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';



export default function HistoryScreen() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const loadHistory = async () => {
      const saved = await AsyncStorage.getItem('injections');

      if (!saved) {
        setHistory([]);
        return;
      }

      const parsed = JSON.parse(saved);

      const sorted = parsed.sort(
        (a, b) => b.timestamp - a.timestamp
      );

      setHistory(sorted);
    };

    loadHistory();
  }, []);

  const confirmDelete = (id) => {
    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this injection?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteEntry(id),
        },
      ]
    );
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };
  
  const deleteEntry = async (id) => {
    const updated = history.filter((item) => item.id !== id);

    setHistory(updated);
    await AsyncStorage.setItem('injections', JSON.stringify(updated));
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.region}>{item.region}</Text>
            <Text style={styles.time}>{formatTime(item.timestamp)}</Text>
            <Pressable
              style={styles.deleteButton}
              onPress={() => confirmDelete(item.id)}
            >
              <Text style={styles.deleteText}>Delete</Text>
            </Pressable>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>No injections recorded yet.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  item: {
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderRadius: 8,
  },
  region: {
    fontWeight: 'bold',
  },
  time: {
    color: '#555',
  },
  empty: {
    textAlign: 'center',
    marginTop: 40,
    color: '#777',
  },
  deleteButton: {
  marginTop: 8,
  paddingVertical: 6,
  borderRadius: 6,
  alignItems: 'center',
  backgroundColor: '#ffecec',
  },
  deleteText: {
    color: '#d11a2a',
    fontWeight: '600',
  },
});
