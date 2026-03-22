import * as Location from 'expo-location';
import { LocateFixed, Map, Building2, Battery, BatteryMedium, BatteryFull, ArrowLeft } from 'lucide-react-native';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Linking, StyleSheet, TouchableOpacity, View, ScrollView, Text, Platform, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { useFocusEffect } from 'expo-router';
import api from '../../../src/api';
import { useAppTheme } from '../../../src/store/themeStore';
import { spacing, typography, radius } from '../../../src/theme';

type Role = 'SUPERADMIN' | 'RECICLADOR' | 'COMUNIDAD';
type ViewState = 'MENU' | 'MAP' | 'LIST';

interface CondominioPoint {
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
}

export default function CondosScreen() {
  const colors = useAppTheme();
  
  // TODO: Obtener el rol real del usuario desde Zustand o el token JWT
  const [role] = useState<Role>('SUPERADMIN'); 
  const [currentView, setCurrentView] = useState<ViewState>('MAP');

  const styles = getStyles(colors);

  // Estados del mapa
  const [points, setPoints] = useState<CondominioPoint[]>([]);
  const [loadingMap, setLoadingMap] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const webviewRef = useRef<WebView>(null);

  // Manejador de navegación para super admin
  const handleBack = () => setCurrentView('MENU');

  // Manejador de actualización de estado
  const handleUpdateStatus = async (id: string | number | undefined, nuevoEstado: string) => {
    if (!id) return;
    try {
      await api.patch(`/v1/condominios/${id}/estado`, { estado: nuevoEstado });
      setPoints(prev => prev.map(p => p.id === id ? { ...p, estado: nuevoEstado } : p));
      Alert.alert('Éxito', 'Estado actualizado correctamente');
    } catch (error: any) {
      console.error("Error al actualizar estado:", error?.response?.data || error.message);
      const msg = error?.response?.data?.message || error?.response?.statusText || error.message || 'Error desconocido';
      Alert.alert('Error del Servidor', `No se pudo actualizar: ${msg}`);
    }
  };

  // Cargar ubicación del usuario cuando se abra el mapa
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
      
      if (currentView === 'MAP' || role === 'RECICLADOR') {
        loadLocation();
      }
      return () => { isActive = false; };
    }, [currentView, role])
  );

  // Cargar condominios del backend cuando navegue a la vista del mapa o lista
  useEffect(() => {
    const loadPoints = async () => {
      if ((currentView === 'MAP' || currentView === 'LIST' || role === 'RECICLADOR' || role === 'COMUNIDAD') && points.length === 0) {
        setLoadingMap(true);
        try {
          // Utiliza el endpoint que corresponda
          const response = await api.get('/v1/condominios');
          if (Array.isArray(response.data)) {
            setPoints(response.data);
          }
        } catch (error) {
          console.error("Error cargando condominios:", error);
        } finally {
          setLoadingMap(false);
        }
      }
    };
    loadPoints();
  }, [currentView, role]);

  // Actualizar marcadores vía JavaScript cuando los puntos lleguen o cambie la ubicación
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

  // Plantilla HTML de Leaflet 
  // Crea puntos de distintos colores según el estado (Vacio, Medio Lleno, Lleno)
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
          </style>
      </head>
      <body>
          <div id="map"></div>
          <script>
            var map = L.map('map', { zoomControl: false });
            L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', { maxZoom: 19 }).addTo(map);

            var devIcon = L.divIcon({
              className: 'custom-div-icon',
              html: "<div style='background-color:#3b82f6;width:18px;height:18px;border-radius:9px;border:3px solid white;box-shadow:0 0 5px rgba(0,0,0,0.5);'></div>",
              iconSize: [24, 24],
              iconAnchor: [12, 12]
            });

            function getIconForState(estado) {
              var est = estado ? estado.toUpperCase() : '';
              var color = '#3b82f6'; // Azul por defecto si no detecta bien
              if (est.includes('VACIO') || est.includes('VACÍO')) color = '#10b981'; // Verde
              if (est.includes('MEDIO')) color = '#f59e0b'; // Amarillo
              if (est.includes('LLENO') && !est.includes('MEDIO')) color = '#ef4444'; // Rojo

              var iconHtml = "<div style='position:relative; width:44px; height:52px; display:flex; flex-direction:column; align-items:center;'>" +
                               "<div style='background-color:" + color + "; width:36px; height:36px; border-radius:50%; border:2px solid white; box-shadow:0 2px 5px rgba(0,0,0,0.3); z-index:2; display:flex; align-items:center; justify-content:center;'>" +
                                 "<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'>" +
                                    "<path d='M7 15.3 4 18.3l-3-3'/><path d='M4 18.3A10 10 0 0 1 12 3a10 10 0 0 1 7.3 3.3l1.7 1.7'/><path d='M17 8.7 20 5.7l3 3'/><path d='M20 5.7A10 10 0 0 1 12 21a10 10 0 0 1-7.3-3.3L3 16'/>" +
                                 "</svg>" +
                               "</div>" +
                               "<div style='width:0; height:0; border-left:8px solid transparent; border-right:8px solid transparent; border-top:10px solid " + color + "; margin-top:-3px; z-index:1; filter: drop-shadow(0px 2px 2px rgba(0,0,0,0.3));'></div>" +
                             "</div>";

              return L.divIcon({
                className: '',
                html: iconHtml,
                iconSize: [44, 52],
                iconAnchor: [22, 49],
                popupAnchor: [0, -49]
              });
            }

            var markersLayer = L.layerGroup().addTo(map);
            var userMarker = null;
            var isFirstLocate = true;

            window.updateMap = function(pointsJson, userLocJson) {
              try {
                var puntosReq = JSON.parse(pointsJson);
                markersLayer.clearLayers();
                
                puntosReq.forEach(function(p) {
                  var lat = p.latitude || p.latitud || p.lat;
                  var lng = p.longitude || p.longitud || p.lng;
                  if (lat === undefined || lng === undefined) return;
                  
                  var title = (p.name || p.nombre || p.ciudad || 'Condominio').replace(/'/g, "\\\\'");
                  var desc = (p.direccion || p.description || '').replace(/'/g, "\\\\'");
                  var estadoStr = (p.estado || p.status || 'SIN ESTADO').toUpperCase();
                  
                  var popupHtml = "<div style='font-family:sans-serif;min-width:160px'>" +
                    "<b style='font-size:14px'>" + title + "</b><br>" +
                    "<span style='font-size:12px;color:#666'>" + desc + "</span><br>" +
                    "<span style='font-size:13px;font-weight:bold;color:#333'>Estado: " + estadoStr + "</span><br><br>" +
                    "<button onclick=\\"window.ReactNativeWebView.postMessage(JSON.stringify({type:'navigate',lat:" + lat + ",lng:" + lng + "}))\\" " +
                    "style='background:#2DB298;color:white;border:none;padding:8px 14px;border-radius:8px;font-size:13px;cursor:pointer;width:100%'>" +
                    "📍 Cómo llegar</button></div>";
                    
                  var currentIcon = getIconForState(estadoStr);
                  L.marker([lat, lng], { icon: currentIcon }).addTo(markersLayer).bindPopup(popupHtml);
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
                } else if (!userMarker && puntosReq.length === 0) {
                  map.setView([-36.8201, -73.0444], 12);
                }
              } catch (e) {
                console.error("Error injectando datos al mapa:", e);
              }
            };
            
            map.setView([-36.8201, -73.0444], 12);
          </script>
      </body>
      </html>
    `;
  }, [colors.background]);

  // Vista 1: Menú para Super Administrador
  const renderSuperAdminMenu = () => (
    <View style={styles.menuContainer}>
      <Text style={styles.menuTitle}>Panel de Control</Text>
      <Text style={styles.menuSubtitle}>¿Qué vista deseas abrir?</Text>

      <View style={styles.cardsContainer}>
        <TouchableOpacity style={styles.roleCard} onPress={() => setCurrentView('MAP')} activeOpacity={0.8}>
          <View style={[styles.iconCircle, { backgroundColor: colors.primary + '20' }]}>
            <Map size={36} color={colors.primary} />
          </View>
          <Text style={styles.cardTitle}>Vista Reciclador</Text>
          <Text style={styles.cardDesc}>Ver mapa de recolección</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.roleCard} onPress={() => setCurrentView('LIST')} activeOpacity={0.8}>
          <View style={[styles.iconCircle, { backgroundColor: '#3b82f6' + '20' }]}>
            <Building2 size={36} color="#3b82f6" />
          </View>
          <Text style={styles.cardTitle}>Vista Comunidad</Text>
          <Text style={styles.cardDesc}>Gestionar mis condominios</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Vista 2: Mapa del Reciclador
  const renderRecyclerMap = () => (
    <View style={styles.fullContainer}>
      {role === 'SUPERADMIN' && (
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ArrowLeft size={24} color={colors.text} />
          <Text style={styles.backText}>Volver al menú</Text>
        </TouchableOpacity>
      )}
      
      {loadingMap ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <>
          <WebView
            ref={webviewRef}
            originWhitelist={['*']}
            source={{ html: mapHTML }}
            style={styles.mapWebView}
            scrollEnabled={false}
            bounces={false}
            onMessage={handleWebViewMessage}
            onLoadEnd={() => {
              setMapLoaded(true);
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
      )}
    </View>
  );

  // Vista 3: Lista para la Comunidad
  const renderCommunityList = () => (
    <ScrollView style={styles.fullContainer} contentContainerStyle={styles.listContent}>
      {role === 'SUPERADMIN' && (
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ArrowLeft size={24} color={colors.text} />
          <Text style={styles.backText}>Volver al menú</Text>
        </TouchableOpacity>
      )}

      {points.length > 0 ? (
        points.map((p, index) => (
          <View key={p.id || index} style={styles.condoCard}>
            <View style={styles.condoHeader}>
              <View style={{ flex: 1, paddingRight: spacing.sm }}>
                <Text style={styles.condoName}>{p.name || p.nombre || 'Condominio'}</Text>
                <Text style={styles.condoAddress}>{p.direccion || p.description || 'Sin dirección'}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: colors.primary + '20' }]}>
                <Text style={[styles.statusText, { color: colors.primary }]}>
                  {p.estado || 'Desconocido'}
                </Text>
              </View>
            </View>

            <Text style={styles.reportTitle}>Actualizar Estado:</Text>
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={[styles.actionBtn, { borderColor: '#10b981' }]}
                onPress={() => handleUpdateStatus(p.id, 'vacio')}
              >
                <Battery size={20} color="#10b981" />
                <Text style={[styles.actionText, { color: '#10b981' }]}>Vacío</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionBtn, { borderColor: '#f59e0b' }]}
                onPress={() => handleUpdateStatus(p.id, 'medio_lleno')}
              >
                <BatteryMedium size={20} color="#f59e0b" />
                <Text style={[styles.actionText, { color: '#f59e0b' }]}>Medio</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionBtn, { borderColor: '#ef4444' }]}
                onPress={() => handleUpdateStatus(p.id, 'lleno')}
              >
                <BatteryFull size={20} color="#ef4444" />
                <Text style={[styles.actionText, { color: '#ef4444' }]}>Lleno</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      ) : (
        <View style={styles.listEmptyContainer}>
           <Building2 size={48} color={colors.textSecondary} />
           <Text style={styles.placeholderTitle}>Sin Condominios</Text>
           <Text style={styles.placeholderText}>
             {loadingMap ? 'Cargando condominios...' : 'Aún no se han registrado condominios.'}
           </Text>
        </View>
      )}
    </ScrollView>
  );

  // Lógica de renderizado condicional según rol principal
  if (role === 'SUPERADMIN' && currentView === 'MENU') {
    return renderSuperAdminMenu();
  }

  if (role === 'RECICLADOR' || currentView === 'MAP') {
    return renderRecyclerMap();
  }

  if (role === 'COMUNIDAD' || currentView === 'LIST') {
    return renderCommunityList();
  }

  return <View style={styles.container} />;
}

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  fullContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  mapWebView: {
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
  menuContainer: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.xl,
    justifyContent: 'center',
  },
  menuTitle: {
    ...typography.h1,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  menuSubtitle: {
    ...typography.body,
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xxl,
  },
  cardsContainer: {
    gap: spacing.lg,
  },
  roleCard: {
    backgroundColor: colors.surface,
    padding: spacing.xl,
    borderRadius: radius.lg,
    alignItems: 'center',
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  cardTitle: {
    ...typography.h2,
    fontSize: 22,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  cardDesc: {
    ...typography.body,
    fontSize: 14,
    color: colors.textSecondary,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
    ...Platform.select({
      ios: {
        shadowColor: colors.text,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      }
    }),
  },
  backText: {
    ...typography.h2,
    fontSize: 18,
    color: colors.text,
    marginLeft: spacing.md,
  },
  listContent: {
    paddingBottom: spacing.xxl,
  },
  condoCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  condoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xl,
  },
  condoName: {
    ...typography.h2,
    fontSize: 18,
    color: colors.text,
    marginBottom: 4,
  },
  condoAddress: {
    ...typography.caption,
    fontSize: 14,
    color: colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.full,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  reportTitle: {
    ...typography.caption,
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
  listEmptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    marginTop: spacing.xxl,
  },
  placeholderTitle: {
    ...typography.h2,
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  placeholderText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
