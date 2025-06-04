import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Button from '../components/Button';
import Input from '../components/Input';
import { useForm, Controller } from 'react-hook-form';
import * as ImagePicker from 'expo-image-picker';
import { UserInfo } from '../types/user';
import UserService from '../services/UserService';
import StorageService from '../services/StorageService';

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
  userInfo: UserInfo;
  onUpdateSuccess: (updatedInfo: UserInfo) => void;
}

interface EditProfileFormData {
  full_name: string;
}

const generateUniqueFilename = () => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${random}`;
};

const EditProfileModal = ({ visible, onClose, userInfo, onUpdateSuccess }: EditProfileModalProps) => {
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<EditProfileFormData>({
    defaultValues: {
      full_name: userInfo.full_name,
    },
  });

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const onSubmit = async (data: EditProfileFormData) => {
    try {
      setLoading(true);
      
      // Prepare update data
      const updateData: { full_name?: string; avatar?: string } = {};
      
      // Add full_name if changed
      if (data.full_name !== userInfo.full_name) {
        updateData.full_name = data.full_name;
      }

      // Handle avatar upload if selected
      if (selectedImage) {
        const formData = new FormData();
        
        // Generate unique filename using timestamp + random string
        const filename = generateUniqueFilename();
        
        formData.append('file', {
          uri: selectedImage,
          type: 'image/jpeg',
          name: filename,
        } as any);
        formData.append('object_name', filename);
        formData.append('bucket_name', 'avatar');

        const uploadResponse = await UserService.uploadAvatar(formData);
        updateData.avatar = uploadResponse.data.url;
      }

      // Only call update API if there are changes
      if (Object.keys(updateData).length > 0) {
        const updateResponse = await UserService.updateUserInfo(updateData);
        
        // Update local storage with new data
        const updatedUserInfo = {
          ...userInfo,
          ...updateResponse.data,
        };
        await StorageService.setUserInfo(updatedUserInfo);
        
        onUpdateSuccess(updatedUserInfo);
      }
      
      onClose();
    } catch (error) {
      console.error('Error in onSubmit:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Edit Profile</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialIcons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          <View style={styles.avatarSection}>
            <TouchableOpacity onPress={pickImage}>
              <View style={styles.avatarContainer}>
                {(selectedImage || userInfo.avatar) ? (
                  <Image
                    source={{ uri: selectedImage || userInfo.avatar }}
                    style={styles.avatar}
                  />
                ) : (
                  <Image
                    source={require('../../assets/default-avatar.png')}
                    style={styles.avatar}
                  />
                )}
                <View style={styles.editIconContainer}>
                  <MaterialIcons name="edit" size={20} color="#fff" />
                </View>
              </View>
            </TouchableOpacity>
          </View>

          <Controller
            control={control}
            name="full_name"
            rules={{
              required: 'Full name is required',
            }}
            render={({ field: { onChange, value } }) => (
              <Input
                name="full_name"
                control={control}
                icon="person"
                placeholder="Full Name"
              />
            )}
          />

          <Button
            title="Save Changes"
            onPress={handleSubmit(onSubmit)}
            loading={loading}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: '50%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    position: 'relative',
  },
  avatar: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#007AFF',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default EditProfileModal; 