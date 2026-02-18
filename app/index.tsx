import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';




const BODY_REGIONS = [
  'Abdomen (Left)',
  'Abdomen (Right)',
  'Thigh (Left)',
  'Thigh (Right)',
  'Arm (Left)',
  'Arm (Right)',
];

export default function HomeScreen() {
  const [injections, setInjections] = useState([]);
  const [recoveryHours, setRecoveryHours] = useState(24);

  const isRecentlyUsed = (timestamp) => {
    if (!timestamp) return false;

    const diffMs = Date.now() - timestamp;
    const diffHours = diffMs / (1000 * 60 * 60);

    return diffHours < recoveryHours;
  };

  useEffect(() => {
  const loadData = async () => {
    try {
      const saved = await AsyncStorage.getItem('injections');
      if (saved !== null) {
        setInjections(JSON.parse(saved));
      }
    } catch (e) {
      console.log('Failed to load injections', e);
    }
    const savedRecovery = await AsyncStorage.getItem('recoveryHours');
    if (savedRecovery !== null) {
      setRecoveryHours(Number(savedRecovery));
    }
  };
  loadData();
  }, []);

  useEffect(() => {
  const saveData = async () => {
    try {
      await AsyncStorage.setItem(
        'injections',
        JSON.stringify(injections)
      );
    } catch (e) {
      console.log('Failed to save injections', e);
    }
  };
  saveData();
  }, [injections]);

  const handleInjection = (region) => {
    const newEntry = {
      id: Date.now().toString(),
      region,
      timestamp: Date.now(),
    };

    setInjections((prev) => [newEntry, ...prev]);
  };
  
  const confirmInjection = (region) => {
    Alert.alert(
      'Confirm Injection',
      `Log injection in ${region}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => handleInjection(region),
        },
      ]
    );
  };

  const getLastInjectionForRegion = (region) => {
    const entry = injections.find((item) => item.region === region);
    return entry ? entry.timestamp : null;
  };

  const getTimeSince = (timestamp) => {
    const [, forceUpdate] = useState(0);
    useEffect(() => {
      const interval = setInterval(() => {
        forceUpdate((t) => t + 1);
      }, 1000); // every minute

      return () => clearInterval(interval);
    }, []);

    if (!timestamp) return 'Never';

    const diffMs = Date.now() - timestamp;
    const diffSec = Math.floor(diffMs / 1000);

    if (diffSec < 10) return 'Just now';
    if (diffSec < 60) return `${diffSec} sec ago`;

    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin} min ago`;

    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours} h ago`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

    const diffWeeks = Math.floor(diffDays / 7);
    return `${diffWeeks} week${diffWeeks > 1 ? 's' : ''} ago`;
  };

  const formatExactTime = (timestamp) => {
    if (!timestamp) return null;

    const date = new Date(timestamp);

    return date.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Insulin Injection Tracker</Text>

    {BODY_REGIONS.map((region) => {
      const lastTimestamp = getLastInjectionForRegion(region);
      return (
        <View
          key={region}
          style={[
            styles.regionRow,
            isRecentlyUsed(lastTimestamp) && styles.recentlyUsed,
          ]}
        >
          <Text style={styles.regionText}>{region}</Text>
          <Text style={styles.timeText}>
            Last injected: {getTimeSince(lastTimestamp)}
          </Text>
          {lastTimestamp && (
            <Text style={styles.exactTimeText}>
              {formatExactTime(lastTimestamp)}
            </Text>
          )}
          <Pressable
            style={styles.injectButton}
            onPress={() => confirmInjection(region)}
          >
            <Text style={styles.injectButtonText}>
              Injected here
            </Text>
          </Pressable>
        </View>
      );
    })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 40,
    backgroundColor: '#f2f4f8',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  regionRow: {
    marginBottom: 14,
    padding: 16,
    //borderWidth: 1,
    borderRadius: 12,
    backgroundColor: '#f8f9fb',
  },
  regionText: {
    fontSize: 16,
    marginBottom: 8,
  },
  timeText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
  },
  exactTimeText: {
    fontSize: 12,
    color: '#777',
    marginBottom: 8,
  },
  recentlyUsed: {
    backgroundColor: '#ffe5e5',
    borderColor: '#ff9999',
  },
  injectButton: {
    backgroundColor: '#2f6fed',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  injectButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});
