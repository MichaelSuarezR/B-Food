import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

interface InterestsStep1ScreenProps {
  onBack: () => void;
  onNext: (selectedOptions: string[]) => void;
  onSkip: () => void;
}

const TRADE_OPTIONS = [
  { label: 'Buying', color: '#d1fae5', borderColor: '#10b981' },
  { label: 'Selling', color: '#fce7f3', borderColor: '#ec4899' },
  { label: 'Trading', color: '#fef3c7', borderColor: '#f59e0b' },
];

export default function InterestsStep1Screen({ onBack, onNext, onSkip }: InterestsStep1ScreenProps) {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  const handleToggleOption = (option: string) => {
    setSelectedOptions(prev => {
      if (prev.includes(option)) {
        return prev.filter(o => o !== option);
      } else {
        return [...prev, option];
      }
    });
  };

  const handleNext = () => {
    if (selectedOptions.length > 0) {
      onNext(selectedOptions);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={styles.progressFilled} />
          <View style={styles.progressUnfilled} />
        </View>
        <View style={styles.progressTextContainer}>
          <Text style={styles.progressText}>Step 1 of 2</Text>
          <TouchableOpacity onPress={onSkip}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>What are you interested in?</Text>

        <View style={styles.optionsContainer}>
          {TRADE_OPTIONS.map((option) => {
            const isSelected = selectedOptions.includes(option.label);
            return (
              <TouchableOpacity
                key={option.label}
                style={[
                  styles.optionButton,
                  {
                    backgroundColor: option.color,
                    borderColor: isSelected ? option.borderColor : 'transparent',
                    borderWidth: isSelected ? 2 : 0,
                  },
                ]}
                onPress={() => handleToggleOption(option.label)}
              >
                <Text style={styles.optionText}>{option.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity 
          style={[
            styles.nextButton,
            selectedOptions.length === 0 && styles.nextButtonDisabled
          ]}
          onPress={handleNext}
          disabled={selectedOptions.length === 0}
        >
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  progressBar: {
    flexDirection: 'row',
    height: 4,
    marginBottom: 8,
  },
  progressFilled: {
    flex: 1,
    backgroundColor: '#111827',
    borderRadius: 2,
  },
  progressUnfilled: {
    flex: 1,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
  },
  progressTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 14,
    color: '#9ca3af',
  },
  skipText: {
    fontSize: 16,
    color: '#111827',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 48,
    color: '#111827',
    textAlign: 'center',
  },
  optionsContainer: {
    marginBottom: 48,
  },
  optionButton: {
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  optionText: {
    fontSize: 18,
    fontWeight: '600',
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

