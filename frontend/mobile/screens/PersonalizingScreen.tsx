import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

interface PersonalizingScreenProps {
  // This screen just displays for 2 seconds, no props needed
}

export default function PersonalizingScreen({}: PersonalizingScreenProps) {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <LinearGradient
        colors={['#E0F2FE', '#BAE6FD', '#93C5FD', '#ffffff']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          {/* Logo Circles */}
          <View style={styles.logoContainer}>
            <View style={styles.logoCircleDark} />
            <View style={styles.logoCircleLight} />
          </View>
          
          <Text style={styles.text}>Personalizing your experience...</Text>
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
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoCircleDark: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1e40af',
    marginBottom: 12,
  },
  logoCircleLight: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#60a5fa',
  },
  text: {
    fontSize: 18,
    color: '#111827',
    fontWeight: '500',
    textAlign: 'center',
  },
});

