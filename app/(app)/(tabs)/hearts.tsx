import * as Location from 'expo-location';
import { LocateFixed } from 'lucide-react-native';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  const [mapLoaded, setMapLoaded] = useState(false);

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
      let isActive = true;
      const loadLocation = async () => {
        try {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status === 'granted') {
            const location = await Location.getCurrentPositionAsync({});
            if (isActive) {
              setUserLocation({ lat: location.coords.latitude, lng: location.coords.longitude });
            }
          }
        } catch (error) {
          console.error("Error obteniendo ubicación:", error);
        }
      };

      loadLocation();
      return () => { isActive = false; };
    }, [])
  );

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

  // HTML estático memorizado (solo recargará el WebView si cambia el tema claro/oscuro de forma forzada)
  const mapHTML = useMemo(() => {
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
            L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', { maxZoom: 19 }).addTo(map);
            
            var heartIcon = L.divIcon({
              className: '',
              html: "<div style='font-size:42px;line-height:1;color:#e8192c;text-shadow:0 3px 8px rgba(0,0,0,0.4);'>&#9829;</div>",
              iconSize: [42, 42],
              iconAnchor: [21, 42],
              popupAnchor: [0, -44]
            });

            var devIcon = L.divIcon({
              className: 'custom-div-icon',
              html: "<div style='background-color:#3b82f6;width:18px;height:18px;border-radius:9px;border:3px solid white;box-shadow:0 0 5px rgba(0,0,0,0.5);'></div>",
              iconSize: [24, 24],
              iconAnchor: [12, 12]
            });

            var markersLayer = L.layerGroup().addTo(map);
            var userMarker = null;
            var isFirstLocate = true;

            // Función global accesible por inyección de React Native
            window.updateMap = function(pointsJson, userLocJson) {
              try {
                var points = JSON.parse(pointsJson);
                markersLayer.clearLayers();
                
                points.forEach(function(p) {
                  var lat = p.latitude || p.latitud || p.lat;
                  var lng = p.longitude || p.longitud || p.lng;
                  if (lat === undefined || lng === undefined) return;
                  
                  var title = (p.name || p.nombre || p.ciudad || 'Corazón').replace(/'/g, "\\\\'");
                  var desc = (p.description || p.direccion || '').replace(/'/g, "\\\\'");
                  var popupHtml = "<div style='font-family:sans-serif;min-width:160px'>" +
                    "<b style='font-size:14px'>" + title + "</b><br>" +
                    "<span style='font-size:12px;color:#666'>" + desc + "</span><br><br>" +
                    "<button onclick=\\"window.ReactNativeWebView.postMessage(JSON.stringify({type:'navigate',lat:" + lat + ",lng:" + lng + "}))\\" " +
                    "style='background:#2DB298;color:white;border:none;padding:8px 14px;border-radius:8px;font-size:13px;cursor:pointer;width:100%'>" +
                    "📍 Cómo llegar</button></div>";
                    
                  L.marker([lat, lng], { icon: heartIcon }).addTo(markersLayer).bindPopup(popupHtml);
                });

                var loc = userLocJson ? JSON.parse(userLocJson) : null;
                if (loc && loc.lat && loc.lng) {
                  if (userMarker) {
                    userMarker.setLatLng([loc.lat, loc.lng]);
                  } else {
                    userMarker = L.marker([loc.lat, loc.lng], { icon: devIcon }).addTo(map).bindPopup('<b>Tú estás aquí</b>');
                    if (isFirstLocate) {
                      map.setView([loc.lat, loc.lng], 13);
                      isFirstLocate = false;
                    }
                  }
                } else if (!userMarker && points.length === 0) {
                  map.setView([-36.8201, -73.0444], 12);
                }
              } catch (e) {
                console.error("Error injectando datos al mapa:", e);
              }
            };
            
            // Si carga vacío y sin red, default view
            map.setView([-36.8201, -73.0444], 12);
          </script>
      </body>
      </html>
    `;
  }, [theme, colors.background]);

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
            source={{ html: mapHTML }}
            style={styles.map}
            scrollEnabled={false}
            bounces={false}
            onMessage={handleWebViewMessage}
            onLoadEnd={() => setMapLoaded(true)}
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
