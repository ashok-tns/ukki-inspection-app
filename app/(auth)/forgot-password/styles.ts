import { StyleSheet } from 'react-native'

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 32,
    alignSelf: 'flex-start',
  },
  backText: {
    fontSize: 15,
    color: '#3B82F6',
    fontWeight: '500',
  },
  header: {
    marginBottom: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1A1A2E',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  form: {
    gap: 24,
    marginTop: 32,
  },
  fieldGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  input: {
    height: 52,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#1A1A2E',
  },
  inputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  errorBanner: {
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
    padding: 12,
  },
  errorBannerText: {
    fontSize: 13,
    color: '#DC2626',
    fontWeight: '500',
  },
  successBanner: {
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#22C55E',
    padding: 16,
    gap: 4,
  },
  successTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#15803D',
  },
  successText: {
    fontSize: 13,
    color: '#166534',
    lineHeight: 18,
  },
  button: {
    height: 52,
    borderRadius: 10,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
})
