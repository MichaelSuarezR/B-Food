import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface DeliverScreenProps {
  onStartDeliver: () => void;
  darkMode: boolean;
}

const sampleCards = [
  {
    id: 'flow',
    title: 'Accept requests',
    description: 'Pick up meals or goods your classmates need delivered.',
    icon: 'bicycle',
  },
  {
    id: 'listings',
    title: 'Create a listing',
    description: 'List what you can deliver—food runs, groceries, textbooks, and more.',
    icon: 'clipboard',
  },
  {
    id: 'earn',
    title: 'Get paid securely',
    description: 'Chat, coordinate handoffs, and get paid directly in the app.',
    icon: 'cash',
  },
];

export default function DeliverScreen({ onStartDeliver, darkMode }: DeliverScreenProps) {
  const theme = {
    background: darkMode ? '#0f172a' : '#f8fafc',
    card: darkMode ? '#1f2937' : '#ffffff',
    text: darkMode ? '#f8fafc' : '#0f172a',
    subtitle: darkMode ? '#94a3b8' : '#475569',
    border: darkMode ? '#273449' : '#e2e8f0',
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.hero}>
        <Text style={[styles.heroEyebrow, { color: theme.subtitle }]}>Deliver for Bruins</Text>
        <Text style={[styles.heroTitle, { color: theme.text }]}>
          Share what you can deliver today.
        </Text>
        <Text style={[styles.heroSubtitle, { color: theme.subtitle }]}>
          Post your availability or accept direct requests for runs around campus.
        </Text>
        <TouchableOpacity style={styles.heroButton} onPress={onStartDeliver}>
          <Ionicons name="bicycle" size={20} color="#111827" />
          <Text style={styles.heroButtonText}>Start delivering</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.cards}>
        {sampleCards.map((card) => (
          <View key={card.id} style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.cardIcon}>
              <Ionicons name={card.icon as keyof typeof Ionicons.glyphMap} size={22} color="#3b82f6" />
            </View>
            <Text style={[styles.cardTitle, { color: theme.text }]}>{card.title}</Text>
            <Text style={[styles.cardDescription, { color: theme.subtitle }]}>{card.description}</Text>
          </View>
        ))}
      </View>

      <View style={[styles.infoCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=800&q=60' }}
          style={styles.infoImage}
        />
        <View style={styles.infoContent}>
          <Text style={[styles.infoTitle, { color: theme.text }]}>Need a custom run?</Text>
          <Text style={[styles.infoText, { color: theme.subtitle }]}>
            Let students know what you can deliver or schedule a pickup window ahead of time.
          </Text>
          <TouchableOpacity style={styles.infoButton} onPress={onStartDeliver}>
            <Text style={styles.infoButtonText}>Post availability</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  hero: {
    padding: 20,
    borderRadius: 24,
    backgroundColor: '#1d4ed8',
    marginBottom: 24,
  },
  heroEyebrow: {
    textTransform: 'uppercase',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 12,
  },
  heroSubtitle: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 16,
  },
  heroButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#facc15',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 999,
  },
  heroButtonText: {
    fontWeight: '700',
    color: '#111827',
    fontSize: 16,
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
});
