import { StyleSheet, Text, TextInput, TouchableOpacity, View, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

interface EnterUsernameScreenProps {
  onBack: () => void;
  onNext: (username: string) => void;
}

export default function EnterUsernameScreen({ onBack, onNext }: EnterUsernameScreenProps) {
  const [username, setUsername] = useState('');

  const handleNext = () => {
    if (username.trim().length > 0) {
      // Remove @ if user typed it
      const cleanUsername = username.trim().replace(/^@/, '');
      onNext(cleanUsername);
    }
  };

  const displayUsername = username.startsWith('@') ? username : `@${username}`;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Navigation Bar */}
      <View style={styles.navBar}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#666" />
        </TouchableOpacity>
      </View>

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.content}>
          <Text style={styles.title}>What should we call you?</Text>
          <Text style={styles.subtitle}>
            Your @username is unique. You can always change it later!
          </Text>

          <TextInput
            style={styles.input}
            placeholder="@josiebruin"
            placeholderTextColor="#9ca3af"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
            autoFocus
          />

          <TouchableOpacity 
            style={[styles.nextButton, username.trim().length === 0 && styles.nextButtonDisabled]}
            onPress={handleNext}
            disabled={username.trim().length === 0}
          >
            <Text style={styles.nextButtonText}>Next</Text>
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#111827',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 32,
    lineHeight: 22,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 14,
    marginBottom: 32,
    fontSize: 16,
    backgroundColor: '#f9fafb',
    color: '#111827',
  },
  nextButton: {
    backgroundColor: '#1e40af',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    width: '100%',
  },
  nextButtonDisabled: {
    backgroundColor: '#9ca3af',
    opacity: 0.5,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

