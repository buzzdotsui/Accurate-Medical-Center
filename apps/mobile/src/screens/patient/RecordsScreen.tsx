import React, { useEffect } from 'react';
import { View, Text, ScrollView, RefreshControl, FlatList } from 'react-native';
import { usePatientStore } from '../../store/patientStore';
import { 
  styles, 
  Card, 
  LoadingSpinner, 
  EmptyState, 
  Divider 
} from '../../components/common';
import { Visit, Diagnosis, Prescription } from '../../types';
import { formatDate, formatDateTime } from '../../components/common';

export const PatientRecordsScreen = () => {
  const { 
    records, 
    fetchRecords, 
    isLoading, 
    error 
  } = usePatientStore();

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const onRefresh = () => fetchRecords();

  const renderRecord = ({ item }: { item: Visit }) => (
    <Card style={{ marginBottom: 12 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <View>
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#1e293b' }}>
            Consultation Record
          </Text>
          <Text style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>
            {formatDateTime(item.startedAt)}
          </Text>
        </View>
        <View style={{ 
          paddingHorizontal: 8, 
          paddingVertical: 2, 
          borderRadius: 12, 
          backgroundColor: item.status === 'COMPLETED' ? '#dcfce7' : '#fef3c7' 
        }}>
          <Text style={{ 
            fontSize: 11, 
            fontWeight: '600', 
            color: item.status === 'COMPLETED' ? '#166534' : '#92400e' 
          }}>
            {item.status.replace('_', ' ')}
          </Text>
        </View>
      </View>

      {item.chiefComplaint && (
        <View style={{ marginBottom: 8 }}>
          <Text style={{ fontSize: 12, color: '#64748b' }}>Chief Complaint</Text>
          <Text style={{ fontSize: 14, color: '#1e293b' }}>{item.chiefComplaint}</Text>
        </View>
      )}

      {item.diagnoses && item.diagnoses.length > 0 && (
        <View style={{ marginBottom: 8 }}>
          <Text style={{ fontSize: 12, color: '#64748b' }}>Diagnoses</Text>
          {item.diagnoses.map((d: Diagnosis) => (
            <Text key={d.id} style={{ fontSize: 14, color: '#1e293b', marginTop: 2 }}>
              • {d.description} ({d.type})
            </Text>
          ))}
        </View>
      )}

      {item.prescriptions && item.prescriptions.length > 0 && (
        <View style={{ marginBottom: 8 }}>
          <Text style={{ fontSize: 12, color: '#64748b' }}>Prescriptions</Text>
          {item.prescriptions.map((p: Prescription) => (
            <Text key={p.id} style={{ fontSize: 14, color: '#1e293b', marginTop: 2 }}>
              • {p.prescriptionId} - {p.items.length} medication(s)
            </Text>
          ))}
        </View>
      )}

      {item.vitals && Object.keys(item.vitals).length > 0 && (
        <View style={{ marginBottom: 8 }}>
          <Text style={{ fontSize: 12, color: '#64748b' }}>Vitals</Text>
          <Text style={{ fontSize: 14, color: '#1e293b' }}>
            {Object.entries(item.vitals).map(([k, v]) => `${k}: ${v}`).join(', ')}
          </Text>
        </View>
      )}

      <Divider />
      <Text style={{ fontSize: 12, color: '#64748b' }}>Visit ID: {item.visitId}</Text>
    </Card>
  );

  if (isLoading && records.length === 0) {
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
        <Text style={styles.headerTitle}>Medical Records</Text>
        <Text style={styles.headerSubtitle}>Your consultation history</Text>
      </View>

      <View style={styles.content}>
        {records.length === 0 ? (
          <EmptyState
            title="No Medical Records"
            message="Your consultation records will appear here after you visit the clinic."
          />
        ) : (
          <FlatList
            data={records}
            renderItem={renderRecord}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={
              <EmptyState
                title="No Medical Records"
                message="Your consultation records will appear here."
              />
            }
          />
        )}
      </View>
    </ScrollView>
  );
};

export default PatientRecordsScreen;