import React from 'react'
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useForgotPassword } from './use-forgot-password'
import { styles } from './styles'

export default function ForgotPasswordScreen() {
  const {
    email,
    error,
    isSubmitted,
    isSuccess,
    isLoading,
    setEmail,
    handleSubmit,
    handleBack,
  } = useForgotPassword()

  const emailError =
    isSubmitted && (!email || !email.includes('@')) ? 'Please enter a valid email address' : null

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={0.7}>
              <Text style={styles.backText}>← Back to Login</Text>
            </TouchableOpacity>

            <View style={styles.header}>
              <Text style={styles.title}>Forgot Password</Text>
              <Text style={styles.subtitle}>
                Enter your email address and we'll send you a new password.
              </Text>
            </View>

            <View style={styles.form}>
              {isSuccess ? (
                <View style={styles.successBanner}>
                  <Text style={styles.successTitle}>Email sent!</Text>
                  <Text style={styles.successText}>
                    A new password has been sent to {email}. Redirecting you to login...
                  </Text>
                </View>
              ) : (
                <>
                  <View style={styles.fieldGroup}>
                    <Text style={styles.label}>Email</Text>
                    <TextInput
                      style={[styles.input, emailError ? styles.inputError : null]}
                      placeholder="inspeksimobil@gmail.com"
                      placeholderTextColor="#9CA3AF"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      editable={!isLoading}
                    />
                    {emailError && <Text style={{ fontSize: 12, color: '#EF4444' }}>{emailError}</Text>}
                  </View>

                  {error && (
                    <View style={styles.errorBanner}>
                      <Text style={styles.errorBannerText}>{error}</Text>
                    </View>
                  )}

                  <TouchableOpacity
                    style={[styles.button, isLoading && styles.buttonDisabled]}
                    onPress={handleSubmit}
                    disabled={isLoading}
                    activeOpacity={0.8}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <Text style={styles.buttonText}>Send New Password</Text>
                    )}
                  </TouchableOpacity>
                </>
              )}
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
