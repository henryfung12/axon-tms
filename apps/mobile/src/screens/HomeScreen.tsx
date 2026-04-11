import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useAuthStore } from '../stores/auth.store';
import { api } from '../lib/api';
import { useQuery } from '@tanstack/react-query';

export function HomeScreen() {
  const { user, clearAuth } = useAuthStore();

  const { data: loads, isLoading } = useQuery({
    queryKey: ['my-loads'],
    queryFn: async () => {
      const { data } = await api.get('/loads');
      return data.filter((load: any) =>
        load.driver?.user?.email === user?.email
      );
    },
  });

  const handleLogout = () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: clearAuth },
    ]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ASSIGNED': return '#7c3aed';
      case 'IN_TRANSIT': return '#2563eb';
      case 'DELIVERED': return '#16a34a';
      default: return '#d97706';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ASSIGNED': return 'Assigned';
      case 'IN_TRANSIT': return 'In transit';
      case 'DELIVERED': return 'Delivered';
      default: return status;
    }
  };

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
        <Text style={styles.emptyText}>Loading your loads...</Text>
      )}

      {!isLoading && (!loads || loads.length === 0) && (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No loads assigned yet.</Text>
          <Text style={styles.emptySubtext}>Your dispatcher will assign you a load soon.</Text>
        </View>
      )}

      {loads?.map((load: any) => (
        <View key={load.id} style={styles.loadCard}>
          <View style={styles.loadHeader}>
            <Text style={styles.loadNumber}>{load.loadNumber}</Text>
            <View style={[styles.badge, { backgroundColor: getStatusColor(load.status) + '20' }]}>
              <Text style={[styles.badgeText, { color: getStatusColor(load.status) }]}>
                {getStatusLabel(load.status)}
              </Text>
            </View>
          </View>

          <Text style={styles.customer}>{load.customer?.name}</Text>

          <View style={styles.stopRow}>
            <View style={styles.stopDot} />
            <View style={styles.stopInfo}>
              <Text style={styles.stopType}>Pickup</Text>
              <Text style={styles.stopAddress}>
                {load.stops?.[0]?.facilityName}
              </Text>
              <Text style={styles.stopCity}>
                {load.stops?.[0]?.city}, {load.stops?.[0]?.state}
              </Text>
            </View>
          </View>

          <View style={styles.stopLine} />

          <View style={styles.stopRow}>
            <View style={[styles.stopDot, styles.stopDotDelivery]} />
            <View style={styles.stopInfo}>
              <Text style={styles.stopType}>Delivery</Text>
              <Text style={styles.stopAddress}>
                {load.stops?.[load.stops.length - 1]?.facilityName}
              </Text>
              <Text style={styles.stopCity}>
                {load.stops?.[load.stops.length - 1]?.city}, {load.stops?.[load.stops.length - 1]?.state}
              </Text>
            </View>
          </View>

          <View style={styles.loadFooter}>
            <Text style={styles.rate}>${load.totalRate?.toLocaleString()}</Text>
          </View>
        </View>
      ))}
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
  emptyText: { fontSize: 14, color: '#6b7280', textAlign: 'center', padding: 20 },
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
  stopInfo: { flex: 1 },
  stopType: { fontSize: 11, fontWeight: '600', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.5 },
  stopAddress: { fontSize: 13, fontWeight: '500', color: '#111827', marginTop: 1 },
  stopCity: { fontSize: 12, color: '#6b7280', marginTop: 1 },
  loadFooter: { marginTop: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f3f4f6' },
  rate: { fontSize: 16, fontWeight: '700', color: '#111827' },
});