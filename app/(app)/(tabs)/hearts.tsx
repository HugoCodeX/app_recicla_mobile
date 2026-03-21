import * as Location from 'expo-location';
import { LocateFixed } from 'lucide-react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Linking, StyleSheet, TouchableOpacity, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { useFocusEffect } from 'expo-router';
import api from '../../../src/api';
import { useAppTheme, useThemeStore } from '../../../src/store/themeStore';
import { spacing } from '../../../src/theme';

interface CorazonPoint {
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
}

export default function HeartsScreen() {
  const colors = useAppTheme();
  const { theme } = useThemeStore();
  const styles = getStyles(colors);
  const webviewRef = useRef<WebView>(null);

  const [points, setPoints] = useState<CorazonPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null);

  // Cargar puntos del backend una sola vez al montar
  useEffect(() => {
    const loadPoints = async () => {
      try {
        const response = await api.get('/v1/corazones');
        if (Array.isArray(response.data)) {
          setPoints(response.data);
        }
      } catch (error) {
        console.error("Error cargando corazones:", error);
      } finally {
        setLoading(false);
      }
    };
    loadPoints();
  }, []);

  // Solicitar ubicación cada vez que el usuario vuelve a esta pantalla
  useFocusEffect(
    useCallback(() => {
      // Resetear estados de ubicación al volver a la pantalla
      setUserLocation(null);

      const loadLocation = async () => {
        try {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status === 'granted') {
            const location = await Location.getCurrentPositionAsync({});
            setUserLocation({ lat: location.coords.latitude, lng: location.coords.longitude });
          } else {
            // No se otorgó permiso, el mapa se centra en Concepción por defecto
          }
        } catch (error) {
          console.error("Error obteniendo ubicación:", error);
        }
      };

      loadLocation();
    }, [])
  );

  const centerOnUser = () => {
    if (userLocation && webviewRef.current) {
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

  const generateMapHTML = () => {
    const mapThemeUrl = 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}';

    const markersJS = points.map(point => {
      const lat = point.latitude ?? point.latitud ?? point.lat;
      const lng = point.longitude ?? point.longitud ?? point.lng;
      if (lat === undefined || lng === undefined) return '';

      const title = (point.name || point.nombre || point.ciudad || 'Corazón').replace(/'/g, "\\'");
      const desc = (point.description || point.direccion || '').replace(/'/g, "\\'");
      const popup = `
        <div style='font-family:sans-serif;min-width:160px'>
          <b style='font-size:14px'>${title}</b><br>
          <span style='font-size:12px;color:#666'>${desc}</span><br><br>
          <button onclick="window.ReactNativeWebView.postMessage(JSON.stringify({type:'navigate',lat:${lat},lng:${lng}}))"
            style='background:#2DB298;color:white;border:none;padding:8px 14px;border-radius:8px;font-size:13px;cursor:pointer;width:100%'>
            &#x1F9ED; C\u00f3mo llegar
          </button>
        </div>
      `.replace(/\n\s*/g, ' ');
      return `L.marker([${lat}, ${lng}], { icon: heartIcon }).addTo(map).bindPopup('${popup.replace(/'/g, "\\'")}');`;
    }).join('\n');

    const userMarkerJS = userLocation
      ? `
        var devIcon = L.divIcon({
          className: 'custom-div-icon',
          html: "<div style='background-color:#3b82f6;width:18px;height:18px;border-radius:9px;border:3px solid white;box-shadow:0 0 5px rgba(0,0,0,0.5);'></div>",
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });
        L.marker([${userLocation.lat}, ${userLocation.lng}], { icon: devIcon }).addTo(map).bindPopup('<b>Tú estás aquí</b>');
        map.setView([${userLocation.lat}, ${userLocation.lng}], 13);
      `
      : `map.setView([-36.8201, -73.0444], 12);`;

    return `
      <!DOCTYPE html>
      <html>
      <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
          <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
          <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
          <style> 
            body, html { padding: 0; margin: 0; width: 100%; height: 100%; } 
            #map { width: 100%; height: 100%; background-color: ${colors.background}; } 
            .leaflet-control-attribution { display: none; }
            .dark-mode .leaflet-tile-pane {
              filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%);
            }
          </style>
      </head>
      <body class="${theme === 'dark' ? 'dark-mode' : ''}">
          <div id="map"></div>
          <script>
              var map = L.map('map', { zoomControl: false });
              
              ${userMarkerJS}

              L.tileLayer('${mapThemeUrl}', {
                  maxZoom: 19
              }).addTo(map);

              // Custom heart icon
              var heartIcon = L.divIcon({
                className: '',
                html: "<div style='font-size:42px;line-height:1;color:#e8192c;text-shadow:0 3px 8px rgba(0,0,0,0.4);'>&#9829;</div>",
                iconSize: [42, 42],
                iconAnchor: [21, 42],
                popupAnchor: [0, -44]
              });
              
              // Marcadores desde el backend
              ${markersJS}
          </script>
      </body>
      </html>
    `;
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <>
          <WebView
            ref={webviewRef}
            originWhitelist={['*']}
            source={{ html: generateMapHTML() }}
            style={styles.map}
            scrollEnabled={false}
            bounces={false}
            onMessage={handleWebViewMessage}
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
      )}
    </View>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
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
