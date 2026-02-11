import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';



export default function HistoryScreen() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const loadHistory = async () => {
        const saved = await AsyncStorage.getItem('injections');
        if (saved) {
        const parsed = JSON.parse(saved);
        parsed.sort((a, b) => b.timestamp - a.timestamp);
        setHistory(parsed);
        }
    };
    loadHistory();
    }, []);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
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
});
