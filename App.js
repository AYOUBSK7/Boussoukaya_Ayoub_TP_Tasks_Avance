// Point d'entrée de l'application MyTasks
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TaskProvider } from './src/context/TaskContext';
import AppNavigator from './src/navigation/AppNavigator';
import SurveillanceRappels from './src/components/SurveillanceRappels';

export default function App() {
  return (
    <SafeAreaProvider>
      {/* TaskProvider rend les tâches accessibles à tous les écrans */}
      <TaskProvider>
        <SurveillanceRappels />
        <AppNavigator />
        <StatusBar style="dark" />
      </TaskProvider>
    </SafeAreaProvider>
  );
}

