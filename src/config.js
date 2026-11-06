// Adresse du serveur API.
//  - Émulateur Android : 10.0.2.2 désigne le PC (localhost du PC vu depuis l'émulateur)
//  - Web / iOS simulateur : localhost
//  - Vrai téléphone : mettre l'IP du PC, ex. EXPO_PUBLIC_API_URL=http://192.168.1.20:3000
import { Platform } from 'react-native';

const parDefaut = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';

export const API_URL = process.env.EXPO_PUBLIC_API_URL || parDefaut;
