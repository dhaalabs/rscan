import React, { useState } from 'react';
import { View, Text, StyleSheet, Platform, Image } from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { createWorker } from 'tesseract.js';
import { Button } from '../../components/Button';
import { parseReceiptText } from '../../utils/receiptParser';
import { supabase } from '../../utils/supabase';
import { Ionicons } from '@expo/vector-icons';

export default function ScanScreen() {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestGalleryPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      setError('Gallery permission is required to select photos');
      return false;
    }
    return true;
  };

  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      setError('Camera permission is required to take photos');
      return false;
    }
    return true;
  };

  const takePhoto = async () => {
    try {
      const hasPermission = await requestCameraPermission();
      if (!hasPermission) return;

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
        processReceipt(result.assets[0].uri);
      }
    } catch (err) {
      setError('Failed to take photo');
    }
  };

  const pickImage = async () => {
    try {
      const hasPermission = await requestGalleryPermission();
      if (!hasPermission) return;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
        processReceipt(result.assets[0].uri);
      }
    } catch (err) {
      setError('Failed to pick image');
    }
  };

  const processReceipt = async (imageUri: string) => {
    setLoading(true);
    setError(null);

    try {
      const worker = await createWorker('eng');
      const { data: { text } } = await worker.recognize(imageUri);
      await worker.terminate();

      const receiptData = parseReceiptText(text);

      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('Not authenticated');

      // Insert the receipt
      const { data: receipt, error: receiptError } = await supabase
        .from('receipts')
        .insert({
          user_id: user.id,
          date: receiptData.date,
          total: receiptData.total,
          merchant: receiptData.merchant,
        })
        .select()
        .single();

      if (receiptError) throw receiptError;

      // Insert the receipt items
      if (receiptData.items.length > 0) {
        const { error: itemsError } = await supabase
          .from('receipt_items')
          .insert(
            receiptData.items.map(item => ({
              receipt_id: receipt.id,
              name: item.name,
              price: item.price,
            }))
          );

        if (itemsError) throw itemsError;
      }

      // Navigate to history screen
      router.push('/history');
    } catch (err) {
      setError('Failed to process receipt');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Scan Receipt</Text>
        <Text style={styles.subtitle}>Upload a receipt to extract data</Text>
      </View>

      <View style={styles.imageContainer}>
        {image ? (
          <Image source={{ uri: image }} style={styles.image} />
        ) : (
          <View style={styles.placeholder}>
            <Ionicons name="receipt-outline" size={64} color="#8E8E93" />
            <Text style={styles.placeholderText}>No receipt selected</Text>
          </View>
        )}
      </View>

      {error && (
        <Text style={styles.error}>{error}</Text>
      )}

      <View style={styles.buttonContainer}>
        <Button
          onPress={pickImage}
          loading={loading}
          style={styles.button}
          icon="image"
          mode="contained">
          Select Receipt
        </Button>

        {Platform.OS !== 'web' && (
          <Button
            onPress={takePhoto}
            loading={loading}
            style={styles.button}
            icon="camera"
            mode="contained">
            Take Photo
          </Button>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 4,
  },
  imageContainer: {
    margin: 20,
    height: 300,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  placeholder: {
    alignItems: 'center',
  },
  placeholderText: {
    marginTop: 12,
    fontSize: 16,
    color: '#8E8E93',
  },
  buttonContainer: {
    padding: 20,
  },
  button: {
    marginBottom: 12,
  },
  error: {
    color: '#FF3B30',
    textAlign: 'center',
    marginTop: 8,
  },
});