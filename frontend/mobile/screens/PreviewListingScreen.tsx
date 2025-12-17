import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabaseClient';
import Constants from 'expo-constants';

export interface ListingData {
  title: string;
  description: string;
  price: string;
  category: string;
  selectedOption: string | null;
  images?: string[];
  tags?: string[];
}

interface PreviewListingScreenProps {
  visible: boolean;
  listingData: ListingData;
  onClose: () => void;
  onPublish?: () => void;
  isPublishing?: boolean;
}

interface UserProfile {
  user_name: string | null;
  profile_picture_url: string | null;
  rating: number | null;
}

export default function PreviewListingScreen({
  visible,
  listingData,
  onClose,
  onPublish,
  isPublishing = false,
}: PreviewListingScreenProps) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const apiUrl = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3001';

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!visible) return;
      
      setLoadingProfile(true);
      try {
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !authUser) {
          console.error('Failed to get current user:', authError);
          setLoadingProfile(false);
          return;
        }

        const response = await fetch(`${apiUrl}/api/users/${authUser.id}`);
        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            setUserProfile({
              user_name: data.user.user_name,
              profile_picture_url: data.user.profile_picture_url,
              rating: data.user.rating,
            });
          }
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchUserProfile();
  }, [visible, apiUrl]);

  const formatDescription = (description: string) => {
    if (!description) return [];
    // Split by lines or create bullet points from text
    const lines = description.split('\n').filter(line => line.trim());
    return lines.length > 0 ? lines : [description];
  };

  const descriptionLines = formatDescription(listingData.description);

  return (
    <Modal visible={visible} animationType="none" presentationStyle="overFullScreen">
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        {/* Top Bar */}
        <View style={styles.topBar}>
          <Text style={styles.topBarText}>Preview Listing</Text>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Navigation Bar with Search */}
          <View style={styles.navBar}>
            <TouchableOpacity onPress={onClose} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#6b7280" />
            </TouchableOpacity>
            <View style={styles.searchBar}>
              <Ionicons name="search" size={20} color="#9ca3af" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search"
                placeholderTextColor="#9ca3af"
                editable={false}
              />
            </View>
          </View>

          {/* Main Content Card */}
          <View style={styles.contentCard}>
            {/* Title Section */}
            <View style={styles.titleSection}>
              <Text style={styles.titleText}>{listingData.title || 'Title'}</Text>
              <View style={styles.statusContainer}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>{listingData.selectedOption || 'Looking for'}</Text>
              </View>
            </View>

            {/* Images */}
            <View style={styles.imagesContainer}>
              {listingData.images && listingData.images.length > 0 ? (
                listingData.images.slice(0, 2).map((uri, index) => (
                  <Image
                    key={index}
                    source={{ uri }}
                    style={[styles.imagePlaceholder, index > 0 && { marginLeft: 12 }]}
                  />
                ))
              ) : (
                <>
                  <View style={styles.imagePlaceholder}>
                    <Ionicons name="image-outline" size={48} color="#9ca3af" />
                  </View>
                  <View style={[styles.imagePlaceholder, { marginLeft: 12 }]}>
                    <Ionicons name="image-outline" size={48} color="#9ca3af" />
                  </View>
                </>
              )}
            </View>

            {/* Tags Section */}
            {listingData.tags && listingData.tags.length > 0 && (
              <View style={styles.tagsSection}>
                <Text style={styles.sectionTitle}>Tags</Text>
                <View style={styles.tagsContainer}>
                  {listingData.tags.map((tag, index) => (
                    <View key={index} style={styles.tagPill}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Description Section */}
            <View style={styles.descriptionSection}>
              <Text style={styles.sectionTitle}>Description</Text>
              {descriptionLines.length > 0 ? (
                <View style={styles.bulletList}>
                  {descriptionLines.map((line, index) => (
                    <View key={index} style={styles.bulletItem}>
                      <Text style={styles.bullet}>•</Text>
                      <Text style={styles.bulletText}>{line}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={styles.noDescription}>No description provided</Text>
              )}
            </View>

            {/* Seller Section */}
            <View style={styles.sellerSection}>
              <Text style={styles.sectionTitle}>Seller</Text>
              <View style={styles.sellerInfo}>
                <View style={styles.sellerAvatar}>
                  {userProfile?.profile_picture_url ? (
                    <Image 
                      source={{ uri: userProfile.profile_picture_url }} 
                      style={styles.sellerAvatarImage}
                    />
                  ) : (
                    <Ionicons name="person" size={24} color="#9ca3af" />
                  )}
                </View>
                <View style={styles.sellerDetails}>
                  <Text style={styles.sellerName}>
                    {loadingProfile ? 'Loading...' : (userProfile?.user_name || 'Anonymous Seller')}
                  </Text>
                  <View style={styles.ratingContainer}>
                    {userProfile?.rating !== null && userProfile?.rating !== undefined ? (
                      <>
                        <Text style={styles.ratingText}>
                          {userProfile.rating.toFixed(1)}
                        </Text>
                        <Ionicons name="star" size={14} color="#FFD700" />
                      </>
                    ) : (
                      <>
                        <Text style={styles.ratingText}>0.0</Text>
                        <Ionicons name="star" size={14} color="#FFD700" />
                      </>
                    )}
                  </View>
                </View>
              </View>
            </View>

            {/* Publish Button */}
            <TouchableOpacity 
              style={[styles.publishButton, isPublishing && styles.publishButtonDisabled]} 
              onPress={onPublish}
              disabled={isPublishing}
            >
              {isPublishing ? (
                <ActivityIndicator color="#1f2937" />
              ) : (
                <Text style={styles.publishButtonText}>Publish</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  topBar: {
    backgroundColor: '#1f2937',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  topBarText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9ca3af',
  },
  scrollView: {
    flex: 1,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
  },
  backButton: {
    marginRight: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 40,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#1f2937',
  },
  contentCard: {
    backgroundColor: '#ffffff',
    margin: 16,
    borderRadius: 12,
    padding: 16,
  },
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    flex: 1,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#9ca3af',
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    color: '#6b7280',
  },
  imagesContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  imagePlaceholder: {
    flex: 1,
    height: 200,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagsSection: {
  marginBottom: 20,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagPill: {
    backgroundColor: '#e5e7eb',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  tagText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
  descriptionSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  bulletList: {
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bullet: {
    fontSize: 16,
    color: '#1f2937',
    marginRight: 8,
    marginTop: 2,
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    color: '#1f2937',
    lineHeight: 20,
    textDecorationLine: 'underline',
  },
  noDescription: {
    fontSize: 14,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  sellerSection: {
    marginBottom: 20,
  },
  sellerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sellerAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f3f4f6',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  sellerAvatarImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  sellerDetails: {
    flex: 1,
  },
  sellerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginRight: 4,
  },
  publishButton: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  publishButtonDisabled: {
    opacity: 0.6,
  },
  publishButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
});

