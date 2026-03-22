export const getMapHtmlTemplate = (
  type: 'condos' | 'hearts',
  theme: 'light' | 'dark',
  backgroundColor: string
) => {
  const isDark = theme === 'dark';
  
  const condosLogic = `
    var devIcon = L.divIcon({
      className: 'custom-div-icon',
      html: "<div style='background-color:#3b82f6;width:18px;height:18px;border-radius:9px;border:3px solid white;box-shadow:0 0 5px rgba(0,0,0,0.5);'></div>",
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    function getIconForState(estado) {
      var est = estado ? estado.toUpperCase() : '';
      var color = '#3b82f6';
      if (est.includes('VACIO') || est.includes('VACÍO')) color = '#10b981';
      if (est.includes('MEDIO')) color = '#f59e0b';
      if (est.includes('LLENO') && !est.includes('MEDIO')) color = '#ef4444';

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
  `;

  const heartsLogic = `
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
  `;

  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style> 
          body, html { padding: 0; margin: 0; width: 100%; height: 100%; } 
          #map { width: 100%; height: 100%; background-color: ${backgroundColor}; } 
          .leaflet-control-attribution { display: none; }
        </style>
    </head>
    <body class="${isDark ? 'dark-mode' : ''}">
        <div id="map"></div>
        <script>
          var map = L.map('map', { zoomControl: false });
          var tileUrl = 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}';
          L.tileLayer(tileUrl, { maxZoom: 19 }).addTo(map);

          ${type === 'condos' ? condosLogic : heartsLogic}
          
          map.setView([-36.8201, -73.0444], 12);
        </script>
    </body>
    </html>
  `;
};
