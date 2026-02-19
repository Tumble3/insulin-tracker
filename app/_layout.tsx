import { Tabs } from 'expo-router';
import { InjectionProvider } from '../context/InjectionContext';


export default function Layout() {
  return (
    <InjectionProvider>
      <Tabs>
        <Tabs.Screen name="index" options={{ title: 'Tracker' }} />
        <Tabs.Screen name="history" options={{ title: 'History' }} />
        <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
      </Tabs>
    </InjectionProvider>
  );
}
