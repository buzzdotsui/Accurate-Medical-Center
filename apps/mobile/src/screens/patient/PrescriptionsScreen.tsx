import React, { useEffect } from 'react';
import { View, Text, ScrollView, RefreshControl, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { usePatientStore } from '../../store/patientStore';
import { 
  styles, 
  Card, 
  LoadingSpinner, 
  EmptyState, 
  Divider,
  formatDate 
} from '../../components/common';
import { Prescription } from '../../types';

export const PatientPrescriptionsScreen = () => {
  const { 
    prescriptions, 
    fetchPrescriptions, 
    isLoading, 
    error 
  } = usePatientStore();

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
            Prescription {item.prescriptionId}
          </Text>
          <Text style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>
            Dr. {item.doctor?.user?.name || 'Doctor'}
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

      <View style={{ marginBottom: 8 }}>
        <Text style={{ fontSize: 12, color: '#64748b' }}>Prescribed on</Text>
        <Text style={{ fontSize: 14, fontWeight: '500', color: '#1e293b' }}>
          {formatDate(item.createdAt)}
        </Text>
      </View>

      {item.notes && (
        <View style={{ marginBottom: 8 }}>
          <Text style={{ fontSize: 12, color: '#64748b' }}>Notes</Text>
          <Text style={{ fontSize: 14, color: '#1e293b' }}>{item.notes}</Text>
        </View>
      )}

      <Text style={{ fontSize: 13, fontWeight: '600', color: '#1e293b', marginBottom: 8 }}>
        Medications ({item.items.length})
      </Text>
      {item.items.map((med, i) => (
        <View key={i} style={{ marginBottom: 8, padding: 12, backgroundColor: '#f8fafc', borderRadius: 8 }}>
          <Text style={{ fontSize: 14, fontWeight: '500', color: '#1e293b' }}>
            {med.medicine.name} {med.medicine.genericName ? `(${med.medicine.genericName})` : ''}
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 4 }}>
            <Text style={{ fontSize: 12, color: '#64748b' }}>
              {med.dosage} • {med.frequency}
            </Text>
            <Text style={{ fontSize: 12, color: '#64748b' }}>
              {med.duration}
            </Text>
            <Text style={{ fontSize: 12, color: '#64748b' }}>
              Qty: {med.quantity} {med.medicine.unit}
            </Text>
            {med.dispensedQty > 0 && (
              <Text style={{ fontSize: 12, color: '#166534', fontWeight: '500' }}>
                Dispensed: {med.dispensedQty}/{med.quantity}
              </Text>
            )}
          </View>
          {med.instructions && (
            <Text style={{ fontSize: 12, color: '#64748b', marginTop: 4, fontStyle: 'italic' }}>
              {med.instructions}
            </Text>
          )}
        </View>
      ))}

      <Divider />
      <Text style={{ fontSize: 12, color: '#64748b' }}>Prescription ID: {item.prescriptionId}</Text>
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
        <Text style={styles.headerSubtitle}>Your medication prescriptions</Text>
      </View>

      <View style={styles.content}>
        {prescriptions.length === 0 ? (
          <EmptyState
            title="No Prescriptions"
            message="Your prescriptions will appear here after a consultation."
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

export default PatientPrescriptionsScreen;