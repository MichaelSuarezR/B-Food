import { StyleSheet, Text, TouchableOpacity, View, Image, Alert, Modal } from 'react-native';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import EditProfilePictureModal from './EditProfilePictureModal';

interface PickProfilePictureScreenProps {
  onBack: () => void;
  onNext: (imageUri: string | null) => void;
}

export default function PickProfilePictureScreen({ onBack, onNext }: PickProfilePictureScreenProps) {
  const [profileImageUri, setProfileImageUri] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const handlePickImage = async () => {
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
  };

  const handleOpenEditModal = () => {
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
  };

  const handleSaveImage = (uri: string | null) => {
    setProfileImageUri(uri);
    setShowEditModal(false);
  };

  const handleNext = () => {
    onNext(profileImageUri);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Navigation Bar */}
      <View style={styles.navBar}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#666" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Pick a profile picture</Text>
        <Text style={styles.subtitle}>
          Have a favorite selfie or icon? Upload it now!
        </Text>

        <TouchableOpacity 
          style={styles.imageContainer}
          onPress={handleOpenEditModal}
          activeOpacity={0.8}
        >
          {profileImageUri ? (
            <Image source={{ uri: profileImageUri }} style={styles.profileImage} />
          ) : (
            <View style={styles.placeholderContainer}>
              <Ionicons name="person" size={64} color="#9ca3af" />
            </View>
          )}
          <View style={styles.addButton}>
            <Ionicons name="add" size={24} color="#fff" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.nextButton}
          onPress={handleNext}
        >
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
      </View>

      <EditProfilePictureModal
        visible={showEditModal}
        currentImageUri={profileImageUri}
        onClose={handleCloseEditModal}
        onSave={handleSaveImage}
      />
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#111827',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 48,
    textAlign: 'center',
    lineHeight: 22,
  },
  imageContainer: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 48,
    position: 'relative',
    overflow: 'visible',
  },
  profileImage: {
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  placeholderContainer: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#374151',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#fff',
  },
  nextButton: {
    backgroundColor: '#1e40af',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 48,
    alignItems: 'center',
    width: '100%',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

