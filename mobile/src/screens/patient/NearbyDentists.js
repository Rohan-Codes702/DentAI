import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, TouchableOpacity, Platform } from 'react-native';
import { RefreshCw } from 'lucide-react-native';
import { useTheme } from '../../hooks/useTheme';
import { fonts } from '../../theme/fonts';
import { Header } from '../../components/Header';
import { EmptyState } from '../../components/EmptyState';
import { useSafeInsets } from '../../hooks/useSafeInsets';
import { generateLeafletMapHTML, DEFAULT_MAP_CENTER } from '../../config/maps';
import { useLocation } from '../../hooks/useLocation';
import { patientService } from '../../services/patientService';

// react-native-webview doesn't work on web — require conditionally
let WebView = null;
if (Platform.OS !== 'web') {
  try { WebView = require('react-native-webview').WebView; } catch (e) {}
}

export const NearbyDentists = ({ navigation }) => {
  const { theme } = useTheme();
  const { colors } = theme;
  const styles = createStyles(colors);
  const { location, loading: locationLoading } = useLocation();
  const insets = useSafeInsets();
  const [dentists, setDentists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDentists();
  }, []);

  const fetchDentists = async () => {
    try {
      setLoading(true);
      const res = await patientService.getNearbyDentists();
      setDentists(Array.isArray(res?.dentists) ? res.dentists : []);
    } catch (e) {
      console.log('Failed to fetch dentists for map:', e.message);
      setDentists([]);
    } finally {
      setLoading(false);
    }
  };

  const handleWebViewMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'BOOK_DOCTOR') {
        navigation.navigate('BookAppointment', {
          dentistId: data.doctorId,
          dentistName: data.doctorName,
        });
      }
    } catch (err) {
      console.error('Error handling map event:', err);
    }
  };

  const htmlContent = generateLeafletMapHTML(dentists, location);

  return (
    <View style={styles.container}>
      <Header
        title="Nearby Dentists"
        subtitle="Interactive OpenStreetMap view"
        showBack
        onBackPress={() => navigation.goBack()}
      />

      <View style={styles.mapContainer}>
        {locationLoading || loading ? (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Rendering OpenStreetMap Leaflet Tiles...</Text>
          </View>
        ) : Platform.OS === 'web' ? (
          // Web fallback: use an iframe embedding OSM directly
          <iframe
            title="DentAI Nearby Dentists Map"
            src={`https://www.openstreetmap.org/export/embed.html?bbox=73.75,19.98,73.82,20.02&layer=mapnik`}
            style={{ width: '100%', height: '100%', border: 'none', borderRadius: 12 }}
          />
        ) : WebView ? (
          <WebView
            originWhitelist={['*']}
            source={{ html: htmlContent }}
            style={styles.webview}
            onMessage={handleWebViewMessage}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            mixedContentMode="always"
            allowUniversalAccessFromFileURLs={true}
            allowFileAccess={true}
            startInLoadingState={true}
          />
        ) : (
          <View style={styles.loadingOverlay}>
            <Text style={styles.loadingText}>Map not available on this platform</Text>
          </View>
        )}
      </View>

      <View style={[styles.bottomSheet, { paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>Found Clinics ({dentists.length})</Text>
          <TouchableOpacity style={styles.refreshBtn} onPress={fetchDentists} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <RefreshCw size={14} color={colors.primary} />
            <Text style={styles.refreshText}>Refresh</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.sheetSubtitle}>
          Tap any blue clinic pin on the map to inspect dentist details and book an appointment.
        </Text>
        {dentists.length === 0 && !loading ? (
          <EmptyState
            title="No dentists nearby"
            message="We couldn't find any clinics near your current location. Try refreshing or check back later."
            actionLabel="Retry Search"
            onAction={fetchDentists}
            compact
          />
        ) : null}
      </View>
    </View>
  );
};

const createStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  mapContainer: {
    flex: 1,
  },
  webview: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: fonts.sizes.sm,
    marginTop: 12,
  },
  bottomSheet: {
    backgroundColor: colors.surface,
    padding: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    borderColor: colors.border,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sheetTitle: {
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weights.bold,
    color: colors.textPrimary,
  },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  refreshText: {
    color: colors.primary,
    fontSize: fonts.sizes.xs,
    fontWeight: 'bold',
  },
  sheetSubtitle: {
    fontSize: fonts.sizes.xs,
    color: colors.textSecondary,
    marginTop: 4,
    lineHeight: 16,
  },
  emptyState: {
    marginTop: 10,
    color: colors.textSecondary,
    fontSize: fonts.sizes.xs,
    fontStyle: 'italic',
  },
});

export default NearbyDentists;
