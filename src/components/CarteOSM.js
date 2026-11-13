// Carte OpenStreetMap (bibliothèque Leaflet) affichée dans une page web intégrée :
//  - Android / iOS : composant WebView (react-native-webview)
//  - Web           : simple <iframe>
// La carte envoie un message quand on touche un point ; on peut aussi lui demander
// de placer le marqueur avec ref.current.placer(lat, lng, rayon).
//
// Props : position {latitude, longitude} | null, rayon (m), onChoisir(lat, lng),
//         lectureSeule (pas de clic), hauteur
import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import { Platform, View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { COLORS, RADIUS } from '../constants/theme';

// Centre par défaut si aucune position : Djerba
const CENTRE_DEFAUT = { latitude: 33.8076, longitude: 10.8451 };

// Page HTML de la carte (Leaflet + tuiles OpenStreetMap)
function pageCarte({ position, rayon, lectureSeule }) {
  const centre = position || CENTRE_DEFAUT;
  return `<!DOCTYPE html><html><head>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>html,body,#carte{height:100%;margin:0}</style>
</head><body><div id="carte"></div><script>
  // envoyer un message à l'application (WebView sur mobile, page parente sur le web)
  function envoyer(d) {
    var s = JSON.stringify(d);
    if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(s);
    else window.parent.postMessage(s, '*');
  }
  var carte = L.map('carte', { zoomControl: ${!lectureSeule}, dragging: ${!lectureSeule} })
    .setView([${centre.latitude}, ${centre.longitude}], ${position ? 16 : 12});
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19, attribution: '&copy; OpenStreetMap'
  }).addTo(carte);

  var marqueur = null, cercle = null, rayon = ${rayon || 200};
  // placer (ou déplacer) le marqueur et le cercle de la zone
  function placer(lat, lng, r, centrer) {
    if (r) rayon = r;
    if (!marqueur) {
      marqueur = L.marker([lat, lng]).addTo(carte);
      cercle = L.circle([lat, lng], { radius: rayon, color: '#6366F1', fillOpacity: 0.15 }).addTo(carte);
    } else {
      marqueur.setLatLng([lat, lng]);
      cercle.setLatLng([lat, lng]);
    }
    cercle.setRadius(rayon);
    if (centrer) carte.setView([lat, lng], Math.max(carte.getZoom(), 16));
  }
  window.placer = placer;
  ${position ? `placer(${position.latitude}, ${position.longitude});` : ''}

  // messages reçus depuis l'application web (iframe)
  window.addEventListener('message', function (e) {
    try {
      var d = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
      if (d && d.cmd === 'placer') placer(d.lat, d.lng, d.rayon, d.centrer);
    } catch (err) {}
  });

  ${lectureSeule ? '' : `carte.on('click', function (e) {
    placer(e.latlng.lat, e.latlng.lng);
    envoyer({ type: 'clic', lat: e.latlng.lat, lng: e.latlng.lng });
  });`}
</script></body></html>`;
}

const CarteOSM = forwardRef(function CarteOSM(
  { position = null, rayon = 200, onChoisir, lectureSeule = false, hauteur = 300 }, ref
) {
  const webviewRef = useRef(null);
  const iframeRef = useRef(null);

  // La page est créée une seule fois (sinon la carte se rechargerait à chaque clic)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const html = useMemo(() => pageCarte({ position, rayon, lectureSeule }), [lectureSeule]);

  // Méthode accessible depuis l'écran parent : ref.current.placer(...)
  useImperativeHandle(ref, () => ({
    placer(lat, lng, r, centrer = true) {
      if (Platform.OS === 'web') {
        iframeRef.current?.contentWindow?.postMessage(
          JSON.stringify({ cmd: 'placer', lat, lng, rayon: r, centrer }), '*');
      } else {
        webviewRef.current?.injectJavaScript(`placer(${lat}, ${lng}, ${r || 0}, ${centrer}); true;`);
      }
    },
  }));

  const recevoir = (texte) => {
    try {
      const d = JSON.parse(texte);
      if (d.type === 'clic' && onChoisir) onChoisir(d.lat, d.lng);
    } catch (e) { /* message ignoré */ }
  };

  // Web : écoute des messages envoyés par l'iframe
  useEffect(() => {
    if (Platform.OS !== 'web') return undefined;
    const ecouter = (e) => {
      if (e.source === iframeRef.current?.contentWindow && typeof e.data === 'string') recevoir(e.data);
    };
    window.addEventListener('message', ecouter);
    return () => window.removeEventListener('message', ecouter);
  });

  return (
    <View style={[styles.cadre, { height: hauteur }]} pointerEvents={lectureSeule ? 'none' : 'auto'}>
      {Platform.OS === 'web'
        ? React.createElement('iframe', {
          ref: iframeRef, srcDoc: html, title: 'Carte',
          style: { border: 0, width: '100%', height: '100%' },
        })
        : (
          <WebView
            ref={webviewRef}
            originWhitelist={['*']}
            // baseUrl : donne une origine à la page (OpenStreetMap demande un Referer)
            source={{ html, baseUrl: 'https://localhost/' }}
            onMessage={(e) => recevoir(e.nativeEvent.data)}
            javaScriptEnabled
            style={{ flex: 1 }}
          />
        )}
    </View>
  );
});

export default CarteOSM;

const styles = StyleSheet.create({
  cadre: { borderRadius: RADIUS.md, overflow: 'hidden', backgroundColor: COLORS.input },
});
