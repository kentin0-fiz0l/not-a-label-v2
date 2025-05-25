# Not a Label Mobile App Development Guide

## Overview

This guide outlines the development of native mobile applications for iOS and Android that complement the Not a Label web platform. The mobile apps provide on-the-go access to music management, analytics, and collaboration features.

## Architecture

### Technology Stack
- **React Native**: Cross-platform development
- **Expo**: Development and deployment platform
- **TypeScript**: Type safety and better development experience
- **React Navigation**: Navigation management
- **Redux Toolkit**: State management
- **React Query**: Server state management
- **Reanimated 3**: Advanced animations
- **Expo AV**: Audio playback and recording

### Project Structure
```
mobile/
├── src/
│   ├── components/           # Reusable UI components
│   ├── screens/             # Screen components
│   ├── navigation/          # Navigation configuration
│   ├── store/              # Redux store and slices
│   ├── services/           # API services
│   ├── hooks/              # Custom hooks
│   ├── utils/              # Utility functions
│   ├── types/              # TypeScript types
│   └── constants/          # App constants
├── assets/                 # Images, fonts, etc.
├── app.json               # Expo configuration
├── package.json
└── tsconfig.json
```

## Key Features

### 1. Artist Dashboard
- Real-time analytics and metrics
- Revenue tracking and earnings
- Track performance insights
- Fan engagement data

### 2. Music Management
- Upload tracks directly from mobile
- Edit track metadata and artwork
- Manage distribution settings
- Preview and playback tracks

### 3. Collaboration Tools
- Browse collaboration opportunities
- Chat with other artists
- Share project files
- Schedule sessions

### 4. Streaming & Discovery
- High-quality audio streaming
- Personalized recommendations
- Offline listening (premium feature)
- Social sharing integration

### 5. Notifications
- Real-time push notifications
- Distribution status updates
- Collaboration invites
- Revenue milestones

## Development Setup

### Prerequisites
```bash
# Install Expo CLI
npm install -g @expo/cli

# Install dependencies
npm install

# Start development server
expo start
```

### Environment Configuration
Create `.env` file:
```env
API_BASE_URL=https://not-a-label.art/api
SENTRY_DSN=your_sentry_dsn
ANALYTICS_KEY=your_analytics_key
```

### Navigation Structure
```tsx
// src/navigation/AppNavigator.tsx
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Music" component={MusicScreen} />
      <Tab.Screen name="Collaborate" component={CollaborateScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Main" component={TabNavigator} />
        <Stack.Screen name="TrackDetails" component={TrackDetailsScreen} />
        <Stack.Screen name="Upload" component={UploadScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

## Core Components

### Audio Player Component
```tsx
// src/components/AudioPlayer.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';

interface AudioPlayerProps {
  track: {
    id: string;
    title: string;
    artist: string;
    streamUrl: string;
    duration: number;
  };
}

export function AudioPlayer({ track }: AudioPlayerProps) {
  const [sound, setSound] = useState<Audio.Sound>();
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);

  useEffect(() => {
    return sound ? () => sound.unloadAsync() : undefined;
  }, [sound]);

  const playPause = async () => {
    if (sound) {
      if (isPlaying) {
        await sound.pauseAsync();
      } else {
        await sound.playAsync();
      }
      setIsPlaying(!isPlaying);
    } else {
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: track.streamUrl },
        { shouldPlay: true }
      );
      setSound(newSound);
      setIsPlaying(true);
      
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          setPosition(status.positionMillis || 0);
        }
      });
    }
  };

  return (
    <View className="flex-row items-center p-4 bg-white rounded-lg shadow">
      <TouchableOpacity onPress={playPause} className="mr-4">
        <Ionicons 
          name={isPlaying ? "pause" : "play"} 
          size={24} 
          color="#9333ea" 
        />
      </TouchableOpacity>
      <View className="flex-1">
        <Text className="font-semibold">{track.title}</Text>
        <Text className="text-gray-600">{track.artist}</Text>
      </View>
    </View>
  );
}
```

### Upload Component
```tsx
// src/components/UploadTrack.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';

export function UploadTrack() {
  const [uploading, setUploading] = useState(false);

  const pickAudioFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        copyToCacheDirectory: true,
      });

      if (result.type === 'success') {
        uploadFile(result);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick audio file');
    }
  };

  const uploadFile = async (file: DocumentPicker.DocumentResult) => {
    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: file.uri,
        type: file.mimeType || 'audio/mpeg',
        name: file.name,
      } as any);

      const response = await fetch(`${API_BASE_URL}/tracks/upload`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${userToken}`,
        },
      });

      if (response.ok) {
        Alert.alert('Success', 'Track uploaded successfully!');
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to upload track');
    } finally {
      setUploading(false);
    }
  };

  return (
    <View className="p-4">
      <TouchableOpacity
        onPress={pickAudioFile}
        disabled={uploading}
        className="bg-purple-600 p-4 rounded-lg items-center"
      >
        <Text className="text-white font-semibold">
          {uploading ? 'Uploading...' : 'Upload Track'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
```

## State Management

### Redux Store Setup
```tsx
// src/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import musicSlice from './slices/musicSlice';
import analyticsSlice from './slices/analyticsSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    music: musicSlice,
    analytics: analyticsSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

### Auth Slice
```tsx
// src/store/slices/authSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    
    if (!response.ok) {
      throw new Error('Login failed');
    }
    
    return response.json();
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: null,
    isLoading: false,
    error: null,
  } as AuthState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Login failed';
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
```

## API Integration

### API Service
```tsx
// src/services/api.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

class ApiService {
  private baseURL = process.env.API_BASE_URL || 'https://not-a-label.art/api';
  private token: string | null = null;

  async setToken(token: string) {
    this.token = token;
    await AsyncStorage.setItem('auth_token', token);
  }

  async getToken() {
    if (!this.token) {
      this.token = await AsyncStorage.getItem('auth_token');
    }
    return this.token;
  }

  async request(endpoint: string, options: RequestInit = {}) {
    const token = await this.getToken();
    
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  }

  // Music endpoints
  async getTracks() {
    return this.request('/tracks');
  }

  async getTrack(id: string) {
    return this.request(`/tracks/${id}`);
  }

  async uploadTrack(formData: FormData) {
    const token = await this.getToken();
    return fetch(`${this.baseURL}/tracks/upload`, {
      method: 'POST',
      body: formData,
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
  }

  // Analytics endpoints
  async getAnalytics(period = '30d') {
    return this.request(`/analytics/tracks?period=${period}`);
  }

  // Collaboration endpoints
  async getCollaborations() {
    return this.request('/collaborations');
  }
}

export const apiService = new ApiService();
```

## Push Notifications

### Setup
```tsx
// src/services/notifications.ts
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function registerForPushNotifications() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#9333ea',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }
    
    token = (await Notifications.getExpoPushTokenAsync()).data;
  }

  return token;
}
```

## Deployment

### Build Configuration
```json
// app.json
{
  "expo": {
    "name": "Not a Label",
    "slug": "not-a-label",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "assetBundlePatterns": ["**/*"],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.notalabel.app"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.notalabel.app"
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "plugins": [
      "expo-av",
      "expo-document-picker",
      "expo-file-system",
      "expo-notifications"
    ]
  }
}
```

### Build Commands
```bash
# Build for iOS
expo build:ios

# Build for Android
expo build:android

# Submit to App Store
expo upload:ios

# Submit to Google Play
expo upload:android
```

## Testing

### Unit Tests
```tsx
// __tests__/components/AudioPlayer.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { AudioPlayer } from '../src/components/AudioPlayer';

const mockTrack = {
  id: '1',
  title: 'Test Song',
  artist: 'Test Artist',
  streamUrl: 'https://example.com/song.mp3',
  duration: 180,
};

describe('AudioPlayer', () => {
  it('renders track information', () => {
    const { getByText } = render(<AudioPlayer track={mockTrack} />);
    
    expect(getByText('Test Song')).toBeTruthy();
    expect(getByText('Test Artist')).toBeTruthy();
  });

  it('toggles play/pause on button press', () => {
    const { getByTestId } = render(<AudioPlayer track={mockTrack} />);
    const playButton = getByTestId('play-button');
    
    fireEvent.press(playButton);
    // Add assertions for play state
  });
});
```

### E2E Tests
```tsx
// e2e/auth.test.ts
import { by, device, element, expect } from 'detox';

describe('Authentication Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  it('should login successfully', async () => {
    await element(by.id('email-input')).typeText('test@example.com');
    await element(by.id('password-input')).typeText('password123');
    await element(by.id('login-button')).tap();
    
    await expect(element(by.id('dashboard-screen'))).toBeVisible();
  });
});
```

## Performance Optimization

### Code Splitting
```tsx
// Lazy loading for screens
const DashboardScreen = lazy(() => import('../screens/DashboardScreen'));
const MusicScreen = lazy(() => import('../screens/MusicScreen'));
```

### Image Optimization
```tsx
// Use FastImage for better performance
import FastImage from 'react-native-fast-image';

<FastImage
  style={{ width: 200, height: 200 }}
  source={{
    uri: track.coverImage,
    priority: FastImage.priority.normal,
  }}
  resizeMode={FastImage.resizeMode.cover}
/>
```

### Memory Management
```tsx
// Proper cleanup in useEffect
useEffect(() => {
  const subscription = someAsyncOperation();
  
  return () => {
    subscription.unsubscribe();
  };
}, []);
```

## Release Notes

### v1.0.0 (Initial Release)
- Basic authentication and user management
- Music upload and management
- Real-time analytics dashboard
- Audio playback with queue management
- Push notifications for key events
- Offline mode for downloaded tracks

### Upcoming Features
- Advanced audio editing tools
- Live streaming capabilities
- AR/VR integration for immersive experiences
- Voice commands and AI assistant
- Advanced collaboration tools with video chat