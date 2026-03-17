import * as Haptics from 'expo-haptics';

/**
 * Wrapper for expo haptics with graceful degradation
 */
export const useHaptic = () => {
  const trigger = async (style = 'light') => {
    try {
      const map = {
        light: Haptics.ImpactFeedbackStyle.Light,
        medium: Haptics.ImpactFeedbackStyle.Medium,
        heavy: Haptics.ImpactFeedbackStyle.Heavy,
        success: 'notification_success',
        error: 'notification_error',
      };
      const mapped = map[style];
      if (mapped === 'notification_success') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else if (mapped === 'notification_error') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } else {
        await Haptics.impactAsync(mapped || Haptics.ImpactFeedbackStyle.Light);
      }
    } catch {
      // Haptics not available (e.g. simulator, web)
    }
  };

  return { trigger };
};
