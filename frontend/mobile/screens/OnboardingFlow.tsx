import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import Constants from 'expo-constants';
import { supabase } from '../lib/supabaseClient';
import { buttons, palette } from '../constants/theme';

const TRADE_OPTIONS = ['Buying', 'Selling', 'Trading'] as const;
const TRADE_EMOJIS: { [key in (typeof TRADE_OPTIONS)[number]]: string } = {
  Buying: '🛍️',
  Selling: '💸',
  Trading: '🔄',
};

const CATEGORY_OPTIONS = [
  'Concert tickets',
  'Clothing',
  'Nails',
  'Ride Share',
  'Meal Swipes',
  'Photography',
  'Items',
  'Textbooks',
] as const;

const CATEGORY_ICONS: { [key in (typeof CATEGORY_OPTIONS)[number]]: string } = {
  'Concert tickets': '🎟️',
  Clothing: '👕',
  Nails: '💅',
  'Ride Share': '🚗',
  'Meal Swipes': '🍽️',
  Photography: '📷',
  Items: '📦',
  Textbooks: '📚',
};

const DEFAULT_AVATAR_OPTION = '__default__';
const EMOJI_OPTIONS = ['😀', '😄', '😊', '😎', '🤝', '🎉', '🍰', '🐻', '📚', '🚗', '💐', '🍗', '😜', '🛒', '❤️'];
const BACKGROUND_OPTIONS = ['#D8E4FF', '#FFF0D9', '#FFE0F4', '#DFF6EA'];

interface OnboardingFlowProps {
  onComplete: () => void;
  onExit: () => void;
}

const isValidUclaEmail = (email: string): boolean => {
  const value = email.trim().toLowerCase();
  return value.endsWith('@ucla.edu') || value.endsWith('@g.ucla.edu');
};

const splitName = (fullName: string) => {
  const trimmed = fullName.trim();
  if (!trimmed) {
    return { first: '', last: '' };
  }

  const [first, ...rest] = trimmed.split(/\s+/);
  return {
    first,
    last: rest.join(' '),
  };
};

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete, onExit }) => {
  const [step, setStep] = useState(0);
  const [loadingUser, setLoadingUser] = useState(true);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [creatingAccount, setCreatingAccount] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [userId, setUserId] = useState<string | null>(null);
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const phoneDigitsOnly = useMemo(() => phoneNumber.replace(/[^\d]/g, ''), [phoneNumber]);
  const formattedPhoneNumber = useMemo(() => {
    if (phoneDigitsOnly.length === 0) return '';
    const digits = phoneDigitsOnly.slice(0, 10);
    if (digits.length < 4) return digits;
    if (digits.length < 7) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    }
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }, [phoneDigitsOnly]);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [accountError, setAccountError] = useState<string | null>(null);

  const [bio, setBio] = useState('');
  const [interestsInput, setInterestsInput] = useState('');
  const [tradePreferences, setTradePreferences] = useState<string[]>([]);
  const [categoryPreferences, setCategoryPreferences] = useState<string[]>([]);

  const [useEmojiAvatar, setUseEmojiAvatar] = useState(true);
  const [avatarEmoji, setAvatarEmoji] = useState<string | null>(null);
  const [avatarBackground, setAvatarBackground] = useState(BACKGROUND_OPTIONS[0]);
  const [profileImageUri, setProfileImageUri] = useState<string | null>(null);
  const [profileImageRemoteUrl, setProfileImageRemoteUrl] = useState<string | null>(null);

  const apiUrl = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3001';

  const displayName = useMemo(() => {
    const trimmed = fullName.trim();
    if (trimmed.length > 0) return trimmed;
    if (username.trim().length > 0) return username.trim();
    if (email.trim().length > 0) return email.trim().split('@')[0].replace(/\./g, ' ');
    return 'Bruin';
  }, [email, fullName, username]);

  const getDisplayName = useCallback(() => {
    if (fullName.trim().length > 0) return fullName.trim();
    if (username.trim().length > 0) return username.trim();
    if (email.trim().length > 0) return email.trim().split('@')[0].replace(/\./g, ' ');
    return 'Bruin';
  }, [email, fullName, username]);

  const profileInitial = useMemo(() => {
    const displayNameLabel = getDisplayName();
    return displayNameLabel.trim().charAt(0).toUpperCase() || 'B';
  }, [getDisplayName]);

  const getAccountValidationError = useCallback((): string | null => {
    if (registrationComplete) return null;

    if (fullName.trim().length === 0) return 'Please enter your full name.';
    if (!isValidUclaEmail(email)) return 'Please use your UCLA email address.';
    if (phoneNumber.trim().length > 0 && phoneDigitsOnly.length < 10) {
      return 'Please enter a valid phone number.';
    }
    if (username.trim().length === 0) return 'Please choose a username.';
    if (password.length === 0) return 'Password is required.';
    if (password.length < 6) return 'Password must be at least 6 characters.';
    if (confirmPassword.length === 0) return 'Please confirm your password.';
    if (password !== confirmPassword) return 'Passwords do not match.';
    return null;
  }, [
    confirmPassword,
    email,
    fullName,
    password,
    phoneDigitsOnly,
    phoneNumber,
    registrationComplete,
    username,
  ]);

  const accountStepValid = useMemo(() => {
    if (registrationComplete) return true;
    return getAccountValidationError() === null;
  }, [getAccountValidationError, registrationComplete]);

  const continueDisabled = creatingAccount || submitting || uploadingImage;

  const continueLabel = step === 4 ? 'Finish' : 'Continue';

  const stepCopy = useMemo(() => {
    switch (step) {
      case 0:
        return {
          headline: 'Create your account',
          description: 'We just need a few details to get you set up with the Bruin community.',
        };
      case 1:
        return {
          headline: 'Add a Profile Picture',
          description: 'Choose a photo or emoji avatar so people recognize you.',
        };
      case 2:
        return {
          headline: 'Add your Bio & Interests',
          description: 'Share a quick intro and what you’re into around campus.',
        };
      case 3:
        return {
          headline: 'How do you want to use BruinCoin?',
          description: 'Pick everything that matches how you plan to engage.',
        };
      case 4:
      default:
        return {
          headline: 'What are you interested in?',
          description: 'Select a few categories so we can surface the best listings for you.',
        };
    }
  }, [step]);

  const parsedInterests = useMemo(
    () =>
      Array.from(
        new Set(
          interestsInput
            .split(',')
            .map((value) => value.trim())
            .filter((value) => value.length > 0),
        ),
      ),
    [interestsInput],
  );

  useEffect(() => {
    let isMounted = true;

    const handleNoAuthenticatedUser = () => {
      if (!isMounted) return;
      setRegistrationComplete(false);
      setUserId(null);
      setLoadingUser(false);
      setStep(0);
    };

    const loadUser = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();

        if (error) {
          const errorMessage = error.message?.toLowerCase?.() ?? '';
          const isAuthMissing =
            error.status === 401 ||
            errorMessage.includes('auth session missing') ||
            errorMessage.includes('invalid jwt') ||
            errorMessage.includes('must be logged in') ||
            errorMessage.includes('should be signed in');

          if (isAuthMissing) {
            handleNoAuthenticatedUser();
            return;
          }

          throw error;
        }

        const user = data?.user;
        if (!user) {
          handleNoAuthenticatedUser();
          return;
        }

        if (!isMounted) return;

        setUserId(user.id);
        setEmail(user.email ?? '');
        setRegistrationComplete(true);
        setStep(1);

        const metadata = user.user_metadata ?? {};
        const metadataDisplayName =
          typeof metadata.display_name === 'string' && metadata.display_name.trim().length > 0
            ? metadata.display_name.trim()
            : '';

        setFullName(
          metadataDisplayName ||
            (user.email ? user.email.split('@')[0].replace(/\./g, ' ') : 'Bruin'),
        );

        setPhoneNumber(
          typeof metadata.phone_number === 'string' ? metadata.phone_number : phoneNumber,
        );
        setUsername(typeof metadata.username === 'string' ? metadata.username : username);
        setBio(typeof metadata.bio === 'string' ? metadata.bio : bio);

        if (Array.isArray(metadata.interests) && metadata.interests.length > 0) {
          setInterestsInput(metadata.interests.join(', '));
        }

        if (Array.isArray(metadata.trade_preferences)) {
          setTradePreferences(metadata.trade_preferences as string[]);
        }

        if (Array.isArray(metadata.category_preferences)) {
          setCategoryPreferences(metadata.category_preferences as string[]);
        }

        const storedAvatarMode =
          typeof metadata.avatar_mode === 'string' ? metadata.avatar_mode : 'emoji';
        const storedEmoji =
          typeof metadata.avatar_emoji === 'string' ? metadata.avatar_emoji : avatarEmoji;
        const storedBackground =
          typeof metadata.avatar_background === 'string'
            ? metadata.avatar_background
            : avatarBackground;
        const storedProfile =
          typeof metadata.profile_picture_url === 'string' && metadata.profile_picture_url.length > 0
            ? metadata.profile_picture_url
            : null;

        setAvatarEmoji(storedEmoji);
        setAvatarBackground(storedBackground);
        setUseEmojiAvatar(storedAvatarMode !== 'image');
        setProfileImageUri(storedProfile);
        setProfileImageRemoteUrl(storedProfile);

        // Fetch backend profile for preferences/bio fallbacks
        try {
          const response = await fetch(`${apiUrl}/api/users/${user.id}`);
          if (response.ok) {
            const payload = await response.json();
            const backendUser = payload?.user;
            if (backendUser) {
              if (Array.isArray(backendUser.trade_preferences) && backendUser.trade_preferences.length) {
                setTradePreferences(backendUser.trade_preferences.map((item: any) => String(item)));
              }
              if (Array.isArray(backendUser.category_preferences) && backendUser.category_preferences.length) {
                setCategoryPreferences(backendUser.category_preferences.map((item: any) => String(item)));
              }
              if (
                typeof backendUser.bio === 'string' &&
                backendUser.bio.length > 0 &&
                (!metadata.bio || metadata.bio.length === 0)
              ) {
                setBio(backendUser.bio);
              }
            }
          }
        } catch (profileError) {
          console.warn('Failed to load backend profile during onboarding:', profileError);
        }
      } catch (err) {
        console.error('Failed to load user for onboarding:', err);
        Alert.alert('Error', 'Could not load your profile. Please log in again.', [
          { text: 'OK', onPress: onExit },
        ]);
      } finally {
        if (isMounted) {
          setLoadingUser(false);
        }
      }
    };

    loadUser();

    return () => {
      isMounted = false;
    };
  }, [apiUrl, onExit]);

  const toggleSelection = useCallback(
    (value: string, selectedValues: string[], setter: (values: string[]) => void) => {
    setter(
      selectedValues.includes(value)
        ? selectedValues.filter((option) => option !== value)
          : [...selectedValues, value],
    );
    },
    [],
  );

  const handleTradeToggle = useCallback(
    (option: (typeof TRADE_OPTIONS)[number]) => {
      toggleSelection(option, tradePreferences, setTradePreferences);
    },
    [toggleSelection, tradePreferences],
  );

  const handleCategoryToggle = useCallback(
    (option: (typeof CATEGORY_OPTIONS)[number]) => {
      toggleSelection(option, categoryPreferences, setCategoryPreferences);
    },
    [categoryPreferences, toggleSelection],
  );

  const pickProfileImage = useCallback(async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please allow photo access to choose a profile picture.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });

      if (!result.canceled && result.assets[0]) {
        setProfileImageUri(result.assets[0].uri);
        setUseEmojiAvatar(false);
      }
    } catch (error) {
      console.error('Error selecting profile image:', error);
      Alert.alert('Error', 'Failed to pick a photo. Please try again.');
    }
  }, []);

  const captureProfileImage = useCallback(async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please allow camera access to take a photo.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });

      if (!result.canceled && result.assets[0]) {
        setProfileImageUri(result.assets[0].uri);
        setUseEmojiAvatar(false);
      }
    } catch (error) {
      console.error('Error capturing image:', error);
      Alert.alert('Error', 'Failed to capture a photo. Please try again.');
    }
  }, []);

  const handleEmojiSelect = useCallback((emoji: string) => {
    setAvatarEmoji(emoji);
    setUseEmojiAvatar(true);
    setProfileImageUri(null);
  }, []);

  const handleBackgroundSelect = useCallback((hex: string) => {
    setAvatarBackground(hex);
  }, []);

  const handleResetAvatar = useCallback(() => {
    setAvatarEmoji(null);
    setUseEmojiAvatar(false);
    setProfileImageUri(null);
    setAvatarBackground(BACKGROUND_OPTIONS[0]);
  }, []);

  const handleRandomEmoji = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * EMOJI_OPTIONS.length);
    const randomEmoji = EMOJI_OPTIONS[randomIndex];
    setAvatarEmoji(randomEmoji);
    setUseEmojiAvatar(true);
    setProfileImageUri(null);
  }, []);

  const uploadProfileImage = useCallback(
    async (imageUri: string, userUuid: string): Promise<string | null> => {
      try {
        setUploadingImage(true);
        const base64String = await FileSystem.readAsStringAsync(imageUri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        if (!base64String) {
          throw new Error('Unable to read the selected image.');
        }

        let mimeType = 'image/jpeg';
        const uriParts = imageUri.split('.');
        if (uriParts.length > 1) {
          const ext = uriParts.pop()?.toLowerCase().split('?')[0];
          if (ext === 'png') mimeType = 'image/png';
          else if (ext === 'gif') mimeType = 'image/gif';
          else if (ext === 'webp') mimeType = 'image/webp';
        }

        const dataUrl = `data:${mimeType};base64,${base64String}`;
        const response = await fetch(`${apiUrl}/api/upload/images`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            images: [dataUrl],
            userId: userUuid,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Upload failed' }));
          throw new Error(errorData.error || 'Failed to upload profile picture.');
        }

        const data = await response.json();
        return data.urls && data.urls.length > 0 ? data.urls[0] : null;
      } catch (error: any) {
        console.error('Error uploading profile image:', error);
        throw error;
      } finally {
        setUploadingImage(false);
      }
    },
    [apiUrl],
  );

  const syncLookingForCategories = useCallback(
    async (userUuid: string, categories: string[]) => {
      if (!categories.length) return;

      try {
        const response = await fetch(`${apiUrl}/api/looking-for/${userUuid}`);
        const existingData = response.ok ? await response.json() : { items: [] };
        const existingNames = new Set<string>(
          Array.isArray(existingData.items)
            ? existingData.items
                .map((item: any) =>
                  typeof item?.item_name === 'string' ? item.item_name.toLowerCase() : '',
                )
                .filter(Boolean)
            : [],
        );

        const uniqueCategories = Array.from(
          new Set(categories.map((category) => category.trim()).filter(Boolean)),
        );

        for (const category of uniqueCategories) {
          if (existingNames.has(category.toLowerCase())) continue;

          await fetch(`${apiUrl}/api/looking-for`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              user_id: userUuid,
              item_name: category,
            }),
          });
        }
      } catch (error) {
        console.warn('Failed to sync looking-for categories during onboarding:', error);
      }
    },
    [apiUrl],
  );

  useEffect(() => {
    setAccountError(null);
  }, [fullName, phoneNumber, email, username, password, confirmPassword]);

  const ensureUsernameAvailable = useCallback(
    async (candidate: string) => {
      const normalized = candidate.trim().toLowerCase();
      if (!normalized) return;

      try {
        const response = await fetch(
          `${apiUrl}/api/users?search=${encodeURIComponent(candidate)}&limit=5`,
        );
        if (!response.ok) {
          throw new Error('Unable to confirm username availability. Please try again.');
        }

        const payload = await response.json();
        const taken =
          Array.isArray(payload?.users) &&
          payload.users.some(
            (existing: any) =>
              typeof existing?.user_name === 'string' &&
              existing.user_name.trim().toLowerCase() === normalized,
          );

        if (taken) {
          throw new Error('That username is already taken.');
        }
      } catch (error: any) {
        if (error?.message) throw error;
        throw new Error('Unable to confirm username availability. Please try again.');
      }
    },
    [apiUrl],
  );

  const handleAccountCreation = useCallback(async () => {
    if (registrationComplete) {
      setStep(1);
      return;
    }

    let trimmedUsername = username.trim();
    try {
      const validationError = getAccountValidationError();
      if (validationError) {
        throw new Error(validationError);
      }

      await ensureUsernameAvailable(trimmedUsername);
    } catch (error: any) {
      const message = error?.message || 'That username is already taken.';
      setAccountError(message);
      Alert.alert('Registration Error', message);
      return;
    }

    setAccountError(null);
    setCreatingAccount(true);

    const trimmedEmail = email.trim().toLowerCase();
    trimmedUsername = trimmedUsername.trim();
    const normalizedPhone = phoneDigitsOnly;
    const { first, last } = splitName(fullName);
    const computedDisplayName =
      fullName.trim() || trimmedUsername || trimmedEmail.split('@')[0].replace(/\./g, ' ');

    try {
      const { data, error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          data: {
            display_name: computedDisplayName,
            first_name: first,
            last_name: last,
            username: trimmedUsername,
            phone_number: normalizedPhone || null,
            avatar_mode: 'emoji',
            avatar_emoji: avatarEmoji,
            avatar_background: avatarBackground,
            onboarding_complete: false,
          },
        },
      });

      if (error) {
        throw error;
      }

      if (!data.user) {
        throw new Error('Account creation failed. Please try again.');
      }

      if (!data.session) {
        throw new Error('Check your email to verify your account before continuing.');
      }

      const newUser = data.user;
      setUserId(newUser.id);
      setRegistrationComplete(true);
      setStep(1);
      setPassword('');
      setConfirmPassword('');
      setAccountError(null);
      setProfileImageUri(null);
      setProfileImageRemoteUrl(null);
      setUseEmojiAvatar(true);
      setEmail(newUser.email ?? trimmedEmail);

      try {
        await fetch(`${apiUrl}/api/users`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: newUser.id,
            email: newUser.email ?? trimmedEmail,
            user_name: trimmedUsername.length ? trimmedUsername : computedDisplayName,
          }),
        });
      } catch (createError) {
        console.warn('Failed to create user profile on backend during onboarding:', createError);
      }
    } catch (err: any) {
      console.error('Registration failed:', err);
      const message = err?.message || 'Unable to create your account.';
      setAccountError(message);
      Alert.alert('Registration Error', message);
    } finally {
      setCreatingAccount(false);
    }
  }, [
    accountStepValid,
    ensureUsernameAvailable,
    apiUrl,
    avatarBackground,
    avatarEmoji,
    email,
    fullName,
    password,
    phoneNumber,
    registrationComplete,
    username,
  ]);

  const handleSubmit = useCallback(async () => {
    if (!userId) {
      Alert.alert('Error', 'We could not confirm your account. Please log in again.');
      return;
    }

    if (submitting) return;
    setSubmitting(true);

    const trimmedUsername = username.trim();
    const normalizedPhone = phoneDigitsOnly;
    const { first, last } = splitName(fullName);
    const computedDisplayName =
      fullName.trim() || trimmedUsername || (email ? email.split('@')[0].replace(/\./g, ' ') : 'Bruin');

    try {
      let uploadedProfileUrl = profileImageRemoteUrl;
      if (!useEmojiAvatar && profileImageUri) {
        if (profileImageUri.startsWith('http')) {
          uploadedProfileUrl = profileImageUri;
        } else {
        uploadedProfileUrl = await uploadProfileImage(profileImageUri, userId);
        }
      }

      if (useEmojiAvatar) {
        uploadedProfileUrl = null;
      }

      const metadataUpdate = {
        display_name: computedDisplayName,
        first_name: first,
        last_name: last,
        username: trimmedUsername,
        phone_number: normalizedPhone || null,
        bio: bio.trim(),
        interests: parsedInterests,
        trade_preferences: tradePreferences,
        category_preferences: categoryPreferences,
        profile_picture_url: uploadedProfileUrl,
        avatar_mode: useEmojiAvatar ? 'emoji' : 'image',
        avatar_emoji: useEmojiAvatar ? avatarEmoji : null,
        avatar_background: useEmojiAvatar ? avatarBackground : null,
        onboarding_complete: true,
      };

      const { error: updateError } = await supabase.auth.updateUser({
        data: metadataUpdate,
      });

      if (updateError) {
        throw updateError;
      }

      try {
        await fetch(`${apiUrl}/api/users/${userId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_name: trimmedUsername.length ? trimmedUsername : computedDisplayName,
            bio: bio.trim(),
            profile_picture_url: uploadedProfileUrl ?? '',
            trade_preferences: tradePreferences,
            category_preferences: categoryPreferences,
            interests: parsedInterests,
          }),
        });
      } catch (profileUpdateError) {
        console.warn('Failed to sync onboarding data to users table:', profileUpdateError);
      }

      await syncLookingForCategories(userId, categoryPreferences);
      setProfileImageRemoteUrl(uploadedProfileUrl);

      onComplete();
    } catch (error: any) {
      console.error('Failed to complete onboarding:', error);
      Alert.alert('Error', error.message || 'Failed to save your onboarding details.');
    } finally {
      setSubmitting(false);
    }
  }, [
    apiUrl,
    avatarBackground,
    avatarEmoji,
    bio,
    categoryPreferences,
    email,
    fullName,
    onComplete,
    parsedInterests,
    profileImageRemoteUrl,
    profileImageUri,
    submitting,
    syncLookingForCategories,
    tradePreferences,
    uploadProfileImage,
    useEmojiAvatar,
    userId,
    username,
    phoneNumber,
  ]);

  const handleContinue = useCallback(async () => {
    if (creatingAccount || submitting || uploadingImage) {
      return;
    }

    if (step === 0) {
      await handleAccountCreation();
      return;
    }

    if (step === 4) {
      await handleSubmit();
      return;
    }

    setStep((current) => Math.min(current + 1, 4));
  }, [handleAccountCreation, handleSubmit, step, creatingAccount, submitting, uploadingImage]);

  const handleBack = useCallback(() => {
    setStep((current) => Math.max(current - 1, 0));
  }, []);

  const handleExit = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Failed to sign out during onboarding exit:', error);
    } finally {
      onExit();
    }
  }, [onExit]);

  const renderAccountStep = () => (
    <View style={[styles.step, styles.accountStep]}>
      <Text style={styles.headline}>{stepCopy.headline}</Text>
      <View style={styles.accountFields}>
        <View style={styles.accountInputGroup}>
          <Text style={styles.accountInputLabel}>First and Last Name</Text>
          <TextInput
            style={styles.accountInput}
            value={fullName}
            onChangeText={setFullName}
            autoCapitalize="words"
            returnKeyType="next"
          />
        </View>

        <View style={styles.accountInputGroup}>
          <Text style={styles.accountInputLabel}>Phone Number</Text>
        <TextInput
          style={styles.accountInput}
          value={formattedPhoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
          returnKeyType="next"
        />
        </View>

        <View style={styles.accountInputGroup}>
          <Text style={styles.accountInputLabel}>UCLA Email</Text>
          <TextInput
            style={styles.accountInput}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
          />
        </View>

        <View style={styles.accountInputGroup}>
          <Text style={styles.accountInputLabel}>Username</Text>
          <TextInput
            style={styles.accountInput}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
          />
        </View>

        <View style={styles.accountInputGroup}>
          <Text style={styles.accountInputLabel}>Password</Text>
          <TextInput
            style={styles.accountInput}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            returnKeyType="next"
          />
        </View>

        <View style={styles.accountInputGroup}>
          <Text style={styles.accountInputLabel}>Confirm Password</Text>
          <TextInput
            style={styles.accountInput}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            returnKeyType="done"
          />
        </View>
      </View>
    </View>
  );

  const chunkItems = (items: string[], size: number) => {
    const result: string[][] = [];
    for (let i = 0; i < items.length; i += size) {
      result.push(items.slice(i, i + size));
    }
    return result;
  };

  const renderAvatarStep = () => {
    const showEmoji = useEmojiAvatar || !profileImageUri;
    const previewBackground = showEmoji ? avatarBackground : palette.neutralLight;
    const emojiChoices = [DEFAULT_AVATAR_OPTION, ...EMOJI_OPTIONS];
    const emojiRows = chunkItems(emojiChoices, 4);
    const backgroundRows = chunkItems(BACKGROUND_OPTIONS, 4);

    return (
      <View style={styles.step}>
        <Text style={[styles.headline, styles.headlineCentered]}>Add a Profile Picture</Text>

        <View style={styles.avatarPreview}>
          <View style={[styles.avatarCircle, { backgroundColor: previewBackground }]}>
            {profileImageUri ? (
              <Image source={{ uri: profileImageUri }} style={styles.avatarImage} />
            ) : avatarEmoji ? (
              <Text style={styles.avatarEmoji}>{avatarEmoji}</Text>
            ) : (
              <Ionicons name="person" size={72} color={palette.navyMuted} />
            )}
          </View>
          <Text style={styles.avatarName}>{displayName}</Text>
        </View>

        <View style={styles.optionsGroup}>
          <View style={styles.optionRow}>
            <TouchableOpacity
              style={[styles.optionPill, styles.optionPillIcon]}
              accessibilityRole="button"
              onPress={captureProfileImage}
            >
              <Ionicons name="camera" size={24} color={palette.navy} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.optionPill, styles.optionPillIcon]}
              accessibilityRole="button"
              onPress={pickProfileImage}
            >
              <Ionicons name="image" size={24} color={palette.navy} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.optionPill, styles.optionPillIcon]}
              accessibilityRole="button"
              onPress={handleRandomEmoji}
            >
              <Ionicons name="star" size={24} color={palette.navy} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.optionPill, styles.optionPillIcon]}
              accessibilityRole="button"
              onPress={handleResetAvatar}
            >
              <Ionicons name="refresh" size={24} color={palette.navy} />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.sectionLabel}>Icons</Text>
        <View style={styles.optionsGroup}>
          {emojiRows.map((row, rowIndex) => (
            <View key={`emoji-row-${rowIndex}`} style={styles.optionRow}>
              {row.map((emoji) => {
                if (emoji === DEFAULT_AVATAR_OPTION) {
                  const selected = !profileImageUri && !useEmojiAvatar;
                  return (
                    <TouchableOpacity
                      key={emoji}
                      style={[styles.optionPill, selected && styles.optionPillSelected]}
                      onPress={handleResetAvatar}
                    >
                      <Ionicons name="person" size={28} color={palette.navy} />
                    </TouchableOpacity>
                  );
                }

                const selected = avatarEmoji === emoji;
                return (
                  <TouchableOpacity
                    key={emoji}
                    style={[styles.optionPill, selected && styles.optionPillSelected]}
                    onPress={() => handleEmojiSelect(emoji)}
                  >
                    <Text style={styles.optionPillLabel}>{emoji}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>

        <Text style={styles.sectionLabel}>Background</Text>
        <View style={styles.optionsGroup}>
          {backgroundRows.map((row, rowIndex) => (
            <View key={`background-row-${rowIndex}`} style={styles.optionRow}>
              {row.map((hex) => {
                const selected = hex === avatarBackground;
                return (
                  <TouchableOpacity
                    key={hex}
                    style={[styles.optionPill, selected && styles.optionPillSelected]}
                    onPress={() => handleBackgroundSelect(hex)}
                  >
                    <View
                      style={[
                        styles.backgroundSwatch,
                        { backgroundColor: hex },
                        selected && styles.backgroundSwatchSelected,
                      ]}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderBioStep = () => (
    <View style={styles.step}>
      <Text style={[styles.headline, styles.headlineCentered, styles.headlineWithGap, styles.headlineBio]}>Add your Bio & Interests</Text>

      <View style={styles.avatarPreviewBio}>
        <View
          style={[
            styles.avatarCircleLarge,
            profileImageUri ? styles.avatarCircleImageWrapper : { backgroundColor: avatarBackground },
          ]}
        >
          {profileImageUri ? (
            <Image source={{ uri: profileImageUri }} style={styles.avatarImageLarge} />
          ) : useEmojiAvatar && avatarEmoji ? (
            <Text style={styles.avatarEmojiLarge}>{avatarEmoji}</Text>
          ) : (
            <Ionicons name="person" size={64} color={palette.navyMuted} />
          )}
        </View>
        <Text style={styles.avatarName}>{displayName}</Text>
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, styles.inputLabelIndented]}>Bio</Text>
        <View style={styles.textAreaWrapper}>
          <TextInput
            style={[styles.input, styles.multilineInput, styles.textAreaInput]}
            value={bio}
            onChangeText={setBio}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />
          {bio.trim().length === 0 && (
            <Text style={styles.textAreaPlaceholder}>Start typing...</Text>
          )}
        </View>
      </View>
    </View>
  );

  const renderTradeStep = () => (
    <View style={styles.tradeScreenContainer}>
      <Text style={[styles.headline, styles.headlineCentered, styles.tradeHeadline]}>What are you interested in?</Text>

      <View style={styles.centeredList}>
        {TRADE_OPTIONS.map((option) => {
          const selected = tradePreferences.includes(option);
          return (
            <TouchableOpacity
              key={option}
              style={[styles.optionCardCentered, selected && styles.optionCardCenteredSelected]}
              onPress={() => handleTradeToggle(option)}
            >
              <Text style={[styles.optionCardCenteredText, selected && styles.optionCardCenteredTextSelected]}>
                {option}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity
        style={[styles.primaryButton, styles.tradeContinueButton, continueDisabled && styles.primaryButtonDisabled]}
        onPress={handleContinue}
        disabled={continueDisabled}
      >
        {creatingAccount || submitting || uploadingImage ? (
          <ActivityIndicator color={buttons.primaryText} />
        ) : (
          <Text style={styles.primaryButtonText}>{continueLabel}</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderCategoryStep = () => (
    <View style={styles.step}>
      <Text style={[styles.headline, styles.headlineCentered, styles.categoryHeadline]}>What are you interested in?</Text>

      <View style={styles.categoryList}>
        {CATEGORY_OPTIONS.map((option) => {
          const selected = categoryPreferences.includes(option);
          return (
            <TouchableOpacity
              key={option}
              style={[styles.optionCardCategory, selected && styles.optionCardCategorySelected]}
              onPress={() => handleCategoryToggle(option)}
            >
              <Text style={styles.optionEmoji}>{CATEGORY_ICONS[option]}</Text>
              <Text style={[styles.optionCardCategoryText, selected && styles.optionCardCategoryTextSelected]}>
                {option}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const renderStep = () => {
    switch (step) {
      case 0:
        return renderAccountStep();
      case 1:
        return renderAvatarStep();
      case 2:
        return renderBioStep();
      case 3:
        return renderTradeStep();
      case 4:
      default:
        return renderCategoryStep();
    }
  };

  if (loadingUser) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={['top', 'bottom']}>
        <ActivityIndicator size="large" color={palette.navy} />
        <Text style={styles.loadingText}>Setting things up…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 16 : 0}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[styles.content, step === 0 && styles.contentCompact, step === 4 && styles.finalStepContent]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          scrollEnabled={step !== 4}
        >
          {renderStep()}
        </ScrollView>
      </KeyboardAvoidingView>

      {step !== 3 && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.primaryButton,
              styles.primaryButtonFull,
              continueDisabled && styles.primaryButtonDisabled,
            ]}
            onPress={handleContinue}
            disabled={continueDisabled}
          >
            {creatingAccount || submitting || uploadingImage ? (
              <ActivityIndicator color={buttons.primaryText} />
            ) : (
              <Text style={styles.primaryButtonText}>
                {step === 4 && categoryPreferences.length === 0 ? 'Not sure yet, explore?' : continueLabel}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.surface,
  },
  flex: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: palette.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: palette.navy,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 120,
  },
  contentCompact: {
    paddingTop: 56,
    paddingBottom: 48,
  },
  finalStepContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  step: {
    gap: 20,
  },
  headline: {
    fontSize: 26,
    fontWeight: '700',
    color: palette.navy,
  },
  headlineCentered: {
    textAlign: 'center',
  },
  headlineWithGap: {
    marginTop: 8,
  },
  headlineBio: {
    fontSize: 24,
  },
  subheadline: {
    fontSize: 16,
    color: palette.textMuted,
    lineHeight: 24,
  },
  accountStep: {
    gap: 28,
  },
  accountFields: {
    marginTop: 12,
    gap: 24,
  },
  accountInputGroup: {
    gap: 8,
  },
  accountInputLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: palette.navy,
  },
  accountInput: {
    paddingVertical: 6,
    paddingHorizontal: 0,
    fontSize: 16,
    color: palette.navy,
    borderBottomWidth: 1.5,
    borderBottomColor: palette.navy,
    backgroundColor: 'transparent',
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: palette.navy,
  },
  inputLabelIndented: {
    marginLeft: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: palette.neutralLight,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: palette.surfaceSubtle,
    fontSize: 16,
    color: palette.navy,
  },
  multilineInput: {
    minHeight: 132,
  },
  helperText: {
    fontSize: 13,
    color: palette.textSecondary,
  },
  textAreaWrapper: {
    position: 'relative',
  },
  textAreaInput: {
    paddingBottom: 28,
  },
  textAreaPlaceholder: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    fontSize: 14,
    color: palette.textSecondary,
  },
  errorText: {
    fontSize: 14,
    fontWeight: '600',
    color: palette.navyMuted,
  },
  avatarPreview: {
    alignItems: 'center',
    gap: 12,
  },
  avatarPreviewBio: {
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  avatarCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarCircleLarge: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarCircleImageWrapper: {
    backgroundColor: 'transparent',
  },
  avatarEmoji: {
    fontSize: 60,
  },
  avatarEmojiLarge: {
    fontSize: 56,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarImageLarge: {
    width: '100%',
    height: '100%',
  },
  avatarName: {
    fontSize: 20,
    fontWeight: '600',
    color: palette.navy,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: palette.navy,
    marginTop: 8,
  },
  optionsGroup: {
    gap: 12,
    marginTop: 16,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  optionPill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 18,
    backgroundColor: palette.chipBackground,
  },
  optionPillSelected: {
    borderWidth: 2,
    borderColor: palette.navyMuted,
  },
  optionPillLabel: {
    fontSize: 24,
  },
  optionPillIcon: {
    paddingVertical: 10,
  },
  backgroundSwatch: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  backgroundSwatchSelected: {
    borderWidth: 2,
    borderColor: palette.navyMuted,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.chipBackground,
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 16,
    marginBottom: 12,
    gap: 14,
  },
  optionCardSelected: {
    backgroundColor: palette.navy,
  },
  optionEmoji: {
    fontSize: 22,
  },
  optionEmojiSelected: {
    color: palette.surface,
  },
  optionCardText: {
    fontSize: 16,
    color: palette.navy,
    fontWeight: '600',
  },
  optionCardTextSelected: {
    color: palette.surface,
  },
  secondaryLink: {
    marginTop: 8,
    alignItems: 'center',
  },
  secondaryLinkText: {
    fontSize: 16,
    fontWeight: '600',
    color: palette.navyMuted,
  },
  tradeHeadline: {
    marginTop: 112,
    marginBottom: 16,
  },
  tradeContinueButton: {
    width: '105%',
    alignSelf: 'center',
    marginTop: 18,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 12,
    backgroundColor: palette.surface,
  },
  footerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  secondaryButton: {
    flex: 1,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: palette.neutralLight,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: palette.navy,
  },
  footerPlaceholder: {
    flex: 1,
  },
  primaryButton: {
    borderRadius: 18,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: buttons.primaryBackground,
    paddingHorizontal: 24,
  },
  primaryButtonFlex: {
    flex: 1,
  },
  primaryButtonFull: {
    width: '105%',
    alignSelf: 'center',
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: buttons.primaryText,
  },
  tradeStep: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 32,
  },
  tradeScreenContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 0,
    paddingBottom: 40,
    paddingTop: 60,
    alignItems: 'center',
    gap: 24,
  },
  centeredList: {
    width: '100%',
    alignItems: 'center',
    gap: 20,
  },
  optionCardCentered: {
    width: '90%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.chipBackground,
    borderRadius: 18,
    paddingVertical: 18,
  },
  optionCardCenteredSelected: {
    backgroundColor: palette.navy,
  },
  optionCardCenteredText: {
    fontSize: 16,
    fontWeight: '600',
    color: palette.navy,
  },
  optionCardCenteredTextSelected: {
    color: palette.surface,
  },
  categoryList: {
    marginTop: 16,
    width: '100%',
    gap: 8,
  },
  categoryHeadline: {
    marginTop: 24,
  },
  optionCardCategory: {
    width: '90%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: palette.chipBackground,
    borderRadius: 18,
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 18,
    alignSelf: 'center',
  },
  optionCardCategorySelected: {
    backgroundColor: palette.navy,
  },
  optionCardCategoryText: {
    fontSize: 16,
    fontWeight: '600',
    color: palette.navy,
  },
  optionCardCategoryTextSelected: {
    color: palette.surface,
  },
});

export default OnboardingFlow;
