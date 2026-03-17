import { StyleSheet } from 'react-native';
import colors from './colors';
import { radii, shadows, spacing } from './tokens';

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.glass,
    borderRadius: radii.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    ...shadows.glass,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
  buttonSecondary: {
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  buttonSecondaryText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    backgroundColor: 'rgba(255, 248, 230, 0.06)',
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: radii.sm,
    padding: spacing.md,
    fontSize: 16,
    color: colors.text,
  },
});

export { colors };
