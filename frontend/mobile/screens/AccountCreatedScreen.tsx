import { StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

interface AccountCreatedScreenProps {
  profileImageUri: string | null;
  username: string;
  onNext: () => void;
}

export default function AccountCreatedScreen({ profileImageUri, username, onNext }: AccountCreatedScreenProps) {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <LinearGradient
        colors={['#E0F2FE', '#BAE6FD', '#93C5FD', '#ffffff']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          {profileImageUri ? (
            <Image 
              source={{ uri: profileImageUri }} 
              style={styles.profileImage}
            />
          ) : (
            <View style={styles.profileImagePlaceholder}>
              <Text style={styles.profileInitial}>
                {username.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}

          <Text style={styles.greeting}>
            👋👋 Hi @{username}!
          </Text>
          
          <Text style={styles.description}>
            Let's personalize your experience with just a few questions to start!
          </Text>

          <TouchableOpacity 
            style={styles.nextButton}
            onPress={onNext}
          >
            <Text style={styles.nextButtonText}>Next</Text>
          </TouchableOpacity>
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
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 24,
    borderWidth: 4,
    borderColor: '#fff',
  },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 4,
    borderColor: '#fff',
  },
  profileInitial: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#6b7280',
  },
  greeting: {
    fontSize: 24,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    marginBottom: 48,
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  nextButton: {
    backgroundColor: '#1e40af',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 48,
    alignItems: 'center',
    width: '100%',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

