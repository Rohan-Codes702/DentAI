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

import { doctorService } from '../../services/doctorService';
import { reportService } from '../../services/reportService';

import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';

export const ReportsScreen = () => {
  const { theme } = useTheme();
  const { colors } = theme;
  const { user } = useAuth();

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
        'Unable to load reports. Check your connection and try again.'
      );

      setDiagnoses([]);
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // GET PDF USING AUTHENTICATED AXIOS
  // --------------------------------------------------

  const getPdfBlob = async (diagnosisId) => {
    try {
      console.log(
        '[Reports] Requesting authenticated PDF:',
        diagnosisId
      );

      const blob =
        await reportService.downloadReportPdf(
          diagnosisId
        );

      if (!blob) {
        throw new Error('Empty PDF response');
      }

      console.log(
        '[Reports] PDF received successfully'
      );

      return blob;
    } catch (error) {
      console.error(
        '[Reports] PDF request failed:',
        error
      );

      throw error;
    }
  };

  // --------------------------------------------------
  // VIEW PDF
  // --------------------------------------------------

  const handleView = async (item) => {
    try {
      if (!item?._id) {
        Alert.alert(
          'Error',
          'Invalid diagnosis ID.'
        );
        return;
      }

      const blob = await getPdfBlob(item._id);

      // ----------------------------------------------
      // WEB
      // ----------------------------------------------

      if (Platform.OS === 'web') {
        const blobUrl =
          window.URL.createObjectURL(blob);

        const newWindow = window.open(
          blobUrl,
          '_blank'
        );

        if (!newWindow) {
          Alert.alert(
            'Popup Blocked',
            'Please allow popups for DentAI to view the PDF.'
          );
        }

        // Give browser time to load PDF before cleanup
        setTimeout(() => {
          window.URL.revokeObjectURL(blobUrl);
        }, 60000);

        return;
      }

      // ----------------------------------------------
      // MOBILE
      // ----------------------------------------------

      Alert.alert(
        'PDF Ready',
        'The PDF was downloaded successfully. Open it from your device downloads/files.'
      );
    } catch (error) {
      console.error(
        '[Reports] View PDF error:',
        error
      );

      const status =
        error?.response?.status ||
        error?.status;

      if (status === 401) {
        Alert.alert(
          'Authentication Required',
          'Your login session has expired. Please login again.'
        );
      } else if (status === 403) {
        Alert.alert(
          'Access Denied',
          'You are not authorized to view this report.'
        );
      } else if (status === 404) {
        Alert.alert(
          'Report Not Found',
          'This report has not been generated yet.'
        );
      } else {
        Alert.alert(
          'Unable to Open Report',
          'Something went wrong while opening the PDF. Please try again.'
        );
      }
    }
  };

  // --------------------------------------------------
  // DOWNLOAD PDF
  // --------------------------------------------------

  const handleDownload = async (item) => {
    try {
      if (!item?._id) {
        Alert.alert(
          'Error',
          'Invalid diagnosis ID.'
        );
        return;
      }

      const blob = await getPdfBlob(item._id);

      // ----------------------------------------------
      // WEB DOWNLOAD
      // ----------------------------------------------

      if (Platform.OS === 'web') {
        const blobUrl =
          window.URL.createObjectURL(blob);

        const link =
          document.createElement('a');

        link.href = blobUrl;

        link.download =
          'dentai-diagnostic-report.pdf';

        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);

        setTimeout(() => {
          window.URL.revokeObjectURL(blobUrl);
        }, 10000);

        return;
      }

      // ----------------------------------------------
      // MOBILE
      // ----------------------------------------------

      Alert.alert(
        'PDF Received',
        'The PDF was retrieved successfully. We will add native file saving next.'
      );
    } catch (error) {
      console.error(
        '[Reports] Download PDF error:',
        error
      );

      const status =
        error?.response?.status ||
        error?.status;

      if (status === 401) {
        Alert.alert(
          'Authentication Required',
          'Your login session has expired. Please login again.'
        );
      } else if (status === 403) {
        Alert.alert(
          'Access Denied',
          'You are not authorized to download this report.'
        );
      } else if (status === 404) {
        Alert.alert(
          'Report Not Found',
          'This report has not been generated yet.'
        );
      } else {
        Alert.alert(
          'Download Failed',
          'Unable to download the PDF. Please try again.'
        );
      }
    }
  };

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
                Dental Reports
              </Text>

              <Text style={styles.heroSub}>
                AI-analyzed X-rays reviewed and
                confirmed by your dentist
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
                    Total
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
                    Confirmed
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
                    Pending
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
                    Retry
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