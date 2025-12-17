import { useState, useEffect } from 'react';
import CreateAccountScreen from './CreateAccountScreen';
import PickProfilePictureScreen from './PickProfilePictureScreen';
import EnterUsernameScreen from './EnterUsernameScreen';
import AddBioScreen from './AddBioScreen';
import AccountCreatedScreen from './AccountCreatedScreen';
import PersonalizingScreen from './PersonalizingScreen';
import InterestsStep1Screen from './InterestsStep1Screen';
import InterestsStep2Screen from './InterestsStep2Screen';
import Constants from 'expo-constants';
import { supabase } from '../lib/supabaseClient';
import * as FileSystem from 'expo-file-system/legacy';

interface CreateAccountFlowProps {
  onBack: () => void;
  onComplete: () => void;
}

type FlowStep = 'create-account' | 'pick-picture' | 'enter-username' | 'add-bio' | 'account-created' | 'personalizing' | 'interests-step1' | 'interests-step2';

export default function CreateAccountFlow({ onBack, onComplete }: CreateAccountFlowProps) {
  const [currentStep, setCurrentStep] = useState<FlowStep>('create-account');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [profileImageUri, setProfileImageUri] = useState<string | null>(null);
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [tradePreferences, setTradePreferences] = useState<string[]>([]);
  const [categoryPreferences, setCategoryPreferences] = useState<string[]>([]);

  const apiUrl = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3001';

  const handleCreateAccountNext = (userEmail: string, userPassword: string) => {
    setEmail(userEmail);
    setPassword(userPassword);
    setCurrentStep('pick-picture');
  };

  const handlePickPictureNext = (imageUri: string | null) => {
    setProfileImageUri(imageUri);
    setCurrentStep('enter-username');
  };

  const handleEnterUsernameNext = async (userUsername: string) => {
    setUsername(userUsername);
    setCurrentStep('add-bio');
  };

  const handleAddBioNext = async (userBio: string) => {
    setBio(userBio);
    
    // Update user profile with all collected information
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Upload profile image if provided
        let profilePictureUrl = null;
        if (profileImageUri) {
          try {
            // Read file as base64
            const base64String = await FileSystem.readAsStringAsync(profileImageUri, {
              encoding: FileSystem.EncodingType.Base64,
            });

            if (base64String && base64String.length > 0) {
              // Determine MIME type
              let mimeType = 'image/jpeg';
              const uriParts = profileImageUri.split('.');
              if (uriParts.length > 1) {
                const ext = uriParts[uriParts.length - 1].toLowerCase().split('?')[0];
                if (ext === 'png') mimeType = 'image/png';
                else if (ext === 'gif') mimeType = 'image/gif';
                else if (ext === 'webp') mimeType = 'image/webp';
              }

              // Format as data URL for API
              const dataUrl = `data:${mimeType};base64,${base64String}`;

              const uploadResponse = await fetch(`${apiUrl}/api/upload/images`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                  images: [dataUrl],
                  userId: user.id 
                }),
              });
              
              if (uploadResponse.ok) {
                const uploadData = await uploadResponse.json();
                if (uploadData.urls && uploadData.urls.length > 0) {
                  profilePictureUrl = uploadData.urls[0];
                }
              }
            }
          } catch (error) {
            console.error('Error uploading profile image:', error);
          }
        }

        // Update user profile
        const updateData: any = {
          user_name: username,
          bio: userBio || null,
        };
        
        if (profilePictureUrl) {
          updateData.profile_picture_url = profilePictureUrl;
        }

        await fetch(`${apiUrl}/api/users/${user.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData),
        });

        // Mark onboarding as complete
        await supabase.auth.updateUser({
          data: { onboarding_complete: true }
        });
      }
    } catch (error) {
      console.error('Error updating user profile:', error);
    }

    setCurrentStep('account-created');
  };

  const handleAddBioSkip = async () => {
    await handleAddBioNext('');
  };

  const handleAccountCreatedNext = () => {
    setCurrentStep('personalizing');
  };

  // Auto-advance from personalizing screen after 1 second
  useEffect(() => {
    if (currentStep === 'personalizing') {
      const timer = setTimeout(() => {
        setCurrentStep('interests-step1');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentStep]);

  const handleInterestsStep1Next = (selectedOptions: string[]) => {
    setTradePreferences(selectedOptions);
    setCurrentStep('interests-step2');
  };

  const handleInterestsStep1Skip = () => {
    setCurrentStep('interests-step2');
  };

  const handleInterestsStep2Next = async (selectedCategories: string[]) => {
    setCategoryPreferences(selectedCategories);
    
    // Update user profile with preferences
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const updateData: any = {
          trade_preferences: tradePreferences,
          category_preferences: selectedCategories,
        };

        await fetch(`${apiUrl}/api/users/${user.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData),
        });

        // Mark onboarding as complete
        await supabase.auth.updateUser({
          data: { onboarding_complete: true }
        });
      }
    } catch (error) {
      console.error('Error updating preferences:', error);
    }

    onComplete();
  };

  const handleInterestsStep2Skip = async () => {
    await handleInterestsStep2Next([]);
  };

  const handleBack = () => {
    if (currentStep === 'create-account') {
      onBack();
    } else if (currentStep === 'pick-picture') {
      setCurrentStep('create-account');
    } else if (currentStep === 'enter-username') {
      setCurrentStep('pick-picture');
    } else if (currentStep === 'add-bio') {
      setCurrentStep('enter-username');
    } else if (currentStep === 'interests-step1') {
      setCurrentStep('account-created');
    } else if (currentStep === 'interests-step2') {
      setCurrentStep('interests-step1');
    }
  };

  switch (currentStep) {
    case 'create-account':
      return (
        <CreateAccountScreen
          onBack={handleBack}
          onNext={handleCreateAccountNext}
        />
      );
    case 'pick-picture':
      return (
        <PickProfilePictureScreen
          onBack={handleBack}
          onNext={handlePickPictureNext}
        />
      );
    case 'enter-username':
      return (
        <EnterUsernameScreen
          onBack={handleBack}
          onNext={handleEnterUsernameNext}
        />
      );
    case 'add-bio':
      return (
        <AddBioScreen
          onBack={handleBack}
          onNext={handleAddBioNext}
          onSkip={handleAddBioSkip}
        />
      );
    case 'account-created':
      return (
        <AccountCreatedScreen
          profileImageUri={profileImageUri}
          username={username}
          onNext={handleAccountCreatedNext}
        />
      );
    case 'personalizing':
      return <PersonalizingScreen />;
    case 'interests-step1':
      return (
        <InterestsStep1Screen
          onBack={handleBack}
          onNext={handleInterestsStep1Next}
          onSkip={handleInterestsStep1Skip}
        />
      );
    case 'interests-step2':
      return (
        <InterestsStep2Screen
          onBack={handleBack}
          onNext={handleInterestsStep2Next}
          onSkip={handleInterestsStep2Skip}
        />
      );
    default:
      return null;
  }
}

