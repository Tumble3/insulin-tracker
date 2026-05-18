import { useContext } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { InjectionContext } from '../context/InjectionContext';


export default function HistoryScreen() {
  //const [history, setHistory] = useState([]);
  const { injections, deleteInjection } = useContext(InjectionContext);

  const confirmDelete = (id) => {
    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this injection?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteInjection(id)
        },
      ]
    );
  };

  const getDayLabel = (timestamp: number) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date();

    yesterday.setDate(today.getDate() - 1);

    const isSameDay = (a: Date, b: Date) =>
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate();

    if (isSameDay(date, today)) return 'Today';
    if (isSameDay(date, yesterday)) return 'Yesterday';

    return date.toLocaleDateString();
  };

  const grouped = injections
    .slice()
    .sort((a, b) => b.timestamp - a.timestamp)
    .reduce((acc, item) => {
      const label = getDayLabel(item.timestamp);

      if (!acc[label]) {
        acc[label] = [];
      }

      acc[label].push(item);
      return acc;
    }, {} as Record<string, typeof injections>);
  
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const totalInjections = injections.length;
  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

  const lastWeekCount = injections.filter(
    (item) => item.timestamp >= oneWeekAgo
  ).length;

  const regionCounts = injections.reduce((acc, item) => {
    acc[item.region] = (acc[item.region] || 0) + 1;
    return acc;
  }, {});

  const mostUsedRegion =
    Object.keys(regionCounts).length > 0
      ? Object.entries(regionCounts).sort(
          (a, b) => b[1] - a[1]
        )[0][0]
      : '—';

  const sections = Object.entries(grouped).flatMap(
    ([label, items]) => [
      { type: 'header', label },
      ...items.map((item) => ({
        ...item,
        type: 'item',
      })),
    ]
  );

  return (
    <View style={styles.container}>
      <View style={styles.statsContainer}>
        <Text style={styles.statTitle}>Statistics</Text>

        <Text style={styles.statItem}>
          Total injections: {totalInjections}
        </Text>

        <Text style={styles.statItem}>
          Last 7 days: {lastWeekCount}
        </Text>

        <Text style={styles.statItem}>
          Most used region: {mostUsedRegion}
        </Text>
      </View>
      <FlatList
        data={sections}
        keyExtractor={(item, index) => {
          if (item.type === 'header') {
            return `header-${item.label}-${index}`;
          }
          return item.id;
        }}
        renderItem={({ item }) => {
          if (item.type === 'header') {
            return (
              <Text style={styles.header}>
                {item.label}
              </Text>
            );
          }
          return (
            <View style={styles.item}>
              <Text style={styles.region}>{item.region}</Text>
              <Text style={styles.time}>
                {formatTime(item.timestamp)}
              </Text>

              <Pressable
                style={styles.deleteButton}
                onPress={() => confirmDelete(item.id)}
              >
                <Text style={styles.deleteText}>Delete</Text>
              </Pressable>
            </View>
          );
        }}
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
  statsContainer: {
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f4f6fa',
  },
  statTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  statItem: {
    fontSize: 14,
    marginBottom: 4,
  },
  header: {
  fontSize: 16,
  fontWeight: '700',
  marginTop: 16,
  marginBottom: 6,
  },
});
