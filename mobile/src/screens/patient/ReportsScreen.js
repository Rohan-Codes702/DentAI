import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
  Linking,
  Platform,
  TouchableOpacity,
} from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import { FileText } from 'lucide-react-native';

import { Header } from '../../components/Header';
import { ReportCard } from '../../components/ReportCard';
import { SkeletonStack } from '../../components/Skeleton';
import { Card } from '../../components/Card';

import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosInstance from '../../config/axios';

import { doctorService } from '../../services/doctorService';
import { reportService } from '../../services/reportService';

import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from 'react-i18next';

export const ReportsScreen = () => {
  const { theme } = useTheme();
  const { colors } = theme;
  const { user } = useAuth();
  const { t } = useTranslation();

  const [diagnoses, setDiagnoses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDiagnoses();
  }, []);

  // --------------------------------------------------
  // FETCH DIAGNOSES
  // --------------------------------------------------

  const fetchDiagnoses = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await doctorService.getDiagnoses();

      setDiagnoses(
        Array.isArray(res?.diagnoses)
          ? res.diagnoses
          : []
      );
    } catch (e) {
      console.error(
        '[Reports] Fetch diagnoses error:',
        e
      );

      setError(
        t('reports.loadError')
      );

      setDiagnoses([]);
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // OPEN / DOWNLOAD PDF REPORT
  // --------------------------------------------------

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
          link.download = `dentai-diagnostic-report-${item._id}.pdf`;
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
      const canOpen = await Linking.canOpenURL(pdfUrl);
      if (canOpen) {
        await Linking.openURL(pdfUrl);
      } else {
        await Linking.openURL(pdfUrl);
      }
    } catch (err) {
      console.error('[Reports] Action error:', err);
      Alert.alert('Report Error', 'Unable to retrieve PDF report. Please try again.');
    }
  };

  const handleView = (item) => openOrDownloadPdf(item, false);
  const handleDownload = (item) => openOrDownloadPdf(item, true);

  // --------------------------------------------------
  // STATS
  // --------------------------------------------------

  const confirmedCount =
    diagnoses.filter(
      (d) => d.status === 'confirmed'
    ).length;

  const pendingCount =
    diagnoses.filter(
      (d) => d.status === 'pending_review'
    ).length;

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor:
            colors.background,
        },
      ]}
    >
      <Header title="AI Diagnostic Reports" />

      <FlatList
        data={diagnoses}
        keyExtractor={(item) =>
          item._id || item.id
        }
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={fetchDiagnoses}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        ListHeaderComponent={
          <>
            {/* HERO */}

            <LinearGradient
              colors={[
                colors.primary,
                colors.primaryDark,
              ]}
              style={styles.hero}
            >
              <View
                style={styles.heroIconWrap}
              >
                <FileText
                  size={24}
                  color="#fff"
                />
              </View>

              <Text style={styles.heroTitle}>
                {t('reports.title')}
              </Text>

              <Text style={styles.heroSub}>
                {t('reports.subtitle')}
              </Text>
            </LinearGradient>

            {/* STATS */}

            {diagnoses.length > 0 && (
              <View style={styles.statsRow}>
                <View
                  style={[
                    styles.statCard,
                    {
                      backgroundColor:
                        colors.surface,
                      borderColor:
                        colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statNum,
                      {
                        color:
                          colors.textPrimary,
                      },
                    ]}
                  >
                    {diagnoses.length}
                  </Text>

                  <Text
                    style={[
                      styles.statLabel,
                      {
                        color:
                          colors.textSecondary,
                      },
                    ]}
                  >
                    {t('reports.total')}
                  </Text>
                </View>

                <View
                  style={[
                    styles.statCard,
                    {
                      backgroundColor:
                        colors.surface,
                      borderColor:
                        colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statNum,
                      {
                        color:
                          colors.success,
                      },
                    ]}
                  >
                    {confirmedCount}
                  </Text>

                  <Text
                    style={[
                      styles.statLabel,
                      {
                        color:
                          colors.textSecondary,
                      },
                    ]}
                  >
                    {t('reports.confirmed')}
                  </Text>
                </View>

                <View
                  style={[
                    styles.statCard,
                    {
                      backgroundColor:
                        colors.surface,
                      borderColor:
                        colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statNum,
                      {
                        color:
                          colors.warning,
                      },
                    ]}
                  >
                    {pendingCount}
                  </Text>

                  <Text
                    style={[
                      styles.statLabel,
                      {
                        color:
                          colors.textSecondary,
                      },
                    ]}
                  >
                    {t('reports.pending')}
                  </Text>
                </View>
              </View>
            )}

            {/* ERROR */}

            {error ? (
              <Card
                style={styles.errorCard}
              >
                <Text
                  style={[
                    styles.errorText,
                    {
                      color:
                        colors.danger,
                    },
                  ]}
                >
                  {error}
                </Text>

                <TouchableOpacity
                  onPress={fetchDiagnoses}
                  style={[
                    styles.retryBtn,
                    {
                      borderColor:
                        colors.primary,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.retryText,
                      {
                        color:
                          colors.primary,
                      },
                    ]}
                  >
                    {t('reports.retry')}
                  </Text>
                </TouchableOpacity>
              </Card>
            ) : null}

            {/* LOADING */}

            {loading && (
              <Card
                style={
                  styles.loadingCard
                }
              >
                <SkeletonStack
                  lines={3}
                  lastWidth="60%"
                />
              </Card>
            )}

            {/* COUNT */}

            {diagnoses.length > 0 && (
              <Text
                style={[
                  styles.listLabel,
                  {
                    color:
                      colors.textSecondary,
                  },
                ]}
              >
                {diagnoses.length} report
                {diagnoses.length !== 1
                  ? 's'
                  : ''}
              </Text>
            )}
          </>
        }
        renderItem={({ item }) => (
          <ReportCard
            report={item}
            onView={() =>
              handleView(item)
            }
            onDownload={() =>
              handleDownload(item)
            }
          />
        )}
        ListEmptyComponent={
          !loading && !error ? (
            <View
              style={
                styles.emptyContainer
              }
            >
              <FileText
                size={48}
                color={
                  colors.textMuted
                }
              />

              <Text
                style={[
                  styles.emptyTitle,
                  {
                    color:
                      colors.textPrimary,
                  },
                ]}
              >
                No reports yet
              </Text>

              <Text
                style={[
                  styles.emptyText,
                  {
                    color:
                      colors.textSecondary,
                  },
                ]}
              >
                Reports will appear here once
                your dentist has uploaded and
                analyzed your dental X-ray.
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  list: {
    padding: 16,
    paddingBottom: 40,
  },

  hero: {
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },

  heroIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor:
      'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },

  heroTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
  },

  heroSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    lineHeight: 19,
  },

  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },

  statCard: {
    flex: 1,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },

  statNum: {
    fontSize: 22,
    fontWeight: '800',
  },

  statLabel: {
    fontSize: 11,
    marginTop: 2,
  },

  listLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 10,
  },

  errorCard: {
    marginBottom: 12,
    gap: 10,
  },

  errorText: {
    fontSize: 13,
    lineHeight: 19,
  },

  retryBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },

  retryText: {
    fontSize: 13,
    fontWeight: '700',
  },

  loadingCard: {
    marginBottom: 12,
  },

  emptyContainer: {
    alignItems: 'center',
    paddingTop: 40,
    gap: 12,
    paddingHorizontal: 20,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },

  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 21,
  },
});

export default ReportsScreen;