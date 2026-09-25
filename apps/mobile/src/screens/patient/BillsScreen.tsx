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
  formatDate,
  formatCurrency 
} from '../../components/common';
import { Invoice } from '../../types';

export const PatientBillsScreen = () => {
  const { 
    invoices, 
    fetchInvoices, 
    isLoading, 
    error 
  } = usePatientStore();

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const onRefresh = () => fetchInvoices();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return '#166534';
      case 'PARTIAL': return '#92400e';
      case 'UNPAID': return '#991b1b';
      case 'VOID': return '#64748b';
      default: return '#64748b';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'PAID': return '#dcfce7';
      case 'PARTIAL': return '#fef3c7';
      case 'UNPAID': return '#fef2f2';
      case 'VOID': return '#f1f5f9';
      default: return '#f1f5f9';
    }
  };

  const renderInvoice = ({ item }: { item: Invoice }) => (
    <Card style={{ marginBottom: 12 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#1e293b' }}>
            Invoice {item.invoiceId}
          </Text>
          <Text style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>
            {item.branch?.name || 'Accurate Medical Center'}
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
          <Text style={{ fontSize: 12, color: '#64748b' }}>Date</Text>
          <Text style={{ fontSize: 14, fontWeight: '500', color: '#1e293b' }}>
            {formatDate(item.createdAt)}
          </Text>
        </View>
        {item.dueDate && (
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 12, color: '#64748b' }}>Due Date</Text>
            <Text style={{ fontSize: 14, fontWeight: '500', color: item.status === 'UNPAID' && new Date(item.dueDate) < new Date() ? '#ef4444' : '#1e293b' }}>
              {formatDate(item.dueDate)}
            </Text>
          </View>
        )}
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTopWidth: 1, borderTopColor: '#e2e8f0' }}>
        <View>
          <Text style={{ fontSize: 12, color: '#64748b' }}>Total Amount</Text>
          <Text style={{ fontSize: 20, fontWeight: '700', color: '#1e293b' }}>
            {formatCurrency(item.totalAmount)}
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ fontSize: 12, color: '#64748b' }}>Amount Paid</Text>
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#166534' }}>
            {formatCurrency(item.amountPaid)}
          </Text>
          {item.amountPaid < item.totalAmount && (
            <Text style={{ fontSize: 12, color: '#ef4444', marginTop: 2 }}>
              Balance: {formatCurrency(item.totalAmount - item.amountPaid)}
            </Text>
          )}
        </View>
      </View>

      <Divider />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ fontSize: 12, color: '#64748b' }}>Invoice ID: {item.invoiceId}</Text>
        {item.status !== 'PAID' && item.status !== 'VOID' && (
          <Text style={{ fontSize: 13, color: '#0f766e', fontWeight: '500' }}>
            Pay Now →
          </Text>
        )}
      </View>
    </Card>
  );

  if (isLoading && invoices.length === 0) {
    return <LoadingSpinner />;
  }

  // Calculate totals
  const totalOutstanding = invoices
    .filter(i => i.status !== 'PAID' && i.status !== 'VOID')
    .reduce((sum, i) => sum + (i.totalAmount - i.amountPaid), 0);

  const totalPaid = invoices
    .filter(i => i.status === 'PAID')
    .reduce((sum, i) => sum + i.amountPaid, 0);

  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
      }
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bills & Payments</Text>
        <Text style={styles.headerSubtitle}>Manage your invoices and payments</Text>
      </View>

      <View style={styles.content}>
        {/* Summary Cards */}
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
          <Card style={{ flex: 1, padding: 16 }}>
            <Text style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Outstanding</Text>
            <Text style={{ fontSize: 20, fontWeight: '700', color: '#ef4444' }}>
              {formatCurrency(totalOutstanding)}
            </Text>
          </Card>
          <Card style={{ flex: 1, padding: 16 }}>
            <Text style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Paid This Year</Text>
            <Text style={{ fontSize: 20, fontWeight: '700', color: '#166534' }}>
              {formatCurrency(totalPaid)}
            </Text>
          </Card>
        </View>

        {invoices.length === 0 ? (
          <EmptyState
            title="No Bills"
            message="You don't have any invoices at the moment."
          />
        ) : (
          <FlatList
            data={invoices}
            renderItem={renderInvoice}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={
              <EmptyState
                title="No Bills"
                message="You don't have any invoices at the moment."
              />
            }
          />
        )}
      </View>
    </ScrollView>
  );
};

export default PatientBillsScreen;