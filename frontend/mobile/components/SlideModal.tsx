import React, { useEffect, useRef } from 'react';
import { Modal, Animated, Dimensions } from 'react-native';

interface SlideModalProps {
  visible: boolean;
  children: React.ReactNode;
  onRequestClose?: () => void;
}

const { width } = Dimensions.get('window');

export default function SlideModal({ visible, children, onRequestClose }: SlideModalProps) {
  const slideAnim = useRef(new Animated.Value(width)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: width,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim]);

  return (
    <Modal
      visible={visible}
      animationType="none"
      presentationStyle="overFullScreen"
      onRequestClose={onRequestClose}
      transparent={false}
    >
      <Animated.View
        style={{
          flex: 1,
          transform: [{ translateX: slideAnim }],
        }}
      >
        {children}
      </Animated.View>
    </Modal>
  );
}