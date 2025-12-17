import { StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

interface InterestsStep2ScreenProps {
  onBack: () => void;
  onNext: (selectedCategories: string[]) => void;
  onSkip: () => void;
}

const CATEGORY_OPTIONS = [
  { label: 'Concert tickets', emoji: '🎫' },
  { label: 'Clothing', emoji: '👕' },
  { label: 'Nails', emoji: '💅' },
  { label: 'Ride Share', emoji: '🚗' },
  { label: 'Meal Swipes', emoji: '🍲' },
  { label: 'Photography', emoji: '📷' },
  { label: 'Items', emoji: '📦' },
  { label: 'Textbooks', emoji: '📚' },
];

export default function InterestsStep2Screen({ onBack, onNext, onSkip }: InterestsStep2ScreenProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const handleToggleCategory = (category: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      } else {
        return [...prev, category];
      }
    });
  };

  const handleNext = () => {
    onNext(selectedCategories);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={styles.progressFilled} />
          <View style={styles.progressFilled} />
        </View>
        <View style={styles.progressTextContainer}>
          <Text style={styles.progressText}>Step 2 of 2</Text>
          <TouchableOpacity onPress={onSkip}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>What are you interested in?</Text>

        <View style={styles.categoriesContainer}>
          {CATEGORY_OPTIONS.map((category) => {
            const isSelected = selectedCategories.includes(category.label);
            return (
              <TouchableOpacity
                key={category.label}
                style={[
                  styles.categoryButton,
                  isSelected && styles.categoryButtonSelected,
                ]}
                onPress={() => handleToggleCategory(category.label)}
              >
                <Text style={styles.categoryEmoji}>{category.emoji}</Text>
                <Text style={styles.categoryText}>{category.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity 
          style={styles.nextButton}
          onPress={handleNext}
        >
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
      </ScrollView>
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
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 32,
    color: '#111827',
    textAlign: 'center',
  },
  categoriesContainer: {
    marginBottom: 32,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'transparent',
    marginBottom: 12,
  },
  categoryButtonSelected: {
    borderColor: '#111827',
    backgroundColor: '#fff',
  },
  categoryEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  categoryText: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
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

