import { Platform, ViewStyle } from 'react-native';

interface ShadowProps {
  elevation?: number;
  shadowColor?: string;
  shadowOpacity?: number;
  shadowRadius?: number;
  shadowOffset?: {
    width: number;
    height: number;
  };
}

/**
 * Generate consistent shadow styles across the app.
 * Plain utility (not a React hook) — safe to call anywhere, including module scope.
 * @param options - Shadow configuration options
 * @returns Shadow style object for React Native components
 */
export const getShadow = (options?: ShadowProps): ViewStyle => {
  const {
    elevation = 5,
    shadowColor = '#000',
    shadowOpacity = 0.2,
    shadowRadius = 3.84,
    shadowOffset = {
      width: 0,
      height: 2,
    },
  } = options || {};

  // iOS shadows
  const iosShadow: ViewStyle = {
    shadowColor,
    shadowOpacity,
    shadowRadius,
    shadowOffset,
  };

  // Android elevation
  const androidShadow: ViewStyle = {
    elevation,
  };

  // Return platform-specific shadow styles
  return Platform.OS === 'ios' ? iosShadow : { ...iosShadow, ...androidShadow };
};

/**
 * @deprecated Use `getShadow` instead — kept as an alias for backwards compatibility.
 */
export const useShadow = getShadow;

/**
 * Preset shadow styles for common use cases
 */
export const shadowPresets = {
  small: getShadow({
    elevation: 3,
    shadowRadius: 2.5,
    shadowOffset: { width: 0, height: 1 },
  }),

  medium: getShadow({
    elevation: 8,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
  }),

  large: getShadow({
    elevation: 15,
    shadowRadius: 20.84,
    shadowColor: 'rgba(0, 0, 0, 0.2)',
    shadowOffset: { width: 0, height: 5 },
  }),

  card: getShadow({
    elevation: 4,
    shadowRadius: 3.84,
    shadowOffset: { width: 0, height: 2 },
  }),
};

export default getShadow;
