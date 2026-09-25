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
  formatDate,
  Button
} from '../../components/common';
import { Prescription } from '../../types';

export const DoctorPrescriptionsScreen = () => {
  const navigation = useNavigation();
  const { 
    prescriptions, 
    fetchPrescriptions, 
    isLoading, 
    error 
  } = useDoctorStore();

  useEffect(() => {
    fetchPrescriptions();
  }, [fetchPrescriptions]);

  const onRefresh = () => fetchPrescriptions();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DISPENSED': return '#166534';
      case 'PARTIAL': return '#92400e';
      case 'PENDING': return '#1e40af';
      default: return '#64748b';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'DISPENSED': return '#dcfce7';
      case 'PARTIAL': return '#fef3c7';
      case 'PENDING': return '#dbeafe';
      default: return '#f1f5f9';
    }
  };

  const renderPrescription = ({ item }: { item: Prescription }) => (
    <Card style={{ marginBottom: 12 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#1e293b' }}>
            Rx {item.prescriptionId}
          </Text>
          <Text style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>
            Patient: {item.visit?.patient?.firstName} {item.visit?.patient?.lastName}
          </Text>
        </View>
        <View style={{ 
          paddingHorizontal: 8, 
          paddingVertical: 2, 
          borderRadius: 12, 
          backgroundColor: getStatusBg(item.status) 
        }}>
          <Text style={{ 
            fontSize: 11, 
            fontWeight: '600', 
            color: getStatusColor(item.status) 
          }}>
            {item.status}
          </Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: 16, marginBottom: 8 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 12, color: '#64748b' }}>Prescribed</Text>
          <Text style={{ fontSize: 14, fontWeight: '500', color: '#1e293b' }}>
            {formatDate(item.createdAt)}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 12, color: '#64748b' }}>Medications</Text>
          <Text style={{ fontSize: 14, fontWeight: '500', color: '#1e293b' }}>
            {item.items.length}
          </Text>
        </View>
      </View>

      <Text style={{ fontSize: 13, fontWeight: '600', color: '#1e293b', marginBottom: 8 }}>
        Medications
      </Text>
      {item.items.slice(0, 3).map((med, i) => (
        <View key={i} style={{ marginBottom: 4, padding: 8, backgroundColor: '#f8fafc', borderRadius: 6 }}>
          <Text style={{ fontSize: 13, fontWeight: '500', color: '#1e293b' }}>
            {med.medicine.name}
          </Text>
          <Text style={{ fontSize: 12, color: '#64748b' }}>
            {med.dosage} • {med.frequency} • {med.duration} • Qty: {med.quantity}
          </Text>
        </View>
      ))}
      {item.items.length > 3 && (
        <Text style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
          + {item.items.length - 3} more medication(s)
        </Text>
      )}

      <Divider />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ fontSize: 12, color: '#64748b' }}>Rx ID: {item.prescriptionId}</Text>
        <Button 
          title="View Details" 
          onPress={() => navigation.navigate('PrescriptionDetail', { prescription: item })}
          variant="outline"
          style={{ paddingHorizontal: 12, paddingVertical: 6 }}
        />
      </View>
    </Card>
  );

  if (isLoading && prescriptions.length === 0) {
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
        <Text style={styles.headerTitle}>Prescriptions</Text>
        <Text style={styles.headerSubtitle}>Prescriptions you have created</Text>
      </View>

      <View style={styles.content}>
        {prescriptions.length === 0 ? (
          <EmptyState
            title="No Prescriptions"
            message="Your prescriptions will appear here after consultations."
          />
        ) : (
          <FlatList
            data={prescriptions}
            renderItem={renderPrescription}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={
              <EmptyState
                title="No Prescriptions"
                message="Your prescriptions will appear here."
              />
            }
          />
        )}
      </View>
    </ScrollView>
  );
};

export default DoctorPrescriptionsScreen;