import { StyleSheet, Text, TextInput, TouchableOpacity, View, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

interface AddBioScreenProps {
  onBack: () => void;
  onNext: (bio: string) => void;
  onSkip: () => void;
}

export default function AddBioScreen({ onBack, onNext, onSkip }: AddBioScreenProps) {
  const [bio, setBio] = useState('');

  const handleNext = () => {
    onNext(bio.trim());
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Navigation Bar */}
      <View style={styles.navBar}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity onPress={onSkip} style={styles.skipButton}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.content}>
          <Text style={styles.title}>Add a bio!</Text>
          <Text style={styles.question}>
            What are you looking for on this marketplace?
          </Text>
          <Text style={styles.question}>
            What are some things you specialize in?
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Interests: Ride Share, Nails..."
            placeholderTextColor="#9ca3af"
            value={bio}
            onChangeText={setBio}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />

          <TouchableOpacity 
            style={styles.nextButton}
            onPress={handleNext}
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 4,
  },
  skipButton: {
    padding: 4,
  },
  skipText: {
    fontSize: 16,
    color: '#9ca3af',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#111827',
  },
  question: {
    fontSize: 16,
    color: '#111827',
    marginBottom: 8,
    lineHeight: 22,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 14,
    marginTop: 24,
    marginBottom: 32,
    fontSize: 16,
    backgroundColor: '#f9fafb',
    color: '#111827',
    minHeight: 120,
  },
  nextButton: {
    backgroundColor: '#1e40af',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    width: '100%',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

