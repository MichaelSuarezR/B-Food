import { StyleSheet, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView, View, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import Constants from 'expo-constants';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

interface CreateAccountScreenProps {
  onBack: () => void;
  onNext: (email: string, password: string) => void;
}

// Validate ucla.edu email
const isValidUclaEmail = (email: string): boolean => {
  return (
    email.toLowerCase().endsWith('@ucla.edu') ||
    email.toLowerCase().endsWith('@g.ucla.edu')
  );
};

export default function CreateAccountScreen({ onBack, onNext }: CreateAccountScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const apiUrl = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3001';

  const handleCreateAccount = async () => {
    // Validate all fields
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    // Validate ucla.edu email
    if (!isValidUclaEmail(email)) {
      Alert.alert('Error', 'Please use a @ucla.edu email address');
      return;
    }

    // Validate password length
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password,
      });

      if (error) {
        Alert.alert('Registration Error', error.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        // Create user in users table
        try {
          const createUserResponse = await fetch(`${apiUrl}/api/users`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              id: data.user.id,
              email: data.user.email || email.toLowerCase().trim(),
              user_name: data.user.user_metadata?.user_name || null,
            }),
          });

          if (!createUserResponse.ok) {
            const errorData = await createUserResponse.json();
            // If user already exists, that's okay (might have been created elsewhere)
            if (!errorData.error?.includes('already exists') && !errorData.error?.includes('23505')) {
              console.error('Failed to create user profile:', errorData);
            }
          }
        } catch (userError) {
          console.error('Error creating user profile:', userError);
          // Continue anyway - user can still proceed
        }

        // Check if email confirmation is required
        // If session exists, user was auto-confirmed (email confirmation disabled)
        if (data.session) {
          // Email confirmation is disabled - proceed to next step
          onNext(email.toLowerCase().trim(), password);
        } else {
          // Email confirmation is required (shouldn't happen if disabled, but handle it)
          Alert.alert(
            'Success', 
            'Account created! Please check your email to verify your account.',
            [{ text: 'OK' }]
          );
        }
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = email.trim().length > 0 && password.length >= 6 && isValidUclaEmail(email);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Navigation Bar */}
        <View style={styles.navBar}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color="#666" />
          </TouchableOpacity>
        </View>

        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
          <Text style={styles.title}>Create your account</Text>
          <Text style={styles.subtitle}>
            Start buying, selling, and connecting—join your campus marketplace today!
          </Text>
          
          <TextInput
            style={styles.input}
            placeholder="UCLA Email Address"
            placeholderTextColor="#9ca3af"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#9ca3af"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <TouchableOpacity style={styles.forgotPasswordButton}>
              <Text style={styles.forgotPasswordText}>Forgot your password?</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={[styles.button, (!isFormValid || loading) && styles.buttonDisabled]} 
            onPress={handleCreateAccount}
            disabled={!isFormValid || loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Creating account...' : 'Create new account'}
            </Text>
          </TouchableOpacity>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardView: {
    flex: 1,
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
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 8,
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
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#f9fafb',
    color: '#111827',
  },
  passwordContainer: {
    marginBottom: 8,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginTop: 8,
    marginBottom: 16,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#6b7280',
  },
  button: {
    backgroundColor: '#1e40af',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af',
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

