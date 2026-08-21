import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { MapPin, Phone, Mail, UserRound, MessageSquare, ScanFace, X, ShieldAlert, Heart, Calendar } from 'lucide-react-native';
import { useTheme } from '../../hooks/useTheme';
import { Header } from '../../components/Header';
import { Input } from '../../components/Input';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import { patientService } from '../../services/patientService';
import { formatPatientAddress, formatPatientDemographics, getInitials } from '../../utils/helpers';

export const PatientList = ({ navigation }) => {
  const { theme } = useTheme();
  const { colors } = theme;
  const [search, setSearch] = useState('');
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);

  const loadPatients = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await patientService.getPatients(search ? { search } : {});
      setPatients(res?.patients || []);
    } catch (e) {
      setError(e.message || 'Unable to load patients');
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, [search]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="My Patients" subtitle="Browse and view registered patient profiles" />

      <View style={styles.searchWrap}>
        <Input
          placeholder="Search patient by name or phone..."
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        data={patients}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          loading ? (
            <View style={styles.loadingWrap}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Loading patient directory...</Text>
            </View>
          ) : error ? (
            <ErrorState message={error} onRetry={loadPatients} compact />
          ) : (
            <EmptyState
              icon={UserRound}
              title="No patients found"
              message={search ? 'Try a different name or phone number.' : 'Patients you treat will appear here.'}
              compact
            />
          )
        }
        renderItem={({ item }) => {
          const addressText = formatPatientAddress(item);
          const demoText = formatPatientDemographics(item);

          return (
            <Card style={styles.patientCard} onPress={() => setSelectedPatient(item)}>
              <View style={styles.cardHeader}>
                <View style={[styles.avatarCircle, { backgroundColor: colors.primarySoft || `${colors.primary}1A` }]}>
                  <Text style={[styles.avatarText, { color: colors.primary }]}>{getInitials(item.name)}</Text>
                </View>

                <View style={styles.mainInfo}>
                  <Text style={[styles.name, { color: colors.textPrimary }]}>{item.name}</Text>
                  {demoText ? <Text style={[styles.demoText, { color: colors.textSecondary }]}>{demoText}</Text> : null}

                  <View style={styles.infoRow}>
                    <Phone size={12} color={colors.textMuted} />
                    <Text style={[styles.infoText, { color: colors.textMuted }]}>{item.phone || 'Phone not set'}</Text>
                  </View>

                  <View style={styles.infoRow}>
                    <MapPin size={12} color={colors.textMuted} />
                    <Text style={[styles.infoText, { color: colors.textMuted }]} numberOfLines={2}>
                      {addressText}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={[styles.cardDivider, { backgroundColor: colors.border }]} />

              <View style={styles.cardFooter}>
                <TouchableOpacity
                  style={[styles.actionChip, { backgroundColor: `${colors.primary}14` }]}
                  onPress={() => setSelectedPatient(item)}
                >
                  <UserRound size={14} color={colors.primary} />
                  <Text style={[styles.actionChipText, { color: colors.primary }]}>View Details</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.iconActionBtn, { backgroundColor: colors.surfaceLight || '#F1F5F9' }]}
                  onPress={() =>
                    navigation.navigate('ChatTab', {
                      patientId: item._id,
                      patientName: item.name,
                    })
                  }
                >
                  <MessageSquare size={16} color={colors.textPrimary} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.iconActionBtn, { backgroundColor: `${colors.secondary}1A` }]}
                  onPress={() =>
                    navigation.navigate('UploadTab', {
                      patientId: item._id,
                      patientName: item.name,
                    })
                  }
                >
                  <ScanFace size={16} color={colors.secondary} />
                </TouchableOpacity>
              </View>
            </Card>
          );
        }}
      />

      {selectedPatient && (
        <Modal animationType="slide" transparent visible={!!selectedPatient} onRequestClose={() => setSelectedPatient(null)}>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Patient Profile</Text>
                <TouchableOpacity onPress={() => setSelectedPatient(null)} style={styles.closeBtn}>
                  <X size={20} color={colors.textPrimary} />
                </TouchableOpacity>
              </View>

              <ScrollView contentContainerStyle={styles.modalBody}>
                <View style={styles.profileHero}>
                  <View style={[styles.modalAvatar, { backgroundColor: colors.primary }]}>
                    <Text style={styles.modalAvatarText}>{getInitials(selectedPatient.name)}</Text>
                  </View>
                  <Text style={[styles.modalName, { color: colors.textPrimary }]}>{selectedPatient.name}</Text>
                  <Text style={[styles.modalDemo, { color: colors.textSecondary }]}>{formatPatientDemographics(selectedPatient)}</Text>
                </View>

                <View style={[styles.sectionBlock, { backgroundColor: colors.surfaceLight || '#F8FAFC' }]}>
                  <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Contact Information</Text>
                  <View style={styles.modalRow}>
                    <Phone size={14} color={colors.primary} />
                    <Text style={[styles.modalValue, { color: colors.textPrimary }]}>{selectedPatient.phone || 'N/A'}</Text>
                  </View>
                  <View style={styles.modalRow}>
                    <Mail size={14} color={colors.primary} />
                    <Text style={[styles.modalValue, { color: colors.textPrimary }]}>{selectedPatient.email || 'N/A'}</Text>
                  </View>
                  <View style={styles.modalRow}>
                    <MapPin size={14} color={colors.primary} />
                    <Text style={[styles.modalValue, { color: colors.textPrimary }]}>{formatPatientAddress(selectedPatient)}</Text>
                  </View>
                </View>

                <View style={[styles.sectionBlock, { backgroundColor: colors.surfaceLight || '#F8FAFC' }]}>
                  <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Medical Profile</Text>
                  <View style={styles.modalRow}>
                    <Heart size={14} color={colors.danger} />
                    <Text style={[styles.modalValue, { color: colors.textPrimary }]}>
                      Blood Group: {selectedPatient.medicalProfile?.bloodGroup || 'Not specified'}
                    </Text>
                  </View>

                  <Text style={[styles.subLabel, { color: colors.textMuted }]}>Allergies:</Text>
                  <Text style={[styles.subValue, { color: colors.textPrimary }]}>
                    {selectedPatient.medicalProfile?.allergies?.length > 0
                      ? selectedPatient.medicalProfile.allergies.join(', ')
                      : 'None reported'}
                  </Text>

                  <Text style={[styles.subLabel, { color: colors.textMuted }]}>Medical History:</Text>
                  <Text style={[styles.subValue, { color: colors.textPrimary }]}>
                    {selectedPatient.medicalProfile?.medicalHistory?.length > 0
                      ? selectedPatient.medicalProfile.medicalHistory.join(', ')
                      : 'No pre-existing conditions recorded'}
                  </Text>

                  {selectedPatient.medicalProfile?.emergencyContact?.name ? (
                    <View style={styles.emergencyBox}>
                      <ShieldAlert size={14} color={colors.warning} />
                      <Text style={[styles.emergencyText, { color: colors.textPrimary }]}>
                        Emergency: {selectedPatient.medicalProfile.emergencyContact.name} ({selectedPatient.medicalProfile.emergencyContact.phone || 'No phone'})
                      </Text>
                    </View>
                  ) : null}
                </View>

                <View style={styles.modalActions}>
                  <Button
                    title="Send Message"
                    onPress={() => {
                      const p = selectedPatient;
                      setSelectedPatient(null);
                      navigation.navigate('ChatTab', { patientId: p._id, patientName: p.name });
                    }}
                    style={{ flex: 1 }}
                  />
                  <Button
                    title="Upload X-Ray"
                    variant="secondary"
                    onPress={() => {
                      const p = selectedPatient;
                      setSelectedPatient(null);
                      navigation.navigate('UploadTab', { patientId: p._id, patientName: p.name });
                    }}
                    style={{ flex: 1 }}
                  />
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchWrap: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  list: {
    padding: 20,
    paddingBottom: 40,
  },
  loadingWrap: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 24,
    fontSize: 14,
  },
  errorText: {
    color: '#ef4444',
    textAlign: 'center',
    marginTop: 20,
    fontWeight: 'bold',
  },
  patientCard: {
    marginBottom: 12,
    padding: 16,
    borderRadius: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '800',
  },
  mainInfo: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '800',
  },
  demoText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginTop: 3,
  },
  infoText: {
    fontSize: 11,
    flex: 1,
    lineHeight: 15,
  },
  cardDivider: {
    height: 1,
    marginVertical: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  actionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    flex: 1,
  },
  actionChipText: {
    fontSize: 12,
    fontWeight: '800',
  },
  iconActionBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '85%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  closeBtn: {
    padding: 4,
  },
  modalBody: {
    paddingBottom: 20,
    gap: 14,
  },
  profileHero: {
    alignItems: 'center',
    marginBottom: 8,
  },
  modalAvatar: {
    width: 64,
    height: 64,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  modalAvatarText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
  },
  modalName: {
    fontSize: 20,
    fontWeight: '800',
  },
  modalDemo: {
    fontSize: 13,
    marginTop: 4,
  },
  sectionBlock: {
    borderRadius: 16,
    padding: 14,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 4,
  },
  modalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalValue: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  subLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4,
  },
  subValue: {
    fontSize: 13,
  },
  emergencyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
    backgroundColor: '#FEF3C7',
    padding: 10,
    borderRadius: 10,
  },
  emergencyText: {
    fontSize: 12,
    fontWeight: '700',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
});

export default PatientList;
