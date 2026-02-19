import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useEffect, useState } from 'react';

export const InjectionContext = createContext();

export const InjectionProvider = ({ children }) => {
  const [injections, setInjections] = useState([]);
  const [loading, setLoading] = useState(true);

    // Load once on app start
    useEffect(() => {
    const loadInjections = async () => {
        const saved = await AsyncStorage.getItem('injections');
        if (saved) {
        setInjections(JSON.parse(saved));
        }
        setLoading(false);
    };
    loadInjections();
    }, []);

    useEffect(() => {
    if (loading) return; // prevent saving during initial load
    const saveInjections = async () => {
        await AsyncStorage.setItem(
        'injections',
        JSON.stringify(injections)
        );
    };
    saveInjections();
    }, [injections]);

  const addInjection = (region) => {
    const newEntry = {
      id: Date.now().toString(),
      region,
      timestamp: Date.now(),
    };

    setInjections((prev) => [newEntry, ...prev]);
  };

  const deleteInjection = (id) => {
    setInjections((prev) =>
      prev.filter((item) => item.id !== id)
    );
  };

  return (
    <InjectionContext.Provider
      value={{
        injections,
        addInjection,
        deleteInjection,
        loading,
      }}
    >
      {children}
    </InjectionContext.Provider>
  );
};
