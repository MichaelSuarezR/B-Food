import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, View, Modal } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import HomeScreen, { LiveDiningStatus } from './screens/HomeScreen';
import ProfileScreen from './screens/ProfileScreen';
import MessagesLandingScreen from './screens/MessagesLandingScreen';
import ChatScreen from './screens/ChatScreen';
import CreateListingScreen from './screens/CreateListingScreen';
import BottomNavigation from './components/BottomNavigation';
import { supabase } from './lib/supabaseClient';
import { NavigationContainer } from '@react-navigation/native';
import DeliverScreen from './screens/DeliverScreen';
import Constants from 'expo-constants';


type Screen = 'home' | 'deliver';
type AuthScreen = 'login' | 'register';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authScreen, setAuthScreen] = useState<AuthScreen>('login');
  const [initializing, setInitializing] = useState(true);
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [showCreateListing, setShowCreateListing] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string>('');
  const [currentContactName, setCurrentContactName] = useState<string>('');
  const [darkMode, setDarkMode] = useState(false);
  const [diningStatuses, setDiningStatuses] = useState<Record<string, LiveDiningStatus>>({});
  const [statusesLoading, setStatusesLoading] = useState(false);
  const apiUrl = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3001';

  const handleChatPress = (chatId: string, contactName: string) => {
    setCurrentChatId(chatId);
    setCurrentContactName(contactName);
    setShowMessages(false);
    setShowChat(true);
  };

  const handleChatBack = () => {
    setShowChat(false);
    setCurrentChatId('');
    setCurrentContactName('');
  };

  useEffect(() => {
    let isMounted = true;

    const bootstrapSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!isMounted) return;

        if (session) {
          setIsLoggedIn(true);
          setAuthScreen('login');
        } else {
          setIsLoggedIn(false);
          setAuthScreen('login');
        }
      } catch (error) {
        console.error('Failed to restore session:', error);
      } finally {
        if (isMounted) {
          setInitializing(false);
        }
      }
    };

    bootstrapSession();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    let interval: ReturnType<typeof setInterval> | null = null;

    const fetchStatuses = async () => {
      if (!isMounted) return;
      setStatusesLoading(true);
      try {
        const response = await fetch(`${apiUrl}/api/dining/status`);
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }
        const payload = await response.json();
        if (!isMounted) return;

        const nextStatuses: Record<string, LiveDiningStatus> = {};
        (payload?.halls ?? []).forEach((hall: LiveDiningStatus) => {
          if (hall?.id) {
            nextStatuses[hall.id] = hall;
          }
        });
        setDiningStatuses(nextStatuses);
      } catch (error) {
        console.error('Failed to fetch dining statuses', error);
      } finally {
        if (isMounted) {
          setStatusesLoading(false);
        }
      }
    };

    fetchStatuses();
    interval = setInterval(fetchStatuses, 5 * 60 * 1000);

    return () => {
      isMounted = false;
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [apiUrl]);

  // SeeAllScreen will fetch data from API, pass empty array for now
  const listings: any[] = [];

  if (initializing) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.container} edges={['top']}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2563eb" />
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  // Show auth screens if not logged in
  if (!isLoggedIn) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.container} edges={['top']}>
          <StatusBar style="auto" />
          {authScreen === 'register' ? (
            <RegisterScreen
              onRegister={({ loggedIn }) => {
                if (loggedIn) {
                  setIsLoggedIn(true);
                } else {
                  setIsLoggedIn(false);
                }
                setAuthScreen('login');
              }}
              onSwitchToLogin={() => setAuthScreen('login')}
            />
          ) : (
            <LoginScreen 
              onLogin={() => {
                setIsLoggedIn(true);
                setAuthScreen('login');
              }} 
              onSwitchToRegister={() => setAuthScreen('register')}
            />
          )}
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <SafeAreaView
          style={[styles.container, darkMode && styles.darkContainer]}
          edges={['top']}
        >
          <StatusBar style={darkMode ? 'light' : 'dark'} backgroundColor={darkMode ? '#0f172a' : '#ffffff'} />
          
          {currentScreen === 'home' && (
          <HomeScreen 
            darkMode={darkMode}
            onToggleDarkMode={() => setDarkMode((prev) => !prev)}
            onProfilePress={() => setShowProfile(true)}
            onMessagesPress={() => setShowMessages(true)}
            liveStatuses={diningStatuses}
            loadingStatuses={statusesLoading}
          />
          )}

          {currentScreen === 'deliver' && (
            <DeliverScreen
              darkMode={darkMode}
              onStartDeliver={() => setShowCreateListing(true)}
            />
          )}

          <BottomNavigation 
            activeTab={currentScreen === 'deliver' ? 'deliver' : 'order'}
            onOrderPress={() => setCurrentScreen('home')}
            onDeliverPress={() => setCurrentScreen('deliver')}
            darkMode={darkMode}
          />

          {showCreateListing && (
            <CreateListingScreen onClose={() => setShowCreateListing(false)} />
          )}
        </SafeAreaView>

        <Modal visible={showProfile} animationType="slide" presentationStyle="fullScreen">
          <ProfileScreen
            onBack={() => setShowProfile(false)}
            onLogout={() => {
              setShowProfile(false);
              setIsLoggedIn(false);
              setAuthScreen('login');
            }}
            darkMode={darkMode}
          />
        </Modal>

        <Modal visible={showMessages && !showChat} animationType="slide" presentationStyle="fullScreen">
          <MessagesLandingScreen 
            onChatPress={handleChatPress}
            onBack={() => setShowMessages(false)}
          />
        </Modal>

        <Modal visible={showChat} animationType="slide" presentationStyle="fullScreen">
          <ChatScreen
            chatId={currentChatId}
            contactName={currentContactName}
            onBack={handleChatBack}
          />
        </Modal>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  darkContainer: {
    backgroundColor: '#0f172a',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
