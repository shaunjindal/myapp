import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from './Button';
import { Input } from './Input';
import { theme } from '../styles/theme';
import { useAddressStore } from '../store/addressStore';
import { mapAddressToCreateRequest, AddressDto } from '../types/api';

interface AddAddressModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: (address?: AddressDto) => void;
  editingAddress?: AddressDto | null;
  mode?: 'add' | 'edit';
  title?: string;
}

export const AddAddressModal: React.FC<AddAddressModalProps> = ({
  visible,
  onClose,
  onSuccess,
  editingAddress = null,
  mode = 'add',
  title,
}) => {
  const { addAddress, updateAddress } = useAddressStore();
  const [loading, setLoading] = useState(false);
  
  const [address, setAddress] = useState({
    type: 'home' as 'home' | 'work' | 'other',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    isDefault: false,
  });

  const addressTypes = [
    { value: 'home', label: 'Home' },
    { value: 'work', label: 'Work' },
    { value: 'other', label: 'Other' },
  ];

  // Reset form when modal opens/closes or when editing address changes
  useEffect(() => {
    if (visible) {
      if (mode === 'edit' && editingAddress) {
        // Map backend address type to frontend format
        const frontendType: 'home' | 'work' | 'other' = 
          editingAddress.type === 'BILLING' ? 'work' : 
          editingAddress.type === 'SHIPPING' ? 'home' : 'other';
        
        setAddress({
          type: frontendType,
          street: editingAddress.street,
          city: editingAddress.city,
          state: editingAddress.state,
          zipCode: editingAddress.zipCode,
          country: editingAddress.country,
          isDefault: editingAddress.isDefault,
        });
      } else {
        // Reset to default values for add mode
        setAddress({
          type: 'home',
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'United States',
          isDefault: false,
        });
      }
    }
  }, [visible, mode, editingAddress]);

  const handleSubmit = async () => {
    if (!address.street || !address.city || !address.state || !address.zipCode) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'edit' && editingAddress) {
        // For update, we need to convert to the create request format
        const createRequest = mapAddressToCreateRequest(address);
        const updatedAddress = await updateAddress(editingAddress.id, createRequest);
        Alert.alert('Success', 'Address updated successfully!');
        onSuccess?.(updatedAddress);
        onClose();
      } else {
        // For add, we use the create request format
        const createRequest = mapAddressToCreateRequest(address);
        const createdAddress = await addAddress(createRequest);
        Alert.alert('Success', 'Address added successfully!');
        onSuccess?.(createdAddress);
        onClose();
      }
    } catch (error) {
      console.error('Error managing address:', error);
      Alert.alert('Error', `Failed to ${mode} address. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  const modalTitle = title || (mode === 'edit' ? 'Edit Address' : 'Add New Address');
  const buttonTitle = mode === 'edit' ? 'Update Address' : 'Add Address';

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={handleClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>{modalTitle}</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
          <View style={styles.formSection}>
            <Text style={styles.formLabel}>Address Type</Text>
            <View style={styles.typeSelector}>
              {addressTypes.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.typeButton,
                    address.type === type.value && styles.typeButtonActive,
                  ]}
                  onPress={() => setAddress({ ...address, type: type.value as 'home' | 'work' | 'other' })}
                >
                  <Text style={[
                    styles.typeButtonText,
                    address.type === type.value && styles.typeButtonTextActive,
                  ]}>
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.formLabel}>Street Address *</Text>
            <Input
              placeholder="Enter street address"
              value={address.street}
              onChangeText={(text) => setAddress({ ...address, street: text })}
              style={styles.input}
            />
          </View>

          <View style={styles.formSection}>
            <Text style={styles.formLabel}>City *</Text>
            <Input
              placeholder="Enter city"
              value={address.city}
              onChangeText={(text) => setAddress({ ...address, city: text })}
              style={styles.input}
            />
          </View>

          <View style={styles.formSection}>
            <Text style={styles.formLabel}>State *</Text>
            <Input
              placeholder="Enter state"
              value={address.state}
              onChangeText={(text) => setAddress({ ...address, state: text })}
              style={styles.input}
            />
          </View>

          <View style={styles.formSection}>
            <Text style={styles.formLabel}>ZIP Code *</Text>
            <Input
              placeholder="Enter ZIP code"
              value={address.zipCode}
              onChangeText={(text) => setAddress({ ...address, zipCode: text })}
              style={styles.input}
            />
          </View>

          <View style={styles.formSection}>
            <Text style={styles.formLabel}>Country</Text>
            <Input
              placeholder="Enter country"
              value={address.country}
              onChangeText={(text) => setAddress({ ...address, country: text })}
              style={styles.input}
            />
          </View>

          <View style={styles.formSection}>
            <TouchableOpacity 
              style={styles.defaultCheckbox}
              onPress={() => setAddress({ ...address, isDefault: !address.isDefault })}
            >
              <View style={[styles.checkbox, address.isDefault && styles.checkboxChecked]}>
                {address.isDefault && <Ionicons name="checkmark" size={16} color="#ffffff" />}
              </View>
              <Text style={styles.checkboxLabel}>Set as default address</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.buttonContainer}>
            <Button
              title={loading ? (mode === 'edit' ? 'Updating...' : 'Adding...') : buttonTitle}
              onPress={handleSubmit}
              disabled={loading}
              style={styles.submitButton}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
  },
  cancelText: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.primary[600],
    fontWeight: '500',
  },
  modalTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  placeholder: {
    width: 60, // Same width as cancel text to center the title
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
  },
  formSection: {
    marginBottom: theme.spacing.lg,
  },
  formLabel: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  input: {
    backgroundColor: theme.colors.surface,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  typeButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.gray[300],
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: theme.colors.primary[50],
    borderColor: theme.colors.primary[600],
  },
  typeButtonText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: '500',
    color: theme.colors.text.secondary,
  },
  typeButtonTextActive: {
    color: theme.colors.primary[600],
    fontWeight: '600',
  },
  defaultCheckbox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: theme.colors.gray[300],
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: theme.colors.primary[600],
    borderColor: theme.colors.primary[600],
  },
  checkboxLabel: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.primary,
    fontWeight: '500',
  },
  buttonContainer: {
    paddingVertical: theme.spacing.xl,
  },
  submitButton: {
    width: '100%',
  },
}); 