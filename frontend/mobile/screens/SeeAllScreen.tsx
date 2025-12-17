import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import TradeCard from '../components/TradeCard';
import ScreenHeader from '../components/ScreenHeader';
import BottomNavigation from '../components/BottomNavigation';
import SlideModal from '../components/SlideModal';

interface Trade {
  id: string;
  title: string;
  description: string;
  price: number | null;
  trade_options: string;
  category: string | null;
  image_urls: string[] | null;
  created_at: string;
}

interface SeeAllScreenProps {
  visible: boolean;
  type: 'new' | 'recommended' | 'all';
  onClose: () => void;
  onTradePress: (tradeId: string) => void;
  currentScreen: 'home' | 'search' | 'profile' | 'messages';
  onHomePress: () => void;
  onSearchPress: () => void;
  onMessagesPress: () => void;
  onProfilePress: () => void;
  onAddPress: () => void;
}

export default function SeeAllScreen({
  visible,
  type,
  onClose,
  onTradePress,
  currentScreen,
  onHomePress,
  onSearchPress,
  onMessagesPress,
  onProfilePress,
  onAddPress,
}: SeeAllScreenProps) {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(false);
  
  const apiUrl = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3001';
  
  const title = type === 'new' ? 'New' : type === 'recommended' ? 'Recommended' : 'All Listings';
  const headerTitle = `See All - ${title}`;
  const sectionTitle = type === 'new' ? 'New Listings' : type === 'recommended' ? 'Recommended' : 'All Listings';
  
  useEffect(() => {
    if (visible) {
      fetchTrades();
    }
  }, [visible, type]);
  
  const fetchTrades = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${apiUrl}/api/trades?limit=100&offset=0&accepted=false`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      let allTrades = data.trades || [];
      
      if (type === 'new') {
        // Filter trades from last week
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        allTrades = allTrades.filter((trade: Trade) => {
          if (!trade.created_at) return false;
          const createdAt = new Date(trade.created_at);
          return createdAt >= oneWeekAgo;
        });
      }
      // For 'recommended' and 'all', show all trades
      
      setTrades(allTrades);
    } catch (error) {
      console.error('Failed to fetch trades:', error);
      setTrades([]);
    } finally {
      setLoading(false);
    }
  };
  
  const formatPrice = (trade: Trade) => {
    if (trade.trade_options === 'Sell' && trade.price !== null) {
      return `$${trade.price.toFixed(2)}`;
    } else if (trade.trade_options === 'Trade') {
      return 'Trade';
    } else if (trade.trade_options === 'Looking for') {
      return 'Looking for';
    }
    return '';
  };

  return (
    <SlideModal visible={visible} onRequestClose={onClose}>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <ScreenHeader title={sectionTitle} onBack={onClose} />
        
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Listings Grid */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2563eb" />
            </View>
          ) : (
            <View style={styles.gridContainer}>
              {trades.length > 0 ? (
                trades.map((trade) => (
                  <TradeCard
                    key={trade.id}
                    trade={trade}
                    onPress={onTradePress}
                    width={cardWidth}
                  />
                ))
              ) : (
                <Text style={styles.emptyText}>No listings found</Text>
              )}
            </View>
          )}
        </ScrollView>
        
        <BottomNavigation 
          currentScreen={currentScreen}
          onHomePress={() => { onClose(); onHomePress(); }}
          onSearchPress={() => { onClose(); onSearchPress(); }}
          onMessagesPress={() => { onClose(); onMessagesPress(); }}
          onProfilePress={() => { onClose(); onProfilePress(); }}
          onAddPress={onAddPress}
        />
      </SafeAreaView>
    </SlideModal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 16,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingBottom: 100,
    justifyContent: 'space-between',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    paddingVertical: 40,
    width: '100%',
  },
});

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2;

