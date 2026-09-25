import React, { useEffect } from 'react';
import { View, Text, ScrollView, RefreshControl, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDoctorStore } from '../../store/doctorStore';
import { 
  styles, 
  Card, 
  LoadingSpinner, 
  EmptyState, 
  Divider,
  AppointmentStatusBadge,
  formatDateTime,
  Button
} from '../../components/common';
import { DoctorQueueItem } from '../../types';

export const DoctorQueueScreen = () => {
  const navigation = useNavigation();
  const { 
    queue, 
    fetchQueue, 
    isLoading, 
    error 
  } = useDoctorStore();

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  const onRefresh = () => fetchQueue();

  const renderQueueItem = ({ item }: { item: DoctorQueueItem }) => (
    <Card style={{ marginBottom: 12 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#1e293b' }}>
            {item.patient.firstName} {item.patient.lastName}
          </Text>
          <Text style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>
            Patient ID: {item.patient.patientId}
          </Text>
        </View>
        <AppointmentStatusBadge status={item.status} />
      </View>

      <View style={{ flexDirection: 'row', gap: 16, marginBottom: 8 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 12, color: '#64748b' }}>Appointment Time</Text>
          <Text style={{ fontSize: 14, fontWeight: '500', color: '#1e293b' }}>
            {formatDateTime(item.appointmentId)} {/* This would be the appointment date/time */}
          </Text>
        </View>
      </View>

      <Divider />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ fontSize: 13, color: '#64748b' }}>
          Appt: {item.appointmentId}
        </Text>
        {item.status === 'SCHEDULED' || item.status === 'ARRIVED' ? (
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {item.status === 'SCHEDULED' && (
              <Button 
                title="Patient Arrived" 
                onPress={() => console.log('Mark arrived', item.appointmentId)}
                variant="outline"
                style={{ paddingHorizontal: 12, paddingVertical: 6 }}
              />
            )}
            <Button 
              title="Start Consultation" 
              onPress={() => navigation.navigate('Consultation', { visitId: item.id })}
              style={{ paddingHorizontal: 12, paddingVertical: 6 }}
            />
          </View>
        ) : (
          <Button 
            title="View Details" 
            onPress={() => navigation.navigate('Consultation', { visitId: item.id })}
            variant="outline"
            style={{ paddingHorizontal: 12, paddingVertical: 6 }}
          />
        )}
      </View>
    </Card>
  );

  if (isLoading && queue.length === 0) {
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
        <Text style={styles.headerTitle}>Patient Queue</Text>
        <Text style={styles.headerSubtitle}>Today&apos;s scheduled patients</Text>
      </View>

      <View style={styles.content}>
        {queue.length === 0 ? (
          <EmptyState
            title="No Patients in Queue"
            message="Your scheduled patients will appear here."
          />
        ) : (
          <FlatList
            data={queue}
            renderItem={renderQueueItem}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={
              <EmptyState
                title="No Patients in Queue"
                message="Your scheduled patients will appear here."
              />
            }
          />
        )}
      </View>
    </ScrollView>
  );
};

export default DoctorQueueScreen;