import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';
import { Button } from './Button';

interface LoginPromptBottomSheetProps {
  isVisible: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  actionText?: string;
}

const { height: screenHeight } = Dimensions.get('window');

export const LoginPromptBottomSheet: React.FC<LoginPromptBottomSheetProps> = ({
  isVisible,
  onClose,
  title = 'Login Required',
  message = 'Please login to continue with your checkout. Join thousands of satisfied customers!',
  actionText = 'Login to Continue',
}) => {
  const router = useRouter();
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      return Math.abs(gestureState.dy) > 20;
    },
    onPanResponderMove: (evt, gestureState) => {
      if (gestureState.dy > 0) {
        slideAnim.setValue(Math.max(0, gestureState.dy));
      }
    },
    onPanResponderRelease: (evt, gestureState) => {
      if (gestureState.dy > 100 || gestureState.vy > 0.5) {
        hideBottomSheet();
      } else {
        showBottomSheet();
      }
    },
  });

  const showBottomSheet = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0.5,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const hideBottomSheet = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: screenHeight,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  useEffect(() => {
    if (isVisible) {
      showBottomSheet();
    } else {
      slideAnim.setValue(screenHeight);
      backdropOpacity.setValue(0);
    }
  }, [isVisible]);

  const handleLogin = () => {
    hideBottomSheet();
    setTimeout(() => {
      router.push('/login');
    }, 100);
  };

  const handleSignup = () => {
    hideBottomSheet();
    setTimeout(() => {
      router.push('/register');
    }, 100);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <Modal
      transparent
      visible={isVisible}
      animationType="none"
      onRequestClose={hideBottomSheet}
    >
      <View style={styles.modalContainer}>
        <TouchableWithoutFeedback onPress={hideBottomSheet}>
          <Animated.View
            style={[
              styles.backdrop,
              {
                opacity: backdropOpacity,
              },
            ]}
          />
        </TouchableWithoutFeedback>
        
        <Animated.View
          style={[
            styles.bottomSheet,
            {
              transform: [{ translateY: slideAnim }],
            },
          ]}
          {...panResponder.panHandlers}
        >
          {/* Handle */}
          <View style={styles.handle} />

          {/* Content */}
          <View style={styles.content}>
            {/* Icon */}
            <View style={styles.iconContainer}>
              <Ionicons name="person-circle" size={60} color={theme.colors.primary[600]} />
            </View>

            {/* Title */}
            <Text style={styles.title}>{title}</Text>

            {/* Message */}
            <Text style={styles.message}>{message}</Text>

            {/* Benefits */}
            <View style={styles.benefitsContainer}>
              <View style={styles.benefit}>
                <Ionicons name="checkmark-circle" size={20} color={theme.colors.success[600]} />
                <Text style={styles.benefitText}>Faster checkout process</Text>
              </View>
              <View style={styles.benefit}>
                <Ionicons name="checkmark-circle" size={20} color={theme.colors.success[600]} />
                <Text style={styles.benefitText}>Order tracking & history</Text>
              </View>
              <View style={styles.benefit}>
                <Ionicons name="checkmark-circle" size={20} color={theme.colors.success[600]} />
                <Text style={styles.benefitText}>Exclusive member discounts</Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <Button
                title={actionText}
                onPress={handleLogin}
                variant="primary"
                size="lg"
                fullWidth
              />
              
              <TouchableOpacity style={styles.secondaryButton} onPress={handleSignup}>
                <Text style={styles.secondaryButtonText}>Don't have an account? Sign up</Text>
              </TouchableOpacity>
            </View>

            {/* Skip option */}
            <TouchableOpacity style={styles.skipButton} onPress={hideBottomSheet}>
              <Text style={styles.skipButtonText}>Maybe later</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'black',
  },
  bottomSheet: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34, // Safe area padding
    maxHeight: screenHeight * 0.8,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: theme.colors.gray[300],
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  content: {
    paddingHorizontal: theme.spacing.xl,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: theme.typography.sizes['2xl'],
    fontWeight: '700' as any,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  message: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: theme.spacing.xl,
  },
  benefitsContainer: {
    marginBottom: theme.spacing.xl,
  },
  benefit: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  benefitText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.primary,
    marginLeft: theme.spacing.md,
  },
  buttonContainer: {
    marginBottom: theme.spacing.lg,
  },
  secondaryButton: {
    paddingVertical: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  secondaryButtonText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.primary[600],
    textAlign: 'center',
    fontWeight: '600' as any,
  },
  skipButton: {
    paddingVertical: theme.spacing.sm,
  },
  skipButtonText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
}); 