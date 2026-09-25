import React, { useEffect } from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../store/authStore';
import { usePatientStore } from '../../store/patientStore';
import { 
  styles, 
  Card, 
  StatRow, 
  Button, 
  LoadingSpinner,
  formatCurrency,
  getInitials 
} from '../../components/common';

export const PatientDashboardScreen = () => {
  const navigation = useNavigation();
  const { user, restoreSession } = useAuthStore();
  const { 
    dashboardStats, 
    fetchDashboardStats, 
    fetchAppointments,
    fetchInvoices,
    isLoading, 
    error 
  } = usePatientStore();

  useEffect(() => {
    restoreSession();
    fetchDashboardStats();
    fetchAppointments();
    fetchInvoices();
  }, [restoreSession, fetchDashboardStats, fetchAppointments, fetchInvoices]);

  const onRefresh = () => {
    fetchDashboardStats();
    fetchAppointments();
    fetchInvoices();
  };

  if (isLoading && !dashboardStats) {
    return <LoadingSpinner />;
  }

  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
      }
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View>
            <Text style={styles.headerTitle}>Welcome back</Text>
            <Text style={styles.headerSubtitle}>{user?.name || 'Patient'}</Text>
          </View>
          <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: '#0f766e', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>
              {getInitials(user?.name || 'PT')}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.content}>
        <Card>
          <Text style={styles.cardTitle}>Overview</Text>
          <StatRow label="Upcoming Appointments" value={dashboardStats?.appointmentCount ?? 0} />
          <StatRow label="Lab Results Available" value={dashboardStats?.labRequestCount ?? 0} />
          <StatRow label="Active Prescriptions" value={dashboardStats?.prescriptionCount ?? 0} />
          <StatRow 
            label="Outstanding Balance" 
            value={formatCurrency(dashboardStats?.pendingInvoiceTotal ?? 0)} 
            valueStyle={{ color: '#ef4444', fontWeight: '700' }} 
          />
        </Card>

        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
          <Button 
            title="Book Appointment" 
            onPress={() => navigation.navigate('BookAppointment')}
            style={{ flex: 1 }}
          />
          <Button 
            title="View Records" 
            onPress={() => navigation.navigate('MedicalRecords')}
            variant="outline"
            style={{ flex: 1 }}
          />
        </View>

        <View style={{ marginBottom: 16 }}>
          <Button 
            title="View Bills" 
            onPress={() => navigation.navigate('Bills')}
            variant="secondary"
            style={{ backgroundColor: '#fef3c7', borderColor: '#f59e0b' }}
          />
        </View>

        <View style={{ marginBottom: 16 }}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            <Button 
              title="My Appointments" 
              onPress={() => navigation.navigate('Appointments')}
              variant="outline"
              style={{ flex: 1, minWidth: 150 }}
            />
            <Button 
              title="Lab Results" 
              onPress={() => navigation.navigate('LabResults')}
              variant="outline"
              style={{ flex: 1, minWidth: 150 }}
            />
            <Button 
              title="Prescriptions" 
              onPress={() => navigation.navigate('Prescriptions')}
              variant="outline"
              style={{ flex: 1, minWidth: 150 }}
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default PatientDashboardScreen;