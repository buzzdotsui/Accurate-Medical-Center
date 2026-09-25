import React, { ViewStyle } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, TextInput } from 'react-native';
import { format } from 'date-fns';

const COLORS = {
  primary: '#0f766e',
  primaryLight: '#14b8a6',
  background: '#f8fafc',
  surface: '#ffffff',
  text: '#1e293b',
  textSecondary: '#64748b',
  border: '#e2e8f0',
  error: '#ef4444',
  success: '#22c55e',
  warning: '#f59e0b',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.primary,
    borderBottomLeftRadius: BORDER_RADIUS.lg,
    borderBottomRightRadius: BORDER_RADIUS.lg,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  statLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  buttonOutlineText: {
    color: COLORS.primary,
  },
  buttonDisabled: {
    backgroundColor: COLORS.border,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: 16,
    color: COLORS.text,
    backgroundColor: COLORS.surface,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    marginTop: SPACING.xs,
  },
  listItem: {
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
  },
  listItemSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 12,
    fontSize: 11,
    fontWeight: '600',
  },
  badgeScheduled: {
    backgroundColor: '#dbeafe',
    color: '#1d4ed8',
  },
  badgeCompleted: {
    backgroundColor: '#dcfce7',
    color: '#166534',
  },
  badgeCancelled: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
  },
  badgeArrived: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
  },
  emptyStateText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.md,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  seeAll: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.md,
  },
});

export const Button = ({ 
  title, 
  onPress, 
  variant = 'primary', 
  disabled = false,
  loading = false,
  style,
  ...props 
}: {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'outline' | 'secondary';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}) => {
  const isPrimary = variant === 'primary';
  const isOutline = variant === 'outline';
  
  return (
    <TouchableOpacity
      style={[
        styles.button,
        isOutline && styles.buttonOutline,
        disabled && styles.buttonDisabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary || isOutline ? '#ffffff' : COLORS.primary} size="small" />
      ) : (
        <Text style={[
          styles.buttonText,
          isOutline && styles.buttonOutlineText,
        ]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

export const Input = ({ 
  label, 
  error, 
  style,
  ...props 
}: {
  label?: string;
  error?: string;
  style?: ViewStyle;
} & React.ComponentProps<typeof TextInput>) => {
  return (
    <View style={{ marginBottom: SPACING.md }}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          error && styles.inputError,
          style,
        ]}
        {...props}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

export const Card = ({ 
  children, 
  style,
  ...props 
}: {
  children: React.ReactNode;
  style?: ViewStyle;
}) => {
  return (
    <View style={[styles.card, style]} {...props}>
      {children}
    </View>
  );
};

export const StatRow = ({ label, value, valueStyle }: { label: string; value: string | number; valueStyle?: ViewStyle }) => {
  return (
    <View style={styles.statRow}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, valueStyle]}>{value}</Text>
    </View>
  );
};

export const Badge = ({ 
  children, 
  variant = 'default',
  style 
}: {
  children: React.ReactNode;
  variant?: 'default' | 'scheduled' | 'completed' | 'cancelled' | 'arrived';
  style?: ViewStyle;
}) => {
  const variantStyles = {
    scheduled: styles.badgeScheduled,
    completed: styles.badgeCompleted,
    cancelled: styles.badgeCancelled,
    arrived: styles.badgeArrived,
  };
  
  return (
    <View style={[styles.badge, variantStyles[variant], style]}>
      {children}
    </View>
  );
};

export const AppointmentStatusBadge = ({ status }: { status: string }) => {
  const variantMap: Record<string, 'scheduled' | 'completed' | 'cancelled' | 'arrived'> = {
    SCHEDULED: 'scheduled',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
    ARRIVED: 'arrived',
    NO_SHOW: 'cancelled',
  };
  
  return <Badge variant={variantMap[status] || 'default'}>{status.replace('_', ' ')}</Badge>;
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  try {
    return format(new Date(dateString), 'MMM d, yyyy');
  } catch {
    return dateString;
  }
};

export const formatDateTime = (dateString: string): string => {
  try {
    return format(new Date(dateString), 'MMM d, yyyy h:mm a');
  } catch {
    return dateString;
  }
};

export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const EmptyState = ({ 
  title, 
  message, 
  actionLabel, 
  onAction 
}: {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}) => {
  return (
    <View style={styles.emptyState}>
      <Text style={[styles.emptyStateText, { fontSize: 18, fontWeight: '600', color: COLORS.text }]}>
        {title}
      </Text>
      <Text style={styles.emptyStateText}>{message}</Text>
      {actionLabel && onAction && (
        <Button title={actionLabel} onPress={onAction} variant="outline" style={{ marginTop: SPACING.md, width: 200 }} />
      )}
    </View>
  );
};

export const LoadingSpinner = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color={COLORS.primary} />
  </View>
);

export const SectionHeader = ({ title, action }: { title: string; action?: React.ReactNode }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {action}
  </View>
);

export const Divider = () => <View style={styles.divider} />;

export const ListItem = ({ 
  title, 
  subtitle, 
  rightElement,
  onPress,
  style,
}: {
  title: string;
  subtitle?: string;
  rightElement?: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
}) => {
  return (
    <TouchableOpacity 
      style={[styles.listItem, style]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={{ flex: 1 }}>
        <Text style={styles.listItemTitle}>{title}</Text>
        {subtitle && <Text style={styles.listItemSubtitle}>{subtitle}</Text>}
      </View>
      {rightElement}
    </TouchableOpacity>
  );
};