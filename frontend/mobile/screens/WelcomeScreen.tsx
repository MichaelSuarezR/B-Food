import { StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

interface WelcomeScreenProps {
  onSignIn: () => void;
  onJoinNow: () => void;
}

export default function WelcomeScreen({ onSignIn, onJoinNow }: WelcomeScreenProps) {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <LinearGradient
        colors={['#E0F2FE', '#BAE6FD', '#93C5FD']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          {/* Welcome Text */}
          <Text style={styles.welcomeText}>Welcome to</Text>
          
          {/* Logo with stylized "e" */}
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>bt</Text>
            <View style={styles.logoEContainer}>
              <View style={styles.logoCircleDark} />
              <View style={styles.logoCircleLight} />
            </View>
            <Text style={styles.logoText}>wn</Text>
          </View>
          
          {/* Tagline */}
          <Text style={styles.tagline}>
            Trade, discover, and share — connecting students in between.
          </Text>
          
          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.signInButton}
              onPress={onSignIn}
            >
              <Text style={styles.signInButtonText}>Sign in with UCLA</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.joinNowButton}
              onPress={onJoinNow}
            >
              <Text style={styles.joinNowButtonText}>Join Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingBottom: 60,
  },
  welcomeText: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 12,
    fontWeight: '400',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  logoText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#111827',
  },
  logoEContainer: {
    position: 'relative',
    width: 40,
    height: 64,
    marginHorizontal: 2,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoCircleDark: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1e40af',
    alignSelf: 'center',
    marginTop: 0,
  },
  logoCircleLight: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#60a5fa',
    alignSelf: 'center',
    marginBottom: 0,
  },
  tagline: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'left',
    alignSelf: 'stretch',
    marginBottom: 48,
    lineHeight: 24,
  },
  buttonContainer: {
    width: '100%',
  },
  signInButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 16,
  },
  signInButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  joinNowButton: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  joinNowButtonText: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '600',
  },
});

