import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabaseClient';
import Constants from 'expo-constants';

interface RateUserScreenProps {
  visible: boolean;
  ratedUserId: string;
  ratedUserName: string;
  onClose: () => void;
  onRated?: () => void;
}

export default function RateUserScreen({
  visible,
  ratedUserId,
  ratedUserName,
  onClose,
  onRated,
}: RateUserScreenProps) {
  const [selectedRating, setSelectedRating] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);

  const apiUrl = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3001';

  const handleStarPress = (rating: number) => {
    setSelectedRating(rating);
  };

  const handleSubmit = async () => {
    if (selectedRating === 0) {
      Alert.alert('Error', 'Please select a rating');
      return;
    }

    try {
      setSubmitting(true);

      // Get current user
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      if (authError || !authUser) {
        Alert.alert('Error', 'Failed to get current user');
        setSubmitting(false);
        return;
      }

      // Submit rating
      const response = await fetch(`${apiUrl}/api/ratings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rater_id: authUser.id,
          rated_user_id: ratedUserId,
          rating: selectedRating,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to submit rating' }));
        Alert.alert('Error', errorData.error || 'Failed to submit rating');
        setSubmitting(false);
        return;
      }

      Alert.alert('Success', 'Rating submitted successfully!', [
        {
          text: 'OK',
          onPress: () => {
            setSelectedRating(0);
            onClose();
            if (onRated) onRated();
          },
        },
      ]);
    } catch (error: any) {
      console.error('Error submitting rating:', error);
      Alert.alert('Error', error.message || 'Failed to submit rating');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setSelectedRating(0);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleCancel}
    >
      <View style={styles.modalOverlay}>
        <SafeAreaView style={styles.modalContainer} edges={['bottom']}>
          <View style={styles.header}>
            <Text style={styles.title}>Rate {ratedUserName}</Text>
            <TouchableOpacity onPress={handleCancel} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <Text style={styles.subtitle}>How was your experience?</Text>

            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((rating) => (
                <TouchableOpacity
                  key={rating}
                  onPress={() => handleStarPress(rating)}
                  style={[styles.starButton, rating > 1 && { marginLeft: 12 }]}
                  disabled={submitting}
                >
                  <Ionicons
                    name={rating <= selectedRating ? 'star' : 'star-outline'}
                    size={48}
                    color={rating <= selectedRating ? '#fbbf24' : '#d1d5db'}
                  />
                </TouchableOpacity>
              ))}
            </View>

            {selectedRating > 0 && (
              <Text style={styles.ratingText}>
                {selectedRating === 1 && 'Poor'}
                {selectedRating === 2 && 'Fair'}
                {selectedRating === 3 && 'Good'}
                {selectedRating === 4 && 'Very Good'}
                {selectedRating === 5 && 'Excellent'}
              </Text>
            )}

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleCancel}
                disabled={submitting}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.button,
                  styles.submitButton,
                  selectedRating === 0 && styles.submitButtonDisabled,
                  { marginLeft: 12 },
                ]}
                onPress={handleSubmit}
                disabled={submitting || selectedRating === 0}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.submitButtonText}>Submit</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 32,
    textAlign: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  starButton: {
    padding: 8,
  },
  ratingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3b82f6',
    marginBottom: 32,
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  submitButton: {
    backgroundColor: '#3b82f6',
  },
  submitButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});

