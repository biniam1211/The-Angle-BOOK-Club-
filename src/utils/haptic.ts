// Haptic Feedback Simulation for Web
// Provides iOS-like haptic feedback using Vibration API

type HapticStyle = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' | 'selection';

const hapticPatterns: Record<HapticStyle, number | number[]> = {
  light: 10,
  medium: 20,
  heavy: 30,
  success: [10, 50, 10],
  warning: [20, 100, 20],
  error: [30, 100, 30, 100, 30],
  selection: 5,
};

export class Haptic {
  private static isSupported = 'vibrate' in navigator;

  static impact(style: HapticStyle = 'medium') {
    if (!this.isSupported) return;

    const pattern = hapticPatterns[style];

    if (typeof pattern === 'number') {
      navigator.vibrate(pattern);
    } else {
      navigator.vibrate(pattern);
    }
  }

  static selection() {
    this.impact('selection');
  }

  static success() {
    this.impact('success');
  }

  static warning() {
    this.impact('warning');
  }

  static error() {
    this.impact('error');
  }

  static notificationSuccess() {
    navigator.vibrate([10, 50, 10, 50, 10]);
  }

  static notificationWarning() {
    navigator.vibrate([20, 100, 20]);
  }

  static notificationError() {
    navigator.vibrate([30, 100, 30, 100, 30]);
  }
}

// Usage:
// Haptic.impact('light') - Light tap
// Haptic.selection() - Selection feedback
// Haptic.success() - Success pattern
// Haptic.error() - Error pattern
