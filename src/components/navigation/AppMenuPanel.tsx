import { usePathname } from 'expo-router';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BackHandler, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useMenuPanel } from '../../contexts/MenuPanelContext';
import { useTheme } from '../../contexts/ThemeContext';
import AppMenuPanelContent from './AppMenuPanelContent';

const EDGE_HIT_WIDTH = 28;
const OPEN_DISTANCE_RATIO = 0.25;
const SWIPE_VELOCITY = 450;
const ANIMATION_DURATION = 220;

function clamp(value: number, min: number, max: number) {
  'worklet';

  return Math.min(Math.max(value, min), max);
}

export default function AppMenuPanel() {
  const { isOpen, openMenu, closeMenu } = useMenuPanel();
  const { palette } = useTheme();
  const { t } = useTranslation();
  const pathname = usePathname();
  const { width: screenWidth } = useWindowDimensions();
  const isMenuDisabled = pathname.endsWith('/rename-chat') || pathname.endsWith('/edit-quiz-item');
  const panelWidth = Math.max(screenWidth, 1);
  const translateX = useSharedValue(-panelWidth);
  const dragStartX = useSharedValue(-panelWidth);

  useEffect(() => {
    translateX.value = withTiming(isOpen ? 0 : -panelWidth, { duration: ANIMATION_DURATION });
  }, [isOpen, panelWidth, translateX]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      closeMenu();
      return true;
    });

    return () => subscription.remove();
  }, [closeMenu, isOpen]);

  useEffect(() => {
    if (isMenuDisabled) closeMenu();
  }, [closeMenu, isMenuDisabled]);

  const openGesture = Gesture.Pan()
    .enabled(!isOpen && !isMenuDisabled)
    .activeOffsetX([-8, 8])
    .failOffsetY([-12, 12])
    .onBegin(() => {
      dragStartX.value = translateX.value;
    })
    .onUpdate((event) => {
      translateX.value = clamp(dragStartX.value + event.translationX, -panelWidth, 0);
    })
    .onEnd((event) => {
      const shouldOpen = event.translationX > panelWidth * OPEN_DISTANCE_RATIO || event.velocityX > SWIPE_VELOCITY;
      runOnJS(shouldOpen ? openMenu : closeMenu)();
    });

  const closeGesture = Gesture.Pan()
    .enabled(isOpen)
    .activeOffsetX([-8, 8])
    .failOffsetY([-12, 12])
    .onBegin(() => {
      dragStartX.value = translateX.value;
    })
    .onUpdate((event) => {
      translateX.value = clamp(dragStartX.value + event.translationX, -panelWidth, 0);
    })
    .onEnd((event) => {
      const shouldClose = event.translationX < -panelWidth * OPEN_DISTANCE_RATIO || event.velocityX < -SWIPE_VELOCITY;
      runOnJS(shouldClose ? closeMenu : openMenu)();
    });

  const panelAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const backdropAnimatedStyle = useAnimatedStyle(() => {
    const progress = interpolate(translateX.value, [-panelWidth, 0], [0, 1], 'clamp');

    return {
      opacity: progress * 0.28,
    };
  });

  if (isMenuDisabled) return null;

  return (
    <>
      <Animated.View
        pointerEvents={isOpen ? 'auto' : 'none'}
        style={[styles.backdrop, { backgroundColor: palette.text }, backdropAnimatedStyle]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('menu.close')}
          onPress={closeMenu}
          style={styles.fill}
        />
      </Animated.View>
      <GestureDetector gesture={closeGesture}>
        <Animated.View
          accessibilityViewIsModal={isOpen}
          pointerEvents={isOpen ? 'auto' : 'none'}
          style={[
            styles.panel,
            {
              width: panelWidth,
              backgroundColor: palette.background,
              borderRightColor: palette.border,
            },
            panelAnimatedStyle,
          ]}
        >
          <AppMenuPanelContent isOpen={isOpen} onClose={closeMenu} />
        </Animated.View>
      </GestureDetector>
      <GestureDetector gesture={openGesture}>
        <View pointerEvents={isOpen ? 'none' : 'auto'} style={styles.edgeHitArea} />
      </GestureDetector>
    </>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 20,
  },
  panel: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    zIndex: 30,
    borderRightWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  edgeHitArea: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: EDGE_HIT_WIDTH,
    zIndex: 10,
  },
});
