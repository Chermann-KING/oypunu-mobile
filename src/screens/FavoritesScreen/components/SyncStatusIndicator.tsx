/**
 * @fileoverview Sync Status Indicator Component
 * Follows SOLID principles - Single Responsibility for sync status display
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Cloud, CloudOff, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react-native';
import { Colors, Spacing, Typography } from '../../../design-system';
import { FavoritesSyncStatus } from '../../../core/interfaces/IFavoritesSyncService';

interface SyncStatusIndicatorProps {
  syncStatus: FavoritesSyncStatus | null;
  isManualSyncing: boolean;
  onManualSync: () => void;
}

export const SyncStatusIndicator: React.FC<SyncStatusIndicatorProps> = ({
  syncStatus,
  isManualSyncing,
  onManualSync,
}) => {
  if (!syncStatus) return null;

  const getSyncIcon = () => {
    if (isManualSyncing || syncStatus.isSyncing) {
      return <RefreshCw size={16} color={Colors.primary[600]} style={styles.spinningIcon} />;
    }
    
    if (!syncStatus.isOnline) {
      return <CloudOff size={16} color={Colors.text.tertiary} />;
    }
    
    if (syncStatus.syncError) {
      return <AlertCircle size={16} color={Colors.semantic.error} />;
    }
    
    if (syncStatus.hasPendingActions) {
      return <Cloud size={16} color={Colors.semantic.warning} />;
    }
    
    return <CheckCircle size={16} color={Colors.semantic.success} />;
  };

  const getSyncText = () => {
    if (isManualSyncing) {
      return 'Synchronisation...';
    }
    
    if (syncStatus.isSyncing) {
      return 'Sync auto...';
    }
    
    if (!syncStatus.isOnline) {
      return 'Hors ligne';
    }
    
    if (syncStatus.syncError) {
      return 'Erreur de sync';
    }
    
    if (syncStatus.hasPendingActions) {
      return `${syncStatus.pendingActionsCount} en attente`;
    }
    
    if (syncStatus.lastSyncAt) {
      const lastSync = new Date(syncStatus.lastSyncAt);
      const now = new Date();
      const diffMinutes = Math.floor((now.getTime() - lastSync.getTime()) / 60000);
      
      if (diffMinutes < 1) {
        return 'Synchronisé';
      } else if (diffMinutes < 60) {
        return `Sync il y a ${diffMinutes}m`;
      } else {
        const diffHours = Math.floor(diffMinutes / 60);
        return `Sync il y a ${diffHours}h`;
      }
    }
    
    return 'Non synchronisé';
  };

  const getTextColor = () => {
    if (syncStatus.syncError) return Colors.semantic.error;
    if (!syncStatus.isOnline) return Colors.text.tertiary;
    if (syncStatus.hasPendingActions) return Colors.semantic.warning;
    return Colors.text.secondary;
  };

  const shouldShowManualSync = syncStatus.isOnline && 
    (syncStatus.hasPendingActions || syncStatus.syncError) && 
    !isManualSyncing && 
    !syncStatus.isSyncing;

  return (
    <View style={styles.container}>
      <View style={styles.statusInfo}>
        {getSyncIcon()}
        <Text style={[styles.statusText, { color: getTextColor() }]}>
          {getSyncText()}
        </Text>
      </View>
      
      {shouldShowManualSync && (
        <TouchableOpacity 
          style={styles.syncButton} 
          onPress={onManualSync}
          disabled={isManualSyncing}
        >
          <Text style={styles.syncButtonText}>Synchroniser</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[2],
    backgroundColor: Colors.surface.elevated,
    borderBottomWidth: 1,
    borderBottomColor: Colors.primary[300],
  },
  statusInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  statusText: {
    ...Typography.styles.caption,
  },
  syncButton: {
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[1],
    borderRadius: 12,
    backgroundColor: Colors.primary[600],
  },
  syncButtonText: {
    ...Typography.styles.caption,
    color: Colors.text.onPrimary,
    fontWeight: '500',
  },
  spinningIcon: {
    // TODO: Add spinning animation if needed
  },
});