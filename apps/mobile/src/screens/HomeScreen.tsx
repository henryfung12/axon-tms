import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuthStore } from '../stores/auth.store';
import { api } from '../lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DocumentUploadScreen } from './DocumentUploadScreen';

const STATUS_LABELS: Record<string, string> = {
  ASSIGNED:   'Assigned',
  IN_TRANSIT: 'In transit',
  DELIVERED:  'Delivered',
  PENDING:    'Pending',
};

const STATUS_COLORS: Record<string, string> = {
  ASSIGNED:   '#7c3aed',
  IN_TRANSIT: '#2563eb',
  DELIVERED:  '#16a34a',
  PENDING:    '#d97706',
};

const NEXT_STATUS: Record<string, string> = {
  ASSIGNED:   'IN_TRANSIT',
  IN_TRANSIT: 'DELIVERED',
};

const NEXT_STATUS_LABEL: Record<string, string> = {
  ASSIGNED:   'Confirm pickup',
  IN_TRANSIT: 'Confirm delivery',
};

export function HomeScreen() {
  const { user, clearAuth } = useAuthStore();
  const [uploadingLoad, setUploadingLoad] = useState<{ id: string; loadNumber: string } | null>(null);
  const queryClient = useQueryClient();

  const { data: loads, isLoading } = useQuery({
    queryKey: ['my-loads'],
    queryFn: async () => {
      const { data } = await api.get('/loads');
      return data.filter((load: any) =>
        load.driverId != null && load.driver != null
      );
    },
  });

  const statusMutation = useMutation({
    mutationFn: async ({ loadId, status }: { loadId: string; status: string }) => {
      const { data } = await api.patch(`/loads/${loadId}/status`, { status });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-loads'] });
    },
    onError: () => {
      Alert.alert('Error', 'Failed to update load status. Please try again.');
    },
  });

  const handleStatusUpdate = (loadId: string, loadNumber: string, nextStatus: string, label: string) => {
    Alert.alert(
      label,
      `Are you sure you want to ${label.toLowerCase()} for load ${loadNumber}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => statusMutation.mutate({ loadId, status: nextStatus }),
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: clearAuth },
    ]);
  };

  if (uploadingLoad) {
    return (
      <DocumentUploadScreen
        loadId={uploadingLoad.id}
        loadNumber={uploadingLoad.loadNumber}
        onBack={() => setUploadingLoad(null)}
      />
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user?.firstName}</Text>
          <Text style={styles.role}>Driver</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Sign out</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>My loads</Text>

      {isLoading && (
        <ActivityIndicator style={{ marginTop: 40 }} color="#2563eb" />
      )}

      {!isLoading && (!loads || loads.length === 0) && (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No loads assigned yet.</Text>
          <Text style={styles.emptySubtext}>Your dispatcher will assign you a load soon.</Text>
        </View>
      )}{loads?.map((load: any) => {
        const nextStatus = NEXT_STATUS[load.status];
        const nextLabel = NEXT_STATUS_LABEL[load.status];
        const statusColor = STATUS_COLORS[load.status] || '#6b7280';

        return (
          <View key={load.id} style={styles.loadCard}>
            <View style={styles.loadHeader}>
              <Text style={styles.loadNumber}>{load.loadNumber}</Text>
              <View style={[styles.badge, { backgroundColor: statusColor + '20' }]}>
                <Text style={[styles.badgeText, { color: statusColor }]}>
                  {STATUS_LABELS[load.status] || load.status}
                </Text>
              </View>
            </View>

            <Text style={styles.customer}>{load.customer?.name}</Text>

            <View style={styles.stopRow}>
              <View style={styles.stopDot} />
              <View style={styles.stopInfo}>
                <Text style={styles.stopType}>Pickup</Text>
                <Text style={styles.stopAddress}>{load.stops?.[0]?.facilityName}</Text>
                <Text style={styles.stopCity}>{load.stops?.[0]?.city}, {load.stops?.[0]?.state}</Text>
                {load.stops?.[0]?.scheduledAt && (
                  <Text style={styles.stopDate}>
                    {new Date(load.stops[0].scheduledAt).toLocaleDateString()}
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.stopLine} />

            <View style={styles.stopRow}>
              <View style={[styles.stopDot, styles.stopDotDelivery]} />
              <View style={styles.stopInfo}>
                <Text style={styles.stopType}>Delivery</Text>
                <Text style={styles.stopAddress}>{load.stops?.[load.stops.length - 1]?.facilityName}</Text>
                <Text style={styles.stopCity}>{load.stops?.[load.stops.length - 1]?.city}, {load.stops?.[load.stops.length - 1]?.state}</Text>
                {load.stops?.[load.stops.length - 1]?.scheduledAt && (
                  <Text style={styles.stopDate}>
                    {new Date(load.stops[load.stops.length - 1].scheduledAt).toLocaleDateString()}
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.loadFooter}>
              <Text style={styles.rate}>${load.totalRate?.toLocaleString()}</Text>
              <View style={styles.footerButtons}>
                <TouchableOpacity
                  style={styles.docsBtn}
                  onPress={() => setUploadingLoad({ id: load.id, loadNumber: load.loadNumber })}
                >
                  <Text style={styles.docsBtnText}>Documents</Text>
                </TouchableOpacity>
                {nextStatus && (
                  <TouchableOpacity
                    style={[styles.actionBtn, statusMutation.isPending && styles.actionBtnDisabled]}
                    onPress={() => handleStatusUpdate(load.id, load.loadNumber, nextStatus, nextLabel)}
                    disabled={statusMutation.isPending}
                  >
                    <Text style={styles.actionBtnText}>{nextLabel}</Text>
                  </TouchableOpacity>
                )}
                {load.status === 'DELIVERED' && (
                  <View style={styles.deliveredTag}>
                    <Text style={styles.deliveredText}>Complete</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 60, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  greeting: { fontSize: 20, fontWeight: '700', color: '#111827' },
  role: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  logoutBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: '#e5e7eb' },
  logoutText: { fontSize: 13, color: '#6b7280' },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#111827', padding: 20, paddingBottom: 12 },
  emptyCard: { margin: 20, backgroundColor: '#fff', borderRadius: 12, padding: 24, alignItems: 'center' },
  emptyText: { fontSize: 14, color: '#6b7280', textAlign: 'center' },
  emptySubtext: { fontSize: 13, color: '#9ca3af', marginTop: 4, textAlign: 'center' },
  loadCard: { marginHorizontal: 16, marginBottom: 12, backgroundColor: '#fff', borderRadius: 12, padding: 16, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 1 },
  loadHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  loadNumber: { fontSize: 15, fontWeight: '700', color: '#2563eb' },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  customer: { fontSize: 13, color: '#6b7280', marginBottom: 16 },
  stopRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  stopDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#2563eb', marginTop: 3 },
  stopDotDelivery: { backgroundColor: '#16a34a' },
  stopLine: { width: 1, height: 16, backgroundColor: '#e5e7eb', marginLeft: 4, marginVertical: 4 },
  stopInfo: { flex: 1, marginBottom: 4 },
  stopType: { fontSize: 11, fontWeight: '600', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.5 },
  stopAddress: { fontSize: 13, fontWeight: '500', color: '#111827', marginTop: 1 },
  stopCity: { fontSize: 12, color: '#6b7280', marginTop: 1 },
  stopDate: { fontSize: 11, color: '#9ca3af', marginTop: 2 },
  loadFooter: { marginTop: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f3f4f6' },
  rate: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 10 },
  footerButtons: { flexDirection: 'row', gap: 8 },
  docsBtn: { flex: 1, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, paddingVertical: 8, alignItems: 'center' },
  docsBtnText: { fontSize: 13, color: '#374151', fontWeight: '500' },
  actionBtn: { flex: 1, backgroundColor: '#2563eb', paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  actionBtnDisabled: { opacity: 0.6 },
  actionBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  deliveredTag: { flex: 1, backgroundColor: '#dcfce7', paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  deliveredText: { color: '#16a34a', fontSize: 13, fontWeight: '600' },
});