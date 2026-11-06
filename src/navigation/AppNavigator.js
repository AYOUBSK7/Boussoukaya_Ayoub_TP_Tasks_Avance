// Partie 4 — Navigation entre les écrans
// Structure :
//   Bottom Tabs (barre du bas)
//   ├── Accueil  → HomeScreen
//   ├── Tâches   → Stack (pile d'écrans)
//   │              ├── TaskList   (Liste des tâches)
//   │              ├── TaskDetail (Détails)
//   │              ├── AddTask    (Formulaire en mode ajout)
//   │              └── EditTask   (Formulaire en mode modification)
//   ├── Ajouter  → bouton central "+" (raccourci vers Tâches > AddTask)
//   └── Profil   → ProfileScreen
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from '../screens/HomeScreen';
import TaskListScreen from '../screens/TaskListScreen';
import TaskDetailScreen from '../screens/TaskDetailScreen';
import TaskFormScreen from '../screens/TaskFormScreen';
import ProfileScreen from '../screens/ProfileScreen';
import LoadingScreen from '../screens/LoadingScreen';
import { useTasks } from '../context/TaskContext';
import { COLORS, GRADIENTS } from '../constants/theme';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Thème de navigation : fond des écrans + couleur principale
const THEME_NAV = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: COLORS.background, primary: COLORS.primary },
};

// Pile d'écrans de l'onglet "Tâches"
function TasksStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShadowVisible: false,                      // pas de ligne sous l'en-tête
        headerStyle: { backgroundColor: COLORS.background },
        headerTitleStyle: { fontWeight: '800', fontSize: 18, color: COLORS.text },
        headerTintColor: COLORS.primary,                  // couleur de la flèche retour
        headerBackButtonDisplayMode: 'minimal',
      }}
    >
      <Stack.Screen name="TaskList" component={TaskListScreen}
        options={{ title: 'Mes tâches', headerTitleStyle: { fontWeight: '800', fontSize: 26, color: COLORS.text } }} />
      <Stack.Screen name="TaskDetail" component={TaskDetailScreen} options={{ title: 'Détails' }} />
      <Stack.Screen name="AddTask" component={TaskFormScreen} options={{ title: 'Ajouter une tâche' }} />
      <Stack.Screen name="EditTask" component={TaskFormScreen} options={{ title: 'Modifier une tâche' }} />
    </Stack.Navigator>
  );
}

// L'onglet "Ajouter" n'a pas d'écran propre : il redirige vers le formulaire
function EcranVide() {
  return null;
}

// Gros bouton central "+" en dégradé
function BoutonAjouter() {
  return (
    <LinearGradient colors={GRADIENTS.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      style={styles.boutonCentral}>
      <Ionicons name="add" size={30} color="#fff" />
    </LinearGradient>
  );
}

// Icône de chaque onglet : [active, inactive]
const ICONES = {
  Accueil: ['home', 'home-outline'],
  Taches: ['checkbox', 'checkbox-outline'],
  Profil: ['person', 'person-outline'],
};

export default function AppNavigator() {
  const { chargement } = useTasks();

  // Partie 5 : tant que les données ne sont pas lues, on affiche le chargement
  if (chargement) return <LoadingScreen />;

  return (
    <NavigationContainer theme={THEME_NAV}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: '#94A3B8',
          tabBarLabelStyle: { fontSize: 11.5, fontWeight: '700' },
          tabBarStyle: styles.barre,
          tabBarIcon: ({ focused, color }) =>
            route.name === 'Ajouter' ? <BoutonAjouter /> : (
              <View style={[styles.icone, focused && styles.iconeActive]}>
                <Ionicons name={ICONES[route.name][focused ? 0 : 1]} size={22} color={color} />
              </View>
            ),
        })}
      >
        <Tab.Screen name="Accueil" component={HomeScreen} />
        <Tab.Screen name="Taches" component={TasksStack} options={{ title: 'Tâches' }} />
        <Tab.Screen
          name="Ajouter"
          component={EcranVide}
          options={{ tabBarLabel: () => null }}
          listeners={({ navigation }) => ({
            tabPress: (e) => {
              e.preventDefault(); // on n'ouvre pas l'écran vide
              navigation.navigate('Taches', { screen: 'AddTask', initial: false });
            },
          })}
        />
        <Tab.Screen name="Profil" component={ProfileScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  barre: {
    backgroundColor: '#fff',
    borderTopWidth: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: 72,
    paddingTop: 8,
    shadowColor: '#1E1B4B',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -4 },
    elevation: 12,
  },
  icone: { width: 44, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  iconeActive: { backgroundColor: COLORS.primarySoft },
  boutonCentral: {
    width: 56, height: 56, borderRadius: 20, alignItems: 'center', justifyContent: 'center',
    marginTop: -26,                         // dépasse au-dessus de la barre
    borderWidth: 4, borderColor: COLORS.background,
    shadowColor: COLORS.primary, shadowOpacity: 0.4, shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 }, elevation: 8,
  },
});
