import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { supabase } from '../lib/supabaseClient';

interface DeliverScreenProps {
  onStartDeliver: () => void;
  darkMode: boolean;
}

type Step = 'terms' | 'choose' | 'order' | 'active';

const HALLS = [
  { id: 'epicuria-ackerman', name: 'Epic at Ackerman' },
  { id: 'bruin-cafe', name: 'Bruin Café' },
  { id: 'rendezvous', name: 'Rendezvous' },
  { id: 'hedrick-study', name: 'Hedrick Study' },
];

export default function DeliverScreen({ onStartDeliver, darkMode }: DeliverScreenProps) {
  const [step, setStep] = useState<Step>('terms');
  const [selectedHall, setSelectedHall] = useState<string>('');
  const [desiredOrder, setDesiredOrder] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  const [activating, setActivating] = useState(false);
  const [deactivating, setDeactivating] = useState(false);
  const apiUrl = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3001';

  const theme = useMemo(
    () => ({
      background: darkMode ? '#0f172a' : '#f8fafc',
      card: darkMode ? '#111827' : '#ffffff',
      text: darkMode ? '#f8fafc' : '#0f172a',
      subtitle: darkMode ? '#94a3b8' : '#475569',
      border: darkMode ? '#273449' : '#e2e8f0',
      accent: '#3b82f6',
      accentMuted: darkMode ? '#1e3a8a' : '#dbeafe',
      danger: '#ef4444',
    }),
    [darkMode],
  );

  const reset = () => {
    setStep('terms');
    setSelectedHall('');
    setDesiredOrder('');
  };

  useEffect(() => {
    let mounted = true;
    const fetchUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (!mounted) return;
      if (user?.id && !error) {
        setUserId(user.id);
      }
    };
    fetchUser();
    return () => {
      mounted = false;
    };
  }, []);

  const activate = async () => {
    if (!userId) {
      Alert.alert('Login needed', 'Please log in again to deliver.');
      return;
    }
    if (!selectedHall || !desiredOrder.trim()) {
      Alert.alert('Missing info', 'Choose a hall and describe the order you want.');
      return;
    }
    try {
      setActivating(true);
      const response = await fetch(`${apiUrl}/api/deliverers/activate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          hall_id: selectedHall,
          desired_order: desiredOrder.trim(),
        }),
      });
      const text = await response.text();
      if (!response.ok) {
        let message = 'Failed to go active';
        try {
          const parsed = JSON.parse(text);
          if (parsed?.error) message = parsed.error;
        } catch {}
        Alert.alert('Error', message);
        return;
      }
      setStep('active');
    } catch (error: any) {
      console.error('Activate error', error);
      Alert.alert('Error', error.message || 'Failed to go active');
    } finally {
      setActivating(false);
    }
  };

  const deactivate = async () => {
    if (!userId) {
      reset();
      return;
    }
    try {
      setDeactivating(true);
      await fetch(`${apiUrl}/api/deliverers/deactivate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId }),
      });
    } catch (error) {
      console.error('Deactivate error', error);
    } finally {
      setDeactivating(false);
      reset();
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      {step === 'terms' && (
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Agree to deliver responsibly</Text>
          <Text style={[styles.cardDescription, { color: theme.subtitle, marginBottom: 12 }]}>
            To protect orderers, you must accept these terms every time you go active:
          </Text>
          <View style={styles.bulletList}>
            <Term text="You will only pick up the order requested and hand it off promptly." color={theme.subtitle} />
            <Term text="No ghosting: if you can’t complete a run, cancel immediately." color={theme.subtitle} />
            <Term text="Misconduct can suspend your delivering privileges." color={theme.subtitle} />
          </View>
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: theme.accent }]}
            onPress={() => setStep('choose')}
          >
            <Ionicons name="checkbox" size={18} color="#fff" />
            <Text style={styles.primaryButtonText}>I accept</Text>
          </TouchableOpacity>
        </View>
      )}

      {step === 'choose' && (
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Pick your pickup spot</Text>
          <Text style={[styles.cardDescription, { color: theme.subtitle, marginBottom: 12 }]}>
            Choose one dining location to take requests from.
          </Text>
          <View style={styles.hallList}>
            {HALLS.map((hall) => {
              const active = hall.id === selectedHall;
              return (
                <TouchableOpacity
                  key={hall.id}
                  style={[
                    styles.hallItem,
                    {
                      borderColor: active ? theme.accent : theme.border,
                      backgroundColor: active ? theme.accentMuted : 'transparent',
                    },
                  ]}
                  onPress={() => setSelectedHall(hall.id)}
                >
                  <Ionicons
                    name={active ? 'radio-button-on' : 'radio-button-off'}
                    size={20}
                    color={active ? theme.accent : theme.subtitle}
                  />
                  <Text style={[styles.hallText, { color: theme.text }]}>{hall.name}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <View style={styles.inlineActions}>
            <TouchableOpacity style={[styles.secondaryButton, { borderColor: theme.border }]} onPress={() => setStep('terms')}>
              <Text style={[styles.secondaryButtonText, { color: theme.subtitle }]}>Back</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.primaryButton,
                { backgroundColor: selectedHall ? theme.accent : theme.subtitle + '55' },
              ]}
              disabled={!selectedHall}
              onPress={() => setStep('order')}
            >
              <Text style={styles.primaryButtonText}>Next</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {step === 'order' && (
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>What should they order for you?</Text>
          <Text style={[styles.cardDescription, { color: theme.subtitle, marginBottom: 12 }]}>
            This is what the orderer will pick up so you get a free meal while delivering.
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                borderColor: theme.border,
                color: theme.text,
                backgroundColor: darkMode ? '#0b1220' : '#f8fafc',
              },
            ]}
            placeholder="Example: Chicken burrito, mild salsa, no dairy. If closed, grab pepperoni pizza."
            placeholderTextColor={theme.subtitle}
            multiline
            value={desiredOrder}
            onChangeText={setDesiredOrder}
          />
          <View style={styles.inlineActions}>
            <TouchableOpacity style={[styles.secondaryButton, { borderColor: theme.border }]} onPress={() => setStep('choose')}>
              <Text style={[styles.secondaryButtonText, { color: theme.subtitle }]}>Back</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.primaryButton,
                { backgroundColor: desiredOrder.trim() ? theme.accent : theme.subtitle + '55' },
              ]}
              disabled={!desiredOrder.trim()}
              onPress={activate}
            >
              {activating ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryButtonText}>Go active</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      {step === 'active' && (
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.activeHeader}>
            <View>
              <Text style={[styles.cardTitle, { color: theme.text }]}>You’re active</Text>
              <Text style={[styles.cardDescription, { color: theme.subtitle }]}>
                Waiting for an orderer at {HALLS.find((h) => h.id === selectedHall)?.name || 'your hall'}.
              </Text>
            </View>
            <View style={[styles.statusPill, { backgroundColor: theme.accentMuted }]}>
              <Ionicons name="checkmark-circle" size={16} color={theme.accent} />
              <Text style={[styles.statusPillText, { color: theme.accent }]}>Delivering</Text>
            </View>
          </View>

          <View style={[styles.summaryBox, { borderColor: theme.border }]}>
            <Text style={[styles.summaryLabel, { color: theme.subtitle }]}>Pickup location</Text>
            <Text style={[styles.summaryValue, { color: theme.text }]}>
              {HALLS.find((h) => h.id === selectedHall)?.name || 'Not set'}
            </Text>
            <Text style={[styles.summaryLabel, { color: theme.subtitle, marginTop: 12 }]}>Order you want</Text>
            <Text style={[styles.summaryValue, { color: theme.text }]}>{desiredOrder}</Text>
          </View>

          <View style={styles.inlineActions}>
            <TouchableOpacity style={[styles.secondaryButton, { borderColor: theme.border }]} onPress={() => setStep('choose')}>
              <Text style={[styles.secondaryButtonText, { color: theme.subtitle }]}>Edit choices</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.primaryButton, { backgroundColor: theme.danger }]} onPress={deactivate} disabled={deactivating}>
              {deactivating ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryButtonText}>Exit delivering</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const Term = ({ text, color }: { text: string; color: string }) => (
  <View style={styles.termRow}>
    <Ionicons name="shield-checkmark" size={18} color={color} />
    <Text style={[styles.cardDescription, { color }]}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  cards: {
    gap: 16,
    marginBottom: 24,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 15,
    lineHeight: 21,
  },
  bulletList: {
    gap: 8,
    marginBottom: 16,
  },
  termRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  hallList: {
    gap: 10,
    marginBottom: 16,
  },
  hallItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  hallText: {
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    minHeight: 80,
    fontSize: 15,
    marginBottom: 16,
  },
  inlineActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    flex: 1,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 16,
  },
  secondaryButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontWeight: '700',
  },
  infoCard: {
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 40,
  },
  infoImage: {
    width: '100%',
    height: 180,
  },
  infoContent: {
    padding: 20,
    gap: 8,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  infoText: {
    fontSize: 15,
    lineHeight: 22,
  },
  infoButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
  },
  infoButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  statusPillText: {
    fontWeight: '700',
  },
  activeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryBox: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
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
