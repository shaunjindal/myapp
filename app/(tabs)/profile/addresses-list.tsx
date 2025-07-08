import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Modal,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useAddressStore } from '../../../src/store/addressStore';
import { Button } from '../../../src/components/Button';
import { theme } from '../../../src/styles/theme';
import { Ionicons } from '@expo/vector-icons';
import { AddressDto } from '../../../src/types/api';
import { AddAddressModal } from '../../../src/components/AddAddressModal';

export default function AddressesListScreen() {
  const { 
    addresses, 
    loading, 
    error, 
    message, 
    fetchAddresses,
    deleteAddress, 
    setDefaultAddress 
  } = useAddressStore();
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteSheet, setShowDeleteSheet] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<{id: string, type: string, street: string} | null>(null);
  const [editingAddress, setEditingAddress] = useState<AddressDto | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch addresses when component mounts (will use cache if available)
  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  // Handle pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAddresses(true); // Force refresh
    setRefreshing(false);
  };

  const handleAddAddress = async () => {
    // This function is now called after the modal successfully adds the address
    setShowAddModal(false);
    // No need to refresh manually - address store will handle state updates
  };

  const handleEditAddress = (address: AddressDto) => {
    setEditingAddress(address);
    setShowEditModal(true);
  };

  const handleUpdateAddress = async () => {
    // This function is now called after the modal successfully updates the address
    setEditingAddress(null);
    setShowEditModal(false);
    // No need to refresh manually - authStore will handle state updates
  };

  const handleDeleteAddress = (addressId: string, addressType: string) => {
    if (!addresses || addresses.length === 0) {
      Alert.alert('Error', 'No addresses found');
      return;
    }
    
    const addressExists = addresses.find(addr => addr.id === addressId);
    if (!addressExists) {
      Alert.alert('Error', 'Address not found');
      return;
    }
    
    setAddressToDelete({ id: addressId, type: addressType, street: addressExists.street });
    setShowDeleteSheet(true);
  };

  const handleSetDefault = async (addressId: string) => {
    try {
      await setDefaultAddress(addressId);
      Alert.alert('Success', 'Default address updated!');
    } catch (error) {
      Alert.alert('Error', 'Failed to update default address. Please try again.');
    }
  };

  const confirmDelete = async () => {
    if (!addressToDelete) return;
    
    try {
      await deleteAddress(addressToDelete.id);
      setShowDeleteSheet(false);
      setAddressToDelete(null);
      Alert.alert('Success', 'Address deleted successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to delete address. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={[theme.colors.primary[600]]}
            tintColor={theme.colors.primary[600]}
          />
        }
      >
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Manage Addresses</Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => setShowAddModal(true)}
            >
              <Ionicons name="add" size={20} color="#ffffff" />
              <Text style={styles.addButtonText}>Add New</Text>
            </TouchableOpacity>
          </View>
          
          {loading && !refreshing && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary[600]} />
              <Text style={styles.loadingText}>Loading addresses...</Text>
            </View>
          )}
          
          {error && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle-outline" size={24} color="#ef4444" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
          
          {addresses.map((address) => (
            <View key={address.id} style={styles.addressCard}>
              <View style={styles.addressHeader}>
                <View style={styles.addressTypeContainer}>
                  <Text style={styles.addressType}>{address.type.toUpperCase()}</Text>
                  {address.isDefault && (
                    <Text style={styles.defaultBadge}>DEFAULT</Text>
                  )}
                </View>
                <View style={styles.addressActions}>
                  <TouchableOpacity 
                    style={styles.editButton}
                    onPress={() => handleEditAddress(address)}
                  >
                    <Ionicons name="pencil-outline" size={18} color="#6b7280" />
                  </TouchableOpacity>
                  {!address.isDefault && (
                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={() => handleSetDefault(address.id)}
                    >
                      <Text style={styles.setDefaultText}>Set Default</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity 
                    style={styles.deleteButton}
                    onPress={() => handleDeleteAddress(address.id, address.type)}
                  >
                    <Ionicons name="trash" size={16} color="#6b7280" />
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={styles.addressText}>
                {address.street}
              </Text>
              <Text style={styles.addressText}>
                {address.city}, {address.state} {address.zipCode}
              </Text>
              <Text style={styles.addressCountry}>{address.country}</Text>
            </View>
          ))}

          {(!addresses || addresses.length === 0) && !loading && (
            <View style={styles.emptyState}>
              <Ionicons name="location-outline" size={64} color="#9ca3af" />
              <Text style={styles.emptyStateText}>{message || 'No addresses added yet'}</Text>
              <TouchableOpacity 
                style={styles.startShoppingButton}
                onPress={() => setShowAddModal(true)}
              >
                <Text style={styles.startShoppingText}>Add First Address</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add Address Modal */}
              <AddAddressModal
          visible={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSuccess={handleAddAddress}
          mode="add"
        />

      {/* Edit Address Modal */}
      <AddAddressModal
        visible={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSuccess={handleUpdateAddress}
        mode="edit"
        editingAddress={editingAddress}
      />

      {/* Delete Address Confirmation Sheet */}
      <Modal
        visible={showDeleteSheet}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowDeleteSheet(false);
          setAddressToDelete(null);
        }}
      >
        <TouchableOpacity 
          style={styles.deleteSheetOverlay}
          activeOpacity={1}
          onPress={() => {
            setShowDeleteSheet(false);
            setAddressToDelete(null);
          }}
        >
          <View style={styles.deleteSheetContainer}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => {
                setShowDeleteSheet(false);
                setAddressToDelete(null);
              }}
            >
              <Ionicons name="close" size={20} color="#6b7280" />
            </TouchableOpacity>
            
            <View style={styles.deleteSheetContent}>
              <View style={styles.deleteIconContainer}>
                <View style={styles.deleteIconWrapper}>
                  <Ionicons name="trash-outline" size={32} color="#ef4444" />
                </View>
              </View>
              
              <Text style={styles.deleteSheetMainText}>
                Delete Address
              </Text>
              
              <Text style={styles.deleteSheetSubText}>
                This action cannot be undone. The address will be permanently removed from your account.
              </Text>
              
              {addressToDelete && (
                <View style={styles.addressPreview}>
                  <View style={styles.addressPreviewHeader}>
                    <Text style={styles.addressPreviewType}>{addressToDelete.type.toUpperCase()}</Text>
                  </View>
                  <Text style={styles.addressPreviewText}>{addressToDelete.street}</Text>
                </View>
              )}
              
              <View style={styles.deleteSheetButtonRow}>
                <Button
                  title="Cancel"
                  onPress={() => {
                    setShowDeleteSheet(false);
                    setAddressToDelete(null);
                  }}
                  variant="outline"
                  size="lg"
                  style={styles.cancelButton}
                />
                <Button
                  title="Delete"
                  onPress={confirmDelete}
                  variant="error"
                  size="lg"
                  style={styles.deleteConfirmButton}
                />
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: '#ffffff',
    padding: 20,
    marginTop: 16,
    marginBottom: 12,
    marginHorizontal: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#374151',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary[600],
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    shadowColor: theme.colors.primary[600],
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3.84,
    elevation: 5,
  },
  addButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 13,
    marginLeft: 4,
  },
  addressCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addressTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  addressType: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
    marginRight: 8,
  },
  defaultBadge: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10b981',
    backgroundColor: '#d1fae5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  addressActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editButton: {
    padding: 6,
    minWidth: 32,
    minHeight: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderRadius: 4,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: theme.colors.primary[50],
    borderRadius: 8,
  },
  setDefaultText: {
    fontSize: 12,
    color: theme.colors.primary[700],
    fontWeight: '600',
  },
  deleteButton: {
    padding: 6,
    minWidth: 32,
    minHeight: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderRadius: 4,
  },
  addressText: {
    fontSize: 15,
    color: '#4b5563',
    marginBottom: 6,
    lineHeight: 20,
  },
  addressCountry: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  cancelText: {
    fontSize: 16,
    color: theme.colors.primary[600],
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  placeholder: {
    width: 50,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  formSection: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
    alignItems: 'center',
  },
  typeButtonActive: {
    borderColor: theme.colors.primary[600],
    backgroundColor: theme.colors.primary[50],
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  typeButtonTextActive: {
    color: theme.colors.primary[700],
    fontWeight: '600',
  },
  input: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
  },
  defaultCheckbox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: theme.colors.primary[600],
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#374151',
  },
  buttonContainer: {
    marginTop: 16,
  },
  addAddressButton: {
    backgroundColor: theme.colors.primary[600],
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  deleteSheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteSheetContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 24,
    minWidth: 300,
    maxWidth: 400,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
    zIndex: 1,
  },
  deleteSheetContent: {
    alignItems: 'center',
  },
  deleteIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fef2f2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  deleteIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fecaca',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteSheetMainText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
    textAlign: 'center',
  },
  deleteSheetSubText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  addressPreview: {
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
    width: '100%',
  },
  addressPreviewHeader: {
    marginBottom: 4,
  },
  addressPreviewType: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  addressPreviewText: {
    fontSize: 14,
    color: '#6b7280',
  },
  deleteSheetButtonRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancelButton: {
    flex: 1,
  },
  deleteConfirmButton: {
    flex: 1,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    color: '#ef4444',
    marginLeft: 8,
    flex: 1,
  },
  startShoppingButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    marginTop: 16,
  },
  startShoppingText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
}); 