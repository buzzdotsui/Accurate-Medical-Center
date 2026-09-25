import React, { useEffect } from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../store/authStore';
import { useDoctorStore } from '../../store/doctorStore';
import { 
  styles, 
  Card, 
  StatRow, 
  Button, 
  LoadingSpinner,
  getInitials 
} from '../../components/common';

export const DoctorDashboardScreen = () => {
  const navigation = useNavigation();
  const { user, restoreSession } = useAuthStore();
  const { 
    stats, 
    fetchStats, 
    fetchQueue,
    isLoading, 
    error 
  } = useDoctorStore();

  useEffect(() => {
    restoreSession();
    fetchStats();
    fetchQueue();
  }, [restoreSession, fetchStats, fetchQueue]);

  const onRefresh = () => {
    fetchStats();
    fetchQueue();
  };

  if (isLoading && !stats) {
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
            <Text style={styles.headerTitle}>Dr. Dashboard</Text>
            <Text style={styles.headerSubtitle}>{user?.name || 'Doctor'}</Text>
          </View>
          <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: '#0f766e', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>
              {getInitials(user?.name || 'DR')}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.content}>
        <Card>
          <Text style={styles.cardTitle}>Today&apos;s Overview</Text>
          <StatRow label="Scheduled Appointments" value={stats?.todayAppointments ?? 0} />
          <StatRow label="My Patients" value={stats?.myPatientsCount ?? 0} />
          <StatRow label="Consultations Completed" value={stats?.consultationsDone ?? 0} />
        </Card>

        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
          <Button 
            title="View Patient Queue" 
            onPress={() => navigation.navigate('DoctorQueue')}
            style={{ flex: 1 }}
          />
          <Button 
            title="My Patients" 
            onPress={() => navigation.navigate('DoctorPatients')}
            variant="outline"
            style={{ flex: 1 }}
          />
        </View>

        <View style={{ marginBottom: 16 }}>
          <Button 
            title="Prescriptions" 
            onPress={() => navigation.navigate('DoctorPrescriptions')}
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
              title="Patient Queue" 
              onPress={() => navigation.navigate('DoctorQueue')}
              variant="outline"
              style={{ flex: 1, minWidth: 150 }}
            />
            <Button 
              title="My Patients" 
              onPress={() => navigation.navigate('DoctorPatients')}
              variant="outline"
              style={{ flex: 1, minWidth: 150 }}
            />
            <Button 
              title="Prescriptions" 
              onPress={() => navigation.navigate('DoctorPrescriptions')}
              variant="outline"
              style={{ flex: 1, minWidth: 150 }}
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default DoctorDashboardScreen;