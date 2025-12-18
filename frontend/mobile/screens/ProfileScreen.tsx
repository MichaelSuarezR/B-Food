import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { supabase } from '../lib/supabaseClient';
import Constants from 'expo-constants';

interface ProfileScreenProps {
  onBack?: () => void;
  onLogout?: () => void;
  viewUserId?: string | null; // If provided, view this user's profile instead of current user's
  darkMode?: boolean;
}

interface User {
  id: string;
  user_name: string | null;
  email: string;
  bio: string | null;
  rating: number | null;
  profile_picture_url: string | null;
  trade_preferences?: string[] | null;
  category_preferences?: string[] | null;
  interests?: string[] | null;
}

interface OrderHistoryItem {
  id: string;
  hallName: string;
  date: string;
  total: string;
  status: 'completed' | 'in-progress' | 'cancelled';
}

export default function ProfileScreen({ onBack, onLogout, viewUserId, darkMode = false }: ProfileScreenProps) {
  const [user, setUser] = useState<User | null>(null);
  const [orderHistory, setOrderHistory] = useState<OrderHistoryItem[]>([]);
  const [displayNameOverride, setDisplayNameOverride] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [profileImageSavedUri, setProfileImageSavedUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingName, setEditingName] = useState('');
  const [profileImageUri, setProfileImageUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const apiUrl = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3001';

  const theme = useMemo(
    () => ({
      background: darkMode ? '#0f172a' : '#f3f4f6',
      card: darkMode ? '#1f2937' : '#ffffff',
      text: darkMode ? '#f8fafc' : '#1f2937',
      secondary: darkMode ? '#94a3b8' : '#6b7280',
      accent: '#3b82f6',
      chipBg: darkMode ? '#1d4ed8' : '#dbeafe',
      chipText: darkMode ? '#e0f2fe' : '#1d4ed8',
      border: darkMode ? '#273449' : '#e5e7eb',
    }),
    [darkMode],
  );
  const insets = useSafeAreaInsets();
  const navTopPadding = Math.max(insets.top, 24);
  const scrollBottomPadding = Math.max(insets.bottom, 16) + 32;

  useEffect(() => {
    fetchUserData();
  }, [viewUserId]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setOrderHistory([]);
      
      // If viewing another user's profile, use viewUserId; otherwise get current user
      let targetUserId: string;
      let isViewingOtherUser = false;
      
      if (viewUserId) {
        targetUserId = viewUserId;
        isViewingOtherUser = true;
      } else {
        // Get current user from Supabase auth
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !authUser) {
          console.error('Failed to get current user:', authError);
          setLoading(false);
          return;
        }
        
        targetUserId = authUser.id;
        setEmailAddress(authUser.email || '');
      }

      let metadataDisplayName = '';
      let metadataProfileUrl = null;

      // Only get metadata if viewing own profile
      if (!isViewingOtherUser) {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          const metadata = authUser.user_metadata ?? {};
          metadataDisplayName =
            typeof metadata.display_name === 'string' ? metadata.display_name.trim() : '';
          metadataProfileUrl =
            typeof metadata.profile_picture_url === 'string' && metadata.profile_picture_url.length > 0
              ? metadata.profile_picture_url
              : null;
        }
      }

      let resolvedName = metadataDisplayName;
      let resolvedProfileUrl = metadataProfileUrl;

      // Fetch user profile from API
      const userResponse = await fetch(`${apiUrl}/api/users/${targetUserId}`);
      if (userResponse.ok) {
        const userData = await userResponse.json();
        if (userData.user) {
          setUser(userData.user);
          resolvedName = resolvedName || userData.user.user_name || '';
          resolvedProfileUrl = resolvedProfileUrl || userData.user.profile_picture_url || null;
        }
      } else if (userResponse.status === 404) {
        // User doesn't exist in users table
        if (isViewingOtherUser) {
          // Can't create profile for other users
          console.error('User profile not found');
          setLoading(false);
          return;
        }
        // Create one for current user
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          const createResponse = await fetch(`${apiUrl}/api/users`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              id: authUser.id,
              email: authUser.email || '',
              user_name: authUser.user_metadata?.user_name || null,
            }),
          });
        
        if (createResponse.ok) {
          const createData = await createResponse.json();
          if (createData.user) {
            setUser(createData.user);
            resolvedName = resolvedName || createData.user.user_name || '';
            resolvedProfileUrl = resolvedProfileUrl || createData.user.profile_picture_url || null;
          }
        } else {
          // Fallback to auth user data if creation fails
          const fallbackUser = {
            id: authUser.id,
            email: authUser.email || '',
            user_name: authUser.user_metadata?.user_name || null,
            bio: null,
            rating: null,
            profile_picture_url: null,
            trade_preferences: null,
            category_preferences: null,
            interests: null,
          };
          setUser(fallbackUser);
          resolvedName = resolvedName || fallbackUser.user_name || '';
          resolvedProfileUrl = resolvedProfileUrl || fallbackUser.profile_picture_url || null;
        }
        }
      }

      const normalizedName = resolvedName || '';
      const normalizedProfileUri = resolvedProfileUrl || null;

      setEditingName(normalizedName);
      setProfileImageUri(normalizedProfileUri);
      setProfileImageSavedUri(normalizedProfileUri);
      if (!isViewingOtherUser) {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          setDisplayNameOverride(
            normalizedName ||
              (authUser.email ? authUser.email.split('@')[0].replace(/\./g, ' ') : '')
          );
        }
      } else {
        setDisplayNameOverride(normalizedName);
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUsername = () => {
    if (displayNameOverride) return displayNameOverride;
    if (user?.user_name) return user.user_name;
    if (user?.email) {
      const emailPart = user.email.split('@')[0];
      // Remove dots and format nicely
      return emailPart.replace(/\./g, '');
    }
    return 'User';
  };

  const getDisplayName = () => {
    if (displayNameOverride) return displayNameOverride;
    if (user?.user_name) return user.user_name;
    if (user?.email) {
      const emailPart = user.email.split('@')[0];
      // Capitalize first letter of each word
      return emailPart.split('.').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ') || emailPart.charAt(0).toUpperCase() + emailPart.slice(1);
    }
    return 'User';
  };

  const emailToShow = emailAddress || user?.email || '';
  const displayNameLabel = getDisplayName();
  const profileInitial = displayNameLabel.trim().charAt(0).toUpperCase() || 'B';

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await supabase.auth.signOut();
          } catch (error) {
            console.error('Failed to sign out:', error);
          } finally {
            if (onLogout) onLogout();
          }
        },
      },
    ]);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditingName(displayNameLabel);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingName(displayNameLabel);
    setProfileImageUri(profileImageSavedUri);
  };

  const pickProfileImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera roll permissions to select a profile picture.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setProfileImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const uploadProfileImage = async (imageUri: string, userId: string): Promise<string | null> => {
    try {
      // Read file as base64
      const base64String = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      if (!base64String || base64String.length === 0) {
        throw new Error('Failed to read image file');
      }

      // Determine MIME type
      let mimeType = 'image/jpeg';
      const uriParts = imageUri.split('.');
      if (uriParts.length > 1) {
        const ext = uriParts[uriParts.length - 1].toLowerCase().split('?')[0];
        if (ext === 'png') mimeType = 'image/png';
        else if (ext === 'gif') mimeType = 'image/gif';
        else if (ext === 'webp') mimeType = 'image/webp';
      }

      // Format as data URL
      const dataUrl = `data:${mimeType};base64,${base64String}`;

      // Upload via API
      const response = await fetch(`${apiUrl}/api/upload/images`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          images: [dataUrl],
          userId: userId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Upload failed' }));
        throw new Error(errorData.error || 'Failed to upload image');
      }

      const data = await response.json();
      return data.urls && data.urls.length > 0 ? data.urls[0] : null;
    } catch (error: any) {
      console.error('Error uploading profile image:', error);
      throw error;
    }
  };

  const handleSave = async () => {
    if (!user || viewUserId) return; // Don't allow saving when viewing another user's profile

    try {
      setSaving(true);

      // Get current user from Supabase auth
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      if (authError || !authUser) {
        Alert.alert('Error', 'Failed to get current user');
        setSaving(false);
        return;
      }

      let profilePictureUrl = profileImageUri;

      // Upload new profile image if a local URI is set (not already a URL)
      if (profileImageUri && !profileImageUri.startsWith('http')) {
        try {
          const uploadedUrl = await uploadProfileImage(profileImageUri, authUser.id);
          if (uploadedUrl) {
            profilePictureUrl = uploadedUrl;
          } else {
            Alert.alert('Warning', 'Failed to upload profile picture. Continue without updating it?', [
              { text: 'Cancel', onPress: () => { setSaving(false); return; } },
              { text: 'Continue', onPress: () => {} }
            ]);
            if (!uploadedUrl) {
              profilePictureUrl = user.profile_picture_url; // Keep existing
            }
          }
        } catch (error: any) {
          Alert.alert('Error', error.message || 'Failed to upload profile picture');
          setSaving(false);
          return;
        }
      }

      await supabase.auth.updateUser({
        data: {
          display_name: editingName.trim(),
          profile_picture_url: profilePictureUrl || '',
        },
      });

      // Update user profile
      const updateData: Record<string, string> = {};
      if (editingName.trim() !== (user.user_name || '')) {
        updateData.user_name = editingName.trim();
      }
      if (profilePictureUrl !== user.profile_picture_url) {
        updateData.profile_picture_url = profilePictureUrl || '';
      }

      if (Object.keys(updateData).length === 0) {
        setIsEditing(false);
        setSaving(false);
        return;
      }

      const response = await fetch(`${apiUrl}/api/users/${authUser.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Update failed' }));
        Alert.alert('Error', errorData.error || 'Failed to update profile');
        setSaving(false);
        return;
      }

      const responseData = await response.json();
      if (responseData.user) {
        setUser(responseData.user);
        setDisplayNameOverride(editingName.trim());
        setProfileImageUri(profilePictureUrl || null);
        setProfileImageSavedUri(profilePictureUrl || null);
        setIsEditing(false);
        Alert.alert('Success', 'Profile updated successfully!');
      }
    } catch (error: any) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', error.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['bottom']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: scrollBottomPadding }]}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.navBar,
            {
              backgroundColor: theme.background,
              paddingTop: navTopPadding,
              borderBottomColor: `${theme.border}66`,
            },
          ]}
        >
          {onBack ? (
            <TouchableOpacity onPress={onBack} style={styles.navButton}>
              <Ionicons name="chevron-back" size={26} color={theme.text} />
            </TouchableOpacity>
          ) : (
            <View style={styles.navButton} />
          )}
          <View style={styles.navCenter}>
            <Text style={[styles.navTitle, { color: theme.text }]}>
              {viewUserId ? 'Profile' : 'Your Profile'}
            </Text>
            <Text style={[styles.navSubtitle, { color: theme.secondary }]}>
              {getUsername()}
            </Text>
          </View>
          {!viewUserId && (
            !isEditing ? (
              <TouchableOpacity onPress={handleEdit} style={styles.navButton}>
                <Ionicons name="create-outline" size={22} color={theme.text} />
              </TouchableOpacity>
            ) : (
              <View style={styles.headerActions}>
                <TouchableOpacity
                  onPress={handleCancel}
                  style={[styles.roundIconButton, { backgroundColor: `${theme.accent}15` }]}
                >
                  <Ionicons name="close" size={18} color="#ef4444" />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSave} style={[styles.roundIconButton, { backgroundColor: theme.accent }]} disabled={saving}>
                  {saving ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Ionicons name="checkmark" size={18} color="#ffffff" />
                  )}
                </TouchableOpacity>
              </View>
            )
          )}
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.accent} />
          </View>
        ) : (
          <>
        {/* Profile Information */}
        <View
          style={[
            styles.profileSection,
            {
              backgroundColor: theme.card,
              shadowColor: darkMode ? '#000000' : '#00000022',
              borderColor: theme.border,
            },
          ]}
        >
          <View style={styles.profileImageContainer}>
                <TouchableOpacity
                  onPress={!viewUserId && isEditing ? pickProfileImage : undefined}
                  disabled={!isEditing}
                  style={styles.profileImageTouchable}
                >
            <View
              style={[
                styles.profileImage,
                { backgroundColor: darkMode ? '#0f172a' : '#e2e8f0', borderColor: theme.accent },
              ]}
            >
                    {profileImageUri ? (
                      <Image
                        source={{ uri: profileImageUri }}
                        style={styles.profileImagePhoto}
                      />
                    ) : (
                      <View
                        style={[
                          styles.profileImagePlaceholder,
                          { backgroundColor: darkMode ? '#1e293b' : '#dbeafe' },
                        ]}
                      >
                        <Text style={[styles.profileImageInitial, { color: theme.text }]}>
                          {profileInitial}
                        </Text>
                      </View>
                    )}
                    {isEditing && (
                      <View style={styles.profileImageOverlay}>
                        <Ionicons name="camera" size={24} color="#ffffff" />
                      </View>
                    )}
            </View>
                </TouchableOpacity>
          </View>

          <View style={styles.profileInfo}>
            <View style={styles.nameRow}>
              {isEditing ? (
                <TextInput
                  style={[styles.nameInput, { color: theme.text, borderBottomColor: theme.accent }]}
                  value={editingName}
                  onChangeText={setEditingName}
                  placeholder="Enter your name"
                  placeholderTextColor={darkMode ? '#64748b' : '#9ca3af'}
                />
              ) : (
                <Text style={[styles.profileName, { color: theme.text }]}>{displayNameLabel}</Text>
              )}
            </View>

            {!!emailToShow && (
              <Text style={[styles.profileEmail, { color: theme.secondary }]}>{emailToShow}</Text>
            )}

            {!isEditing && (
              <View style={styles.ratingContainer}>
                {[...Array(5)].map((_, i) => {
                  const rating = user?.rating || 0;
                  const filled = i < Math.floor(rating);
                  return (
                    <View key={i} style={i > 0 ? styles.ratingStarSpacing : undefined}>
                      <Ionicons
                        name="star"
                        size={20}
                        color={filled ? theme.accent : darkMode ? '#334155' : '#e5e7eb'}
                      />
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        </View>

        {/* Order History */}
        <View
          style={[
            styles.section,
            { backgroundColor: theme.card, borderColor: theme.border, shadowColor: darkMode ? '#000000' : '#00000015' },
          ]}
        >
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Order History</Text>
            <Text style={[styles.sectionSubtitle, { color: theme.secondary }]}>
              {orderHistory.length > 0 ? 'Recent orders' : 'Coming soon'}
            </Text>
          </View>
          {orderHistory.length === 0 ? (
            <View
              style={[
                styles.emptyHistoryCard,
                {
                  borderColor: theme.border,
                  backgroundColor: darkMode ? '#111827' : '#f8fafc',
                },
              ]}
            >
              <Ionicons name="fast-food-outline" size={28} color={theme.secondary} style={{ marginBottom: 8 }} />
              <Text style={[styles.emptyHistoryTitle, { color: theme.text }]}>No orders yet</Text>
              <Text style={[styles.emptyHistorySubtitle, { color: theme.secondary }]}>
                Your Bruin Bites will appear here once you start ordering.
              </Text>
            </View>
          ) : (
            orderHistory.map((order) => (
              <View
                key={order.id}
                style={[
                  styles.orderCard,
                  {
                    borderColor: theme.border,
                    backgroundColor: darkMode ? '#111827' : '#ffffff',
                  },
                ]}
              >
                <View>
                  <Text style={[styles.orderHall, { color: theme.text }]}>{order.hallName}</Text>
                  <Text style={[styles.orderMeta, { color: theme.secondary }]}>{order.date}</Text>
                </View>
                <View style={styles.orderTotals}>
                  <Text style={[styles.orderTotal, { color: theme.text }]}>{order.total}</Text>
                  <Text style={[styles.orderStatus, { color: theme.secondary }]}>{order.status}</Text>
                </View>
              </View>
            ))
          )}
        </View>
          </>
        )}
        {!viewUserId && (
          <View style={[styles.logoutContainer, { borderColor: theme.border }]}>
            <TouchableOpacity
              style={[
                styles.logoutButton,
                { backgroundColor: darkMode ? '#1f2937' : '#fee2e2' },
              ]}
              onPress={handleLogout}
            >
              <Ionicons
                name="log-out-outline"
                size={20}
                color={darkMode ? '#f87171' : '#ef4444'}
                style={{ marginRight: 8 }}
              />
              <Text style={[styles.logoutText, { color: darkMode ? '#fecaca' : '#b91c1c' }]}>Logout</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 48,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  navButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navCenter: {
    flex: 1,
    alignItems: 'center',
  },
  navTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  navSubtitle: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  roundIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1118270f',
  },
  profileSection: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 20,
    marginTop: 8,
    marginHorizontal: 16,
    borderRadius: 18,
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
  },
  profileImageContainer: {
    marginRight: 16,
  },
  profileImageTouchable: {
    width: 110,
    height: 110,
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 55,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  profileImagePhoto: {
    width: '100%',
    height: '100%',
  },
  profileImagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileImageInitial: {
    fontSize: 40,
    fontWeight: '700',
  },
  profileImageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 55,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  profileEmail: {
    fontSize: 14,
    marginTop: 4,
  },
  nameInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    borderBottomWidth: 1,
    paddingBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
  },
  ratingStarSpacing: {
    marginLeft: 2,
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    marginTop: 8,
    marginHorizontal: 16,
    borderRadius: 16,
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyHistoryCard: {
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    textAlign: 'center',
  },
  emptyHistoryTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  emptyHistorySubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  orderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  orderHall: {
    fontSize: 16,
    fontWeight: '600',
  },
  orderMeta: {
    fontSize: 13,
    marginTop: 4,
  },
  orderTotals: {
    alignItems: 'flex-end',
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: '700',
  },
  orderStatus: {
    fontSize: 13,
    marginTop: 2,
    textTransform: 'capitalize',
  },
  logoutContainer: {
    alignItems: 'stretch',
    marginTop: 24,
    marginBottom: 40,
    marginHorizontal: 16,
    borderWidth: 1,
    borderRadius: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    width: '100%',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
