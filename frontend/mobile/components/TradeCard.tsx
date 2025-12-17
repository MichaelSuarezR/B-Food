import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Trade {
  id: string;
  title: string;
  description?: string;
  price: number | null;
  trade_options: string;
  category: string | null;
  image_urls: string[] | null;
  tags?: string[] | null;
}

interface TradeCardProps {
  trade: Trade;
  onPress: (tradeId: string) => void;
  width?: number;
  showDescription?: boolean;
}

const { width: screenWidth } = Dimensions.get('window');
const defaultCardWidth = (screenWidth - 48) / 2;

export default function TradeCard({ trade, onPress, width = defaultCardWidth, showDescription = false }: TradeCardProps) {
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

  const getDotColor = (tradeOptions: string) => {
    if (tradeOptions === 'Sell') return '#ef4444';
    if (tradeOptions === 'Looking for') return '#22c55e';
    if (tradeOptions === 'Trade') return '#eab308';
    return '#9ca3af';
  };

  return (
    <TouchableOpacity 
      style={[styles.card, { width }]}
      onPress={() => onPress(trade.id)}
      activeOpacity={0.7}
    >
      {trade.image_urls && trade.image_urls.length > 0 ? (
        <Image 
          source={{ uri: trade.image_urls[0] }} 
          style={[styles.image, { height: width }]}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.image, { height: width }]}>
          <Ionicons name="image-outline" size={40} color="#9ca3af" />
        </View>
      )}
      
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>
          {trade.title || 'Untitled'}
        </Text>
        
        {showDescription && trade.description && (
          <Text style={styles.description} numberOfLines={2}>
            {trade.description}
          </Text>
        )}
        
        <View style={styles.priceContainer}>
          <View style={[styles.statusDot, { backgroundColor: getDotColor(trade.trade_options) }]} />
          <Text style={styles.price}>{formatPrice(trade)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
  image: {
    width: '100%',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    paddingHorizontal: 0,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
    lineHeight: 20,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  price: {
    fontSize: 12,
    color: '#6b7280',
  },
});