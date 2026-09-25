import React, { useEffect } from 'react';
import { View, Text, ScrollView, RefreshControl, FlatList, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDoctorStore } from '../../store/doctorStore';
import { 
  styles, 
  LoadingSpinner, 
  EmptyState, 
  ListItem,
  Divider
} from '../../components/common';
import { Patient } from '../../types';

export const DoctorPatientsScreen = () => {
  const navigation = useNavigation();
  const { 
    patients, 
    fetchPatients, 
    isLoading, 
    error 
  } = useDoctorStore();
  const [searchQuery, setSearchQuery] = React.useState('');

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const onRefresh = () => fetchPatients();

  const filteredPatients = patients.filter(p => 
    `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderPatient = ({ item }: { item: Patient }) => (
    <ListItem
      title={`${item.firstName} ${item.lastName}`}
      subtitle={`ID: ${item.patientId} • ${item.email || 'No email'} • ${item.phone || 'No phone'}`}
      rightElement={
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Text style={{ fontSize: 12, color: '#64748b' }}>
            {item.branch?.name || 'No branch'}
          </Text>
        </View>
      }
      onPress={() => navigation.navigate('PatientDetail', { patient: item })}
    />
  );

  if (isLoading && patients.length === 0) {
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
        <Text style={styles.headerTitle}>My Patients</Text>
        <Text style={styles.headerSubtitle}>Patients assigned to you</Text>
      </View>

      <View style={styles.content}>
        <View style={{ marginBottom: 16 }}>
          <TextInput
            placeholder="Search patients..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={[
              styles.input,
              { paddingHorizontal: 12, paddingVertical: 10 }
            ]}
          />
        </View>

        {filteredPatients.length === 0 ? (
          <EmptyState
            title={searchQuery ? "No Matching Patients" : "No Patients Assigned"}
            message={searchQuery ? "Try a different search term." : "Patients assigned to you will appear here."}
          />
        ) : (
          <FlatList
            data={filteredPatients}
            renderItem={renderPatient}
            keyExtractor={(item) => item.id}
            ItemSeparatorComponent={() => <Divider />}
            ListEmptyComponent={
              <EmptyState
                title="No Patients"
                message="No patients match your search."
              />
            }
          />
        )}
      </View>
    </ScrollView>
  );
};

export default DoctorPatientsScreen;