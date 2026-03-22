import React, { useMemo, useRef, useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Linking } from 'react-native';
import { WebView } from 'react-native-webview';
import { LocateFixed } from 'lucide-react-native';
import { getMapHtmlTemplate } from '../../utils/mapTemplates';
import { spacing } from '../../theme';
import { useLocation } from '../../hooks/useLocation';

export interface PointOfInterest {
  id?: string | number;
  latitude?: number;
  latitud?: number;
  lat?: number;
  longitude?: number;
  longitud?: number;
  lng?: number;
  name?: string;
  nombre?: string;
  ciudad?: string;
  direccion?: string;
  description?: string;
  estado?: string;
  status?: string;
}

interface MapViewerProps {
  points: PointOfInterest[];
  mapType: 'condos' | 'hearts';
  colors: any;
  theme: 'light' | 'dark';
  requireLocation?: boolean;
}

export function MapViewer({ points, mapType, colors, theme, requireLocation = true }: MapViewerProps) {
  const webviewRef = useRef<WebView>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const { userLocation } = useLocation(requireLocation);

  const mapHTML = useMemo(() => {
    return getMapHtmlTemplate(mapType, theme, colors.background);
  }, [mapType, theme, colors.background]);

  // Actualizar marcadores vía JavaScript (SIN recargar el WebView)
  useEffect(() => {
    if (mapLoaded && webviewRef.current) {
      const script = `
        if (typeof window.updateMap === 'function') {
          window.updateMap(${JSON.stringify(JSON.stringify(points))}, ${JSON.stringify(JSON.stringify(userLocation))});
        }
        true;
      `;
      webviewRef.current.injectJavaScript(script);
    }
  }, [points, userLocation, mapLoaded]);

  const centerOnUser = () => {
    if (userLocation && webviewRef.current && mapLoaded) {
      webviewRef.current.injectJavaScript(`
        if (typeof map !== 'undefined') {
          map.setView([${userLocation.lat}, ${userLocation.lng}], 15);
        }
        true;
      `);
    }
  };

  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'navigate') {
        const url = `https://www.google.com/maps/dir/?api=1&destination=${data.lat},${data.lng}&travelmode=walking`;
        Linking.openURL(url);
      }
    } catch (e) {}
  };

  return (
    <>
      <WebView
        ref={webviewRef}
        originWhitelist={['*']}
        source={{ html: mapHTML }}
        style={styles.map}
        scrollEnabled={false}
        bounces={false}
        onMessage={handleWebViewMessage}
        onLoadEnd={() => {
          setMapLoaded(true);
          // Si el WebView se recarga (ej. por cambio de tema oscuro/claro), reiniciamos datos
          if (webviewRef.current) {
            const script = `
              if (typeof window.updateMap === 'function') {
                window.updateMap(${JSON.stringify(JSON.stringify(points))}, ${JSON.stringify(JSON.stringify(userLocation))});
              }
              true;
            `;
            webviewRef.current.injectJavaScript(script);
          }
        }}
      />
      {userLocation && (
        <TouchableOpacity
          style={[styles.locationButton, { backgroundColor: colors.surface }]}
          onPress={centerOnUser}
        >
          <LocateFixed size={24} color={colors.primary} />
        </TouchableOpacity>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
    backgroundColor: 'transparent'
  },
  locationButton: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.lg,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
});
