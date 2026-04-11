import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { api } from '../lib/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const DOC_TYPES = [
  { label: 'Bill of Lading (BOL)', value: 'BILL_OF_LADING' },
  { label: 'Proof of Delivery (POD)', value: 'PROOF_OF_DELIVERY' },
  { label: 'Lumper Receipt', value: 'LUMPER_RECEIPT' },
  { label: 'Scale Ticket', value: 'SCALE_TICKET' },
  { label: 'Fuel Receipt', value: 'FUEL_RECEIPT' },
  { label: 'Other', value: 'OTHER' },
];

interface Props {
  loadId: string;
  loadNumber: string;
  onBack: () => void;
}

export function DocumentUploadScreen({ loadId, loadNumber, onBack }: Props) {
  const [selectedType, setSelectedType] = useState('BILL_OF_LADING');
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();

  const { data: documents, isLoading } = useQuery({
    queryKey: ['documents', loadId],
    queryFn: async () => {
      const { data } = await api.get(`/documents/load/${loadId}`);
      return data;
    },
  });

  const uploadFile = async (uri: string, fileName: string, mimeType: string) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', {
        uri,
        name: fileName,
        type: mimeType,
      } as any);
      formData.append('loadId', loadId);
      formData.append('type', selectedType);

      await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      queryClient.invalidateQueries({ queryKey: ['documents', loadId] });
      Alert.alert('Success', 'Document uploaded successfully.');
    } catch (error) {
      Alert.alert('Error', 'Failed to upload document. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission required', 'Camera access is needed to take photos.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const fileName = `photo_${Date.now()}.jpg`;
      await uploadFile(asset.uri, fileName, 'image/jpeg');
    }
  };

  const handleFilePicker = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['image/*', 'application/pdf'],
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      await uploadFile(asset.uri, asset.name, asset.mimeType || 'application/octet-stream');
    }
  };

  const getDocTypeLabel = (type: string) => {
    return DOC_TYPES.find(d => d.value === type)?.label || type;
  };return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Documents</Text>
        <Text style={styles.subtitle}>{loadNumber}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Document type</Text>
        {DOC_TYPES.map((type) => (
          <TouchableOpacity
            key={type.value}
            style={[styles.typeBtn, selectedType === type.value && styles.typeBtnActive]}
            onPress={() => setSelectedType(type.value)}
          >
            <Text style={[styles.typeBtnText, selectedType === type.value && styles.typeBtnTextActive]}>
              {type.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Upload document</Text>
        <TouchableOpacity
          style={[styles.uploadBtn, uploading && styles.uploadBtnDisabled]}
          onPress={handleCamera}
          disabled={uploading}
        >
          <Text style={styles.uploadBtnText}>Take photo</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.uploadBtn, styles.uploadBtnSecondary, uploading && styles.uploadBtnDisabled]}
          onPress={handleFilePicker}
          disabled={uploading}
        >
          <Text style={[styles.uploadBtnText, styles.uploadBtnTextSecondary]}>Choose from files</Text>
        </TouchableOpacity>
        {uploading && (
          <ActivityIndicator style={{ marginTop: 16 }} color="#2563eb" />
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Uploaded documents</Text>
        {isLoading && <ActivityIndicator color="#2563eb" />}
        {!isLoading && (!documents || documents.length === 0) && (
          <Text style={styles.emptyText}>No documents uploaded yet.</Text>
        )}
        {documents?.map((doc: any) => (
          <View key={doc.id} style={styles.docCard}>
            <View style={styles.docIcon}>
              <Text style={styles.docIconText}>DOC</Text>
            </View>
            <View style={styles.docInfo}>
              <Text style={styles.docType}>{getDocTypeLabel(doc.type)}</Text>
              <Text style={styles.docName}>{doc.fileName}</Text>
              <Text style={styles.docDate}>
                {new Date(doc.uploadedAt).toLocaleDateString()}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { backgroundColor: '#fff', padding: 20, paddingTop: 60, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  backBtn: { marginBottom: 8 },
  backText: { fontSize: 14, color: '#2563eb', fontWeight: '500' },
  title: { fontSize: 20, fontWeight: '700', color: '#111827' },
  subtitle: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  section: { margin: 16, backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 0, marginTop: 12 },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: '#111827', marginBottom: 12 },
  typeBtn: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 8, borderWidth: 1, borderColor: '#e5e7eb', marginBottom: 8 },
  typeBtnActive: { backgroundColor: '#eff6ff', borderColor: '#2563eb' },
  typeBtnText: { fontSize: 14, color: '#6b7280' },
  typeBtnTextActive: { color: '#2563eb', fontWeight: '500' },
  uploadBtn: { backgroundColor: '#2563eb', borderRadius: 8, paddingVertical: 14, alignItems: 'center', marginBottom: 10 },
  uploadBtnSecondary: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb' },
  uploadBtnDisabled: { opacity: 0.6 },
  uploadBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  uploadBtnTextSecondary: { color: '#374151' },
  emptyText: { fontSize: 13, color: '#9ca3af', textAlign: 'center', paddingVertical: 12 },
  docCard: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  docIcon: { width: 40, height: 40, borderRadius: 8, backgroundColor: '#eff6ff', alignItems: 'center', justifyContent: 'center' },
  docIconText: { fontSize: 10, fontWeight: '700', color: '#2563eb' },
  docInfo: { flex: 1 },
  docType: { fontSize: 13, fontWeight: '600', color: '#111827' },
  docName: { fontSize: 12, color: '#6b7280', marginTop: 1 },
  docDate: { fontSize: 11, color: '#9ca3af', marginTop: 2 },
});