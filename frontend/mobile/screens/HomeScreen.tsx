import React, { useMemo, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
type HomeScreenProps = {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onProfilePress: () => void;
  onMessagesPress: () => void;
  liveStatuses: Record<string, LiveDiningStatus>;
  loadingStatuses: boolean;
};

type DiningHall = {
  id: string;
  name: string;
  neighborhood: string;
  status: 'open' | 'closed' | 'busy' | 'unknown';
  closesAt: string;
  rating: number;
  description: string;
  specialties: string[];
  image: string;
  statusDetail?: string;
  liveStatusText?: string;
  activityLevel?: number;
  hasLiveUpdate?: boolean;
};

export type LiveDiningStatus = {
  id: string;
  status: DiningHall['status'];
  statusText?: string;
  statusDetail?: string;
  activityLevel?: number;
  isOpen?: boolean;
  lastUpdated?: string;
};

const BASE_DINING_HALLS: DiningHall[] = [
  {
    id: 'epicuria-ackerman',
    name: 'Epic at Ackerman',
    neighborhood: 'Ackerman Union',
    status: 'unknown',
    closesAt: 'Loading hours...',
    rating: 4.6,
    description: 'Chef-driven Mediterranean plates, wood-fired pizzas, pasta and patisserie vibes in Ackerman Union.',
    specialties: ['Small Plates', 'Fresh Pasta', 'Pastries'],
    image: 'https://epicuria.ucla.edu/img/slide-pepperoni-pizza.jpg',
  },
  {
    id: 'bruin-cafe',
    name: 'Bruin Café',
    neighborhood: 'Sproul Hall',
    status: 'unknown',
    closesAt: 'Loading hours...',
    rating: 4.5,
    description: 'Cold brew, artisan sandwiches, and grab-and-go bites perfect for study sessions.',
    specialties: ['Cold Brew', 'Paninis', 'Grab & Go'],
    image: 'https://wp.dailybruin.com/images/2017/03/quad.bcaf2_.file_.jpg',
  },
  {
    id: 'rendezvous',
    name: 'Rendezvous',
    neighborhood: 'Rieber Terrace',
    status: 'unknown',
    closesAt: 'Loading hours...',
    rating: 4.4,
    description: 'Late-night tacos, burritos, ramen, and pan-Asian fusion favorites.',
    specialties: ['Tacos', 'Burritos', 'Bubble Tea'],
    image: 'https://dining.ucla.edu/wp-content/uploads/2025/03/BBQ-Chicken-Quesadilla_MG_1035-rendezvous-alt-hero-3-1.jpg',
  },
  {
    id: 'hedrick-study',
    name: 'The Study at Hedrick',
    neighborhood: 'Hedrick Hall',
    status: 'unknown',
    closesAt: 'Loading hours...',
    rating: 4.3,
    description: 'Cafe lounge with all-day breakfast, waffles, smoothies, and a chill study atmosphere.',
    specialties: ['Waffles', 'Smoothies', 'Study Snacks'],
    image: 'https://dining.ucla.edu/wp-content/uploads/2025/03/The-Study-Day-2-219_MV-hero.jpg',
  },
];

const STATUS_COLORS: Record<DiningHall['status'], string> = {
  open: '#22c55e',
  busy: '#f97316',
  closed: '#ef4444',
  unknown: '#6b7280',
};

export default function HomeScreen({
  darkMode,
  onToggleDarkMode,
  onProfilePress,
  onMessagesPress,
  liveStatuses,
  loadingStatuses,
}: HomeScreenProps) {
  const apiUrl = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3001';
  const [matchModalVisible, setMatchModalVisible] = useState(false);
  const [matchLoading, setMatchLoading] = useState(false);
  const [matchError, setMatchError] = useState<string | null>(null);
  const [matchedDeliverer, setMatchedDeliverer] = useState<any>(null);
  const [selectedHall, setSelectedHall] = useState<DiningHall | null>(null);
  const [myPin, setMyPin] = useState('');
  const [partnerPin, setPartnerPin] = useState('');
  const [partnerPinEntry, setPartnerPinEntry] = useState('');

  const handleDiningHallPress = (hall: DiningHall) => {
    Alert.alert(
      'Match with a deliverer?',
      `We’ll match you with the longest-waiting deliverer at ${hall.name}.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Match me', onPress: () => matchDeliverer(hall) },
      ],
    );
  };

  const generatePin = () => Math.floor(1000 + Math.random() * 9000).toString();

  const matchDeliverer = async (hall: DiningHall) => {
    try {
      setMatchError(null);
      setMatchLoading(true);
      setSelectedHall(hall);
      setMatchedDeliverer(null);
      setMyPin(generatePin());
      setPartnerPin(generatePin());
      setPartnerPinEntry('');

      const response = await fetch(`${apiUrl}/api/deliverers?hall_id=${encodeURIComponent(hall.id)}`);
      const text = await response.text();
      if (!response.ok) {
        throw new Error(text || 'Failed to fetch deliverers');
      }
      let data: any = {};
      try {
        data = JSON.parse(text);
      } catch {
        // ignore parse error
      }
      const first = data?.deliverers?.[0];
      if (!first) {
        setMatchError('No deliverers are active for this hall right now.');
        setMatchModalVisible(true);
        return;
      }
      try {
        await fetch(`${apiUrl}/api/deliverers/deactivate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: first.user_id }),
        });
      } catch (err) {
        console.error('Failed to deactivate deliverer after match', err);
      }
      setMatchedDeliverer(first);
      setMatchModalVisible(true);
    } catch (error: any) {
      setMatchError(error.message || 'Failed to match a deliverer');
      setMatchModalVisible(true);
    } finally {
      setMatchLoading(false);
    }
  };

  const closeMatchModal = () => {
    setMatchModalVisible(false);
    setMatchedDeliverer(null);
    setSelectedHall(null);
    setMyPin('');
    setPartnerPin('');
    setPartnerPinEntry('');
    setMatchError(null);
  };

  const diningHalls = useMemo(() => {
    return BASE_DINING_HALLS.map((hall) => {
      const live = liveStatuses[hall.id];
      if (!live) return hall;

      const status = STATUS_COLORS[live.status] ? live.status : hall.status;
      return {
        ...hall,
        status,
        liveStatusText: live.statusText ?? hall.liveStatusText,
        statusDetail: live.statusDetail ?? hall.statusDetail,
        activityLevel: live.activityLevel ?? hall.activityLevel,
        closesAt: live.statusDetail ?? hall.closesAt,
        hasLiveUpdate: Boolean(live),
      };
    });
  }, [liveStatuses]);

  const theme = useMemo(
    () => ({
      background: darkMode ? '#0f172a' : '#f8fafc',
      cardBackground: darkMode ? '#1f2937' : '#ffffff',
      border: darkMode ? '#273449' : '#e2e8f0',
      primaryText: darkMode ? '#f8fafc' : '#0f172a',
      secondaryText: darkMode ? '#94a3b8' : '#475569',
      subtitleText: darkMode ? '#cbd5f5' : '#475569',
      chipBackground: darkMode ? '#111827' : '#eff6ff',
      chipText: darkMode ? '#bfdbfe' : '#1d4ed8',
    }),
    [darkMode],
  );
  const hasAnyLiveStatuses = Object.keys(liveStatuses).length > 0;
  const showInitialLoading = loadingStatuses && !hasAnyLiveStatuses;

  return (
    <>
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentInsetAdjustmentBehavior="automatic"
    >
      <View style={styles.topBar}>
        <TouchableOpacity
          aria-label="Profile"
          onPress={onProfilePress}
          style={[styles.avatarButton, darkMode && styles.avatarButtonDark]}
        >
          <Ionicons name="person" size={20} color={darkMode ? '#93c5fd' : '#1f2937'} />
        </TouchableOpacity>
        <View style={styles.topBarActions}>
          <TouchableOpacity
            aria-label="Messages"
            onPress={onMessagesPress}
            style={[styles.iconCircle, darkMode && styles.iconCircleDark]}
          >
            <Ionicons name="chatbubbles" size={18} color={darkMode ? '#f8fafc' : '#1f2937'} />
          </TouchableOpacity>
        <TouchableOpacity
          aria-label="Toggle dark mode"
          onPress={onToggleDarkMode}
          style={[
            styles.moonButton,
            darkMode && styles.moonButtonActive,
          ]}
        >
          <Ionicons name="moon" size={20} color={darkMode ? '#0f172a' : '#fde68a'} />
        </TouchableOpacity>
        </View>
      </View>
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.primaryText }]}>
            Select where you’d like to order
          </Text>
          <Text style={[styles.sectionSubtitle, { color: theme.subtitleText }]}>
            Live open/closed status {loadingStatuses ? '(Refreshing...)' : ''}
          </Text>
        </View>

        {diningHalls.map((hall) => {
          const isHallLoading = showInitialLoading && !hall.hasLiveUpdate;
          const statusColor = isHallLoading
            ? theme.secondaryText
            : STATUS_COLORS[hall.status] || STATUS_COLORS.unknown;
          const statusBackground = `${statusColor}22`;
          const activityLabel = isHallLoading
            ? 'Updating activity...'
            : typeof hall.activityLevel === 'number'
              ? `${hall.activityLevel}% active`
              : 'Activity unknown';
          const closesLabel = isHallLoading ? 'Fetching hours...' : hall.closesAt;
          const statusLabel = isHallLoading
            ? 'Loading...'
            : hall.liveStatusText
              ? hall.liveStatusText
              : hall.status === 'busy'
                ? 'Busy'
                : hall.status === 'closed'
                  ? 'Closed'
                  : hall.status === 'open'
                    ? 'Open'
                    : 'Status unknown';

          return (
            <TouchableOpacity
            key={hall.id}
            style={[
              styles.hallCard,
              {
                backgroundColor: theme.cardBackground,
                borderColor: theme.border,
                shadowColor: darkMode ? '#000' : '#0f172a',
              },
            ]}
            activeOpacity={0.85}
            onPress={() => handleDiningHallPress(hall)}
          >
            <Image source={{ uri: hall.image }} style={styles.hallImage} />
            <View style={styles.cardContent}>
              <View style={styles.cardHeaderRow}>
                <View>
                  <Text style={[styles.hallName, { color: theme.primaryText }]}>{hall.name}</Text>
                  <Text style={[styles.hallNeighborhood, { color: theme.secondaryText }]}>
                    {hall.neighborhood}
                  </Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: statusBackground },
                  ]}
                >
                  <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                  <Text style={[styles.statusText, { color: statusColor }]}>
                    {statusLabel}
                  </Text>
                </View>
              </View>

              <Text style={[styles.hallDescription, { color: theme.secondaryText }]}>
                {hall.description}
              </Text>
              {!isHallLoading && hall.statusDetail && (
                <Text style={[styles.statusDetailText, { color: theme.primaryText }]}>
                  {hall.statusDetail}
                </Text>
              )}

              <View style={styles.metaRow}>
                <View style={[styles.metaItem, { backgroundColor: theme.chipBackground }]}>
                  <Ionicons name="alarm-outline" size={16} color="#2563eb" />
                  <Text style={[styles.metaText, { color: theme.chipText }]}>{closesLabel}</Text>
                </View>
                <View style={[styles.metaItem, { backgroundColor: theme.chipBackground }]}>
                  <Ionicons name="pulse-outline" size={16} color="#2563eb" />
                  <Text style={[styles.metaText, { color: theme.chipText }]}>{activityLabel}</Text>
                </View>
              </View>
            </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>

    <Modal visible={matchModalVisible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
          style={{ width: '100%' }}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={[styles.modalCard, { backgroundColor: darkMode ? '#0b1220' : '#ffffff', borderColor: theme.border }]}>
              {matchLoading ? (
                <View style={styles.modalLoading}>
                  <ActivityIndicator size="large" color="#3b82f6" />
                  <Text style={[styles.modalTitle, { color: theme.primaryText, marginTop: 12 }]}>Matching you...</Text>
                </View>
              ) : matchError ? (
                <>
                  <Text style={[styles.modalTitle, { color: theme.primaryText }]}>No match yet</Text>
                  <Text style={[styles.modalBody, { color: theme.secondaryText }]}>{matchError}</Text>
                  <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#ef4444' }]} onPress={closeMatchModal}>
                    <Text style={styles.modalButtonText}>Close</Text>
                  </TouchableOpacity>
                </>
              ) : matchedDeliverer && selectedHall ? (
                <ScrollView
                  contentContainerStyle={{ paddingBottom: 12 }}
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
                >
                  <Text style={[styles.modalTitle, { color: theme.primaryText }]}>Deliverer found</Text>
                  <Text style={[styles.modalSubtitle, { color: theme.secondaryText }]}>
                    Waiting longest at {selectedHall.name}
                  </Text>
                  <View style={[styles.summaryBox, { borderColor: theme.border }]}>
                    <Text style={[styles.summaryLabel, { color: theme.secondaryText }]}>Deliverer</Text>
                    <Text style={[styles.summaryValue, { color: theme.primaryText }]}>
                      {matchedDeliverer.display_name || matchedDeliverer.user_name || 'Anonymous Bruin'}
                    </Text>
                    <Text style={[styles.summaryLabel, { color: theme.secondaryText, marginTop: 10 }]}>Order they want</Text>
                    <Text style={[styles.summaryValue, { color: theme.primaryText }]}>{matchedDeliverer.desired_order || 'No notes'}</Text>
                    <Text style={[styles.summaryLabel, { color: theme.secondaryText, marginTop: 10 }]}>Contact</Text>
                    <Text style={[styles.summaryValue, { color: theme.primaryText }]}>{matchedDeliverer.contact || 'Contact info not provided'}</Text>
                  </View>

                  <Text style={[styles.modalBody, { color: theme.primaryText, marginTop: 8 }]}>
                    Once both orders are ready to be picked up, you'll need to facetime your deliverer and share your screen so they can pick up your order.
                  </Text>
                  <Text style={[styles.modalBody, { color: theme.primaryText, marginTop: 10, fontWeight: '700' }]}>
                    Your PIN to share with deliverer
                  </Text>
                  <Text style={[styles.pinDisplay, { color: theme.primaryText, borderColor: theme.border }]}>{myPin}</Text>
                  <Text style={[styles.modalBody, { color: theme.primaryText, marginTop: 6 }]}>
                    Ask your deliverer for their PIN and enter it below to continue.
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        borderColor: theme.border,
                        color: theme.primaryText,
                        backgroundColor: darkMode ? '#0f172a' : '#f8fafc',
                        marginBottom: 12,
                      },
                    ]}
                    placeholder="Enter deliverer's PIN"
                    placeholderTextColor={theme.secondaryText}
                    keyboardType="number-pad"
                    returnKeyType="done"
                    value={partnerPinEntry}
                    onChangeText={setPartnerPinEntry}
                  />
                  <TouchableOpacity
                    style={[
                      styles.modalButton,
                      { backgroundColor: partnerPinEntry === partnerPin ? '#10b981' : '#9ca3af' },
                    ]}
                    disabled={partnerPinEntry !== partnerPin}
                    onPress={closeMatchModal}
                  >
                    <Text style={styles.modalButtonText}>Confirm</Text>
                  </TouchableOpacity>
                </ScrollView>
              ) : null}
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </View>
    </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 20,
  },
  heroCard: {
    backgroundColor: '#1d4ed8',
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#1d4ed8',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 20,
    elevation: 5,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  topBarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarButtonDark: {
    backgroundColor: '#1f2937',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e2e8f0',
  },
  iconCircleDark: {
    backgroundColor: '#1f2937',
  },
  moonButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1d4ed8',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 3,
  },
  moonButtonActive: {
    backgroundColor: '#fde68a',
  },
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#475569',
    marginTop: 4,
  },
  hallCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 20,
    elevation: 3,
  },
  hallImage: {
    width: '100%',
    height: 180,
  },
  cardContent: {
    padding: 16,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12,
  },
  hallName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
  },
  hallNeighborhood: {
    color: '#64748b',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontWeight: '600',
  },
  hallDescription: {
    color: '#475569',
    lineHeight: 20,
    marginBottom: 16,
  },
  statusDetailText: {
    color: '#1f2937',
    marginTop: -8,
    marginBottom: 16,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#eff6ff',
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  metaText: {
    color: '#1d4ed8',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxHeight: '90%',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
  },
  modalLoading: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 15,
    marginBottom: 12,
  },
  modalBody: {
    fontSize: 14,
    lineHeight: 20,
  },
  modalButton: {
    marginTop: 10,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  pinDisplay: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 8,
    marginTop: 10,
    marginBottom: 8,
  },
  summaryBox: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    marginTop: 10,
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 4,
  },
});
