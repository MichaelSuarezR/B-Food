import React from 'react';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface BottomNavigationProps {
  activeTab: 'order' | 'deliver';
  onOrderPress: () => void;
  onDeliverPress: () => void;
  darkMode?: boolean;
}

export default function BottomNavigation({
  activeTab,
  onOrderPress,
  onDeliverPress,
  darkMode = false,
}: BottomNavigationProps) {
  const backgroundColor = darkMode ? '#111827' : '#ffffff';
  const borderColor = darkMode ? '#1f2937' : '#e5e7eb';
  const activeColor = darkMode ? '#facc15' : '#1d4ed8';
  const inactiveColor = darkMode ? '#94a3b8' : '#6b7280';

  const renderNavItem = (
    icon: keyof typeof Ionicons.glyphMap,
    label: string,
    isActive: boolean,
    onPress: () => void,
  ) => (
    <TouchableOpacity style={styles.navItem} onPress={onPress}>
      <View
        style={[
          styles.navIconWrap,
          isActive && { backgroundColor: `${activeColor}20` },
        ]}
      >
        <Ionicons
          name={icon}
          size={26}
          color={isActive ? activeColor : inactiveColor}
        />
      </View>
      <Text style={[styles.navLabel, { color: isActive ? activeColor : inactiveColor }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.bottomNav, { backgroundColor, borderTopColor: borderColor }]}>
      {renderNavItem('fast-food', 'Order', activeTab === 'order', onOrderPress)}
      {renderNavItem('bicycle', 'Deliver', activeTab === 'deliver', onDeliverPress)}
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingVertical: 10,
    paddingBottom: 28,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  navIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
});
