import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { InjectionProvider } from '../context/InjectionContext';


export default function Layout() {
  return (
    <InjectionProvider>
      <Tabs>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Tracker',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="pulse-outline" size={size} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="history"
          options={{
            title: 'History',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="time-outline" size={size} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="settings-outline" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </InjectionProvider>
  );
}
