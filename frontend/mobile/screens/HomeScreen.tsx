import React, { useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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

  const handleDiningHallPress = (hall: DiningHall) => {
    Alert.alert(
      hall.name,
      'Menus and live ordering are coming soon for this dining hall.',
      [{ text: 'Got it' }],
    );
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
});
