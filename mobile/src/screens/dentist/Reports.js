import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
  Platform,
  Linking,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosInstance from '../../config/axios';
import { useTheme } from '../../hooks/useTheme';
import { Header } from '../../components/Header';
import { ReportCard } from '../../components/ReportCard';
import { doctorService } from '../../services/doctorService';
import { reportService } from '../../services/reportService';
import { SkeletonStack } from '../../components/Skeleton';
import { Card } from '../../components/Card';
import { EmptyState } from '../../components/EmptyState';
import { FileText } from 'lucide-react-native';

export const Reports = () => {
  const { theme } = useTheme();
  const { colors } = theme;
  const styles = createStyles(colors);

  const [diagnoses, setDiagnoses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await doctorService.getDiagnoses();
      setDiagnoses(res?.diagnoses || []);
    } catch (e) {
      console.log('Failed to fetch doctor reports:', e);
      setDiagnoses([]);
    } finally {
      setLoading(false);
    }
  };

  const openOrDownloadPdf = async (item, isDownload = false) => {
    try {
      if (!item?._id) {
        Alert.alert('Error', 'Invalid diagnosis ID.');
        return;
      }

      const token = await AsyncStorage.getItem('userToken');
      const baseUrl = axiosInstance.defaults.baseURL || 'http://localhost:5000/api';
      const pdfUrl = `${baseUrl}/reports/${item._id}/pdf?token=${token}`;

      if (Platform.OS === 'web') {
        if (isDownload) {
          const blobData = await reportService.downloadReportPdf(item._id);
          const blobUrl = window.URL.createObjectURL(new Blob([blobData], { type: 'application/pdf' }));
          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = `dentai-report-${item._id}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          setTimeout(() => window.URL.revokeObjectURL(blobUrl), 10000);
        } else {
          window.open(pdfUrl, '_blank');
        }
        return;
      }

      // Mobile (iOS & Android)
      await Linking.openURL(pdfUrl);
    } catch (err) {
      console.error('[Doctor Reports] Action error:', err);
      Alert.alert('Report Error', 'Unable to open PDF report. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Patient Reports & Dental Scans" subtitle="View and download PDF reports for all treated patients" />

      {loading ? (
        <View style={{ padding: 20 }}>
          <SkeletonStack lines={4} />
        </View>
      ) : (
        <FlatList
          data={diagnoses}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={fetchReports} tintColor={colors.primary} />
          }
          ListEmptyComponent={
            <EmptyState
              icon={FileText}
              title="No reports generated"
              message="Diagnostic reports will appear here once X-rays are uploaded and analyzed."
              compact
            />
          }
          renderItem={({ item }) => (
            <ReportCard
              report={item}
              onView={() => openOrDownloadPdf(item, false)}
              onDownload={() => openOrDownloadPdf(item, true)}
            />
          )}
        />
      )}
    </View>
  );
};

const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    list: {
      padding: 20,
      paddingBottom: 40,
    },
  });

export default Reports;
