import React, { useEffect } from 'react';
import { View, Text, ScrollView, RefreshControl, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { usePatientStore } from '../../store/patientStore';
import { 
  styles, 
  Card, 
  Button, 
  LoadingSpinner, 
  EmptyState, 
  ListItem, 
  AppointmentStatusBadge,
  formatDateTime,
  Divider 
} from '../../components/common';
import { Appointment } from '../../types';

export const PatientAppointmentsScreen = () => {
  const navigation = useNavigation();
  const { 
    appointments, 
    fetchAppointments, 
    isLoading, 
    error 
  } = usePatientStore();

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const onRefresh = () => fetchAppointments();

  const renderAppointment = ({ item }: { item: Appointment }) => (
    <Card style={{ marginBottom: 12 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#1e293b' }}>
            Dr. {item.doctor?.user?.name || 'Assigned Doctor'}
          </Text>
          {item.doctor?.specialization && (
            <Text style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>
              {item.doctor.specialization}
            </Text>
          )}
        </View>
        <AppointmentStatusBadge status={item.status} />
      </View>
      
      <View style={{ flexDirection: 'row', gap: 16, marginBottom: 8 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 12, color: '#64748b' }}>Date & Time</Text>
          <Text style={{ fontSize: 14, fontWeight: '500', color: '#1e293b' }}>
            {formatDateTime(item.date)}
            {item.timeSlot && ` • ${item.timeSlot}`}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 12, color: '#64748b' }}>Type</Text>
          <Text style={{ fontSize: 14, fontWeight: '500', color: '#1e293b' }}>
            {item.type.replace('_', ' ')}
          </Text>
        </View>
      </View>

      {item.reason && (
        <View style={{ marginBottom: 8 }}>
          <Text style={{ fontSize: 12, color: '#64748b' }}>Reason</Text>
          <Text style={{ fontSize: 14, color: '#1e293b' }}>{item.reason}</Text>
        </View>
      )}

      <Divider />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ fontSize: 13, color: '#64748b' }}>Appointment ID: {item.appointmentId}</Text>
        {item.status === 'SCHEDULED' && (
          <Button 
            title="View Details" 
            onPress={() => navigation.navigate('AppointmentDetail', { appointment: item })}
            variant="outline"
            style={{ paddingHorizontal: 16, paddingVertical: 6 }}
          />
        )}
      </View>
    </Card>
  );

  if (isLoading && appointments.length === 0) {
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
        <Text style={styles.headerTitle}>My Appointments</Text>
        <Text style={styles.headerSubtitle}>View and manage your appointments</Text>
      </View>

      <View style={styles.content}>
        <Button 
          title="Book New Appointment" 
          onPress={() => navigation.navigate('BookAppointment')}
          style={{ marginBottom: 16 }}
        />

        {appointments.length === 0 ? (
          <EmptyState
            title="No Appointments"
            message="You don't have any appointments scheduled. Book your first appointment to get started."
            actionLabel="Book Appointment"
            onAction={() => navigation.navigate('BookAppointment')}
          />
        ) : (
          <FlatList
            data={appointments}
            renderItem={renderAppointment}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={
              <EmptyState
                title="No Appointments"
                message="You don't have any appointments scheduled."
                actionLabel="Book Appointment"
                onAction={() => navigation.navigate('BookAppointment')}
              />
            }
          />
        )}
      </View>
    </ScrollView>
  );
};

export default PatientAppointmentsScreen;