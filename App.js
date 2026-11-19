// Point d'entrée de l'application MyTasks
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TaskProvider } from './src/context/TaskContext';
import { ProfilProvider } from './src/context/ProfilContext';
import AppNavigator from './src/navigation/AppNavigator';
import SurveillanceRappels from './src/components/SurveillanceRappels';
import SurveillanceCommentaires from './src/components/SurveillanceCommentaires';
import Banniere from './src/components/Banniere';

export default function App() {
  return (
    <SafeAreaProvider>
      {/* ProfilProvider : mon nom + e-mail ; TaskProvider : les tâches pour tous les écrans */}
      <ProfilProvider>
        <TaskProvider>
          <SurveillanceRappels />        {/* notifications de date et de lieu */}
          <SurveillanceCommentaires />   {/* notifications des nouveaux commentaires */}
          <AppNavigator />
          <Banniere />
          <StatusBar style="dark" />
        </TaskProvider>
      </ProfilProvider>
    </SafeAreaProvider>
  );
}
