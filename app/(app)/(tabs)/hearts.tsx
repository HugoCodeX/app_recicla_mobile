import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useAppTheme, useThemeStore } from '../../../src/store/themeStore';
import api from '../../../src/api';
import { MapViewer, PointOfInterest } from '../../../src/components/features/MapViewer';

export default function HeartsScreen() {
  const colors = useAppTheme();
  const { theme } = useThemeStore();
  const [points, setPoints] = useState<PointOfInterest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/v1/corazones')
      .then(response => {
        if (Array.isArray(response.data)) setPoints(response.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <MapViewer 
          points={points} 
          mapType="hearts" 
          colors={colors} 
          theme={theme} 
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
