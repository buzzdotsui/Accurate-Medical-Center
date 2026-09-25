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
import { LabRequest } from '../../types';

export const PatientLabResultsScreen = () => {
  const { 
    labResults, 
    fetchLabResults, 
    isLoading, 
    error 
  } = usePatientStore();

  useEffect(() => {
    fetchLabResults();
  }, [fetchLabResults]);

  const onRefresh = () => fetchLabResults();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return '#166534';
      case 'ANALYZING': return '#92400e';
      case 'SAMPLED': return '#1e40af';
      case 'REQUESTED': return '#7c2d12';
      default: return '#64748b';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'COMPLETED': return '#dcfce7';
      case 'ANALYZING': return '#fef3c7';
      case 'SAMPLED': return '#dbeafe';
      case 'REQUESTED': return '#fed7aa';
      default: return '#f1f5f9';
    }
  };

  const renderLabResult = ({ item }: { item: LabRequest }) => (
    <Card style={{ marginBottom: 12 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#1e293b' }}>
            {item.testName}
          </Text>
          {item.category && (
            <Text style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>
              {item.category.name}
            </Text>
          )}
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
          <Text style={{ fontSize: 12, color: '#64748b' }}>Priority</Text>
          <Text style={{ fontSize: 14, fontWeight: '500', color: '#1e293b' }}>
            {item.priority}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 12, color: '#64748b' }}>Requested</Text>
          <Text style={{ fontSize: 14, fontWeight: '500', color: '#1e293b' }}>
            {formatDate(item.createdAt)}
          </Text>
        </View>
      </View>

      {item.result && (
        <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#e2e8f0' }}>
          <Text style={{ fontSize: 13, fontWeight: '600', color: '#1e293b', marginBottom: 4 }}>
            Results Available
          </Text>
          <Text style={{ fontSize: 13, color: '#475569', marginBottom: 8 }}>
            {item.result.findings}
          </Text>
          {item.result.conclusion && (
            <Text style={{ fontSize: 13, color: '#475569', fontStyle: 'italic' }}>
              {item.result.conclusion}
            </Text>
          )}
          {item.result.referenceRange && (
            <Text style={{ fontSize: 12, color: '#64748b', marginTop: 8 }}>
              Reference Range: {item.result.referenceRange}
            </Text>
          )}
          {item.result.isAbnormal && (
            <View style={{ marginTop: 8, padding: 8, backgroundColor: '#fef2f2', borderRadius: 8, borderWidth: 1, borderColor: '#fecaca' }}>
              <Text style={{ fontSize: 12, color: '#991b1b', fontWeight: '500' }}>
                ⚠ Values outside normal range
              </Text>
            </View>
          )}
          {item.result.attachments && item.result.attachments.length > 0 && (
            <View style={{ marginTop: 8 }}>
              <Text style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Attachments:</Text>
              {item.result.attachments.map((att, i) => (
                <Text key={i} style={{ fontSize: 13, color: '#0f766e', marginTop: 2 }}>
                  📎 {att.fileName}
                </Text>
              ))}
            </View>
          )}
        </View>
      )}

      <Divider />
      <Text style={{ fontSize: 12, color: '#64748b' }}>Request ID: {item.requestId}</Text>
    </Card>
  );

  if (isLoading && labResults.length === 0) {
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
        <Text style={styles.headerTitle}>Lab Results</Text>
        <Text style={styles.headerSubtitle}>Your laboratory test results</Text>
      </View>

      <View style={styles.content}>
        {labResults.length === 0 ? (
          <EmptyState
            title="No Lab Results"
            message="Your lab test results will appear here once they are completed."
          />
        ) : (
          <FlatList
            data={labResults}
            renderItem={renderLabResult}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={
              <EmptyState
                title="No Lab Results"
                message="Your lab test results will appear here."
              />
            }
          />
        )}
      </View>
    </ScrollView>
  );
};

export default PatientLabResultsScreen;