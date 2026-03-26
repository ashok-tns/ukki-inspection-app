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
import { useRouter } from 'expo-router'
import { styles } from './styles'
import { useLogin } from './use-login'

export default function LoginScreen() {
	const { email, error, isLoading, isSubmitted, setEmail, password, setPassword, handleSubmit } = useLogin()
	const router = useRouter()

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
						<View style={styles.header}>
							<Text style={styles.title}>Login</Text>
						</View>

						<View style={styles.form}>
							<View style={styles.fieldGroup}>
								<Text style={styles.label}>Email</Text>
								<TextInput
									style={[styles.input]}
									placeholder="inspeksimobil@gmail.com"
									placeholderTextColor="#9CA3AF"
									value={email}
									onChangeText={setEmail}
									keyboardType="email-address"
									autoCapitalize="none"
									autoCorrect={false}
									editable={!isLoading}
								/>
							</View>

							<View style={styles.fieldGroup}>
								<Text style={styles.label}>Password</Text>
								
                <TextInput
									style={[styles.input]}
									placeholder=""
									placeholderTextColor="#9CA3AF"
									value={password}
									onChangeText={setPassword}
									keyboardType="default"
									autoCapitalize="none"
									autoCorrect={false}
									secureTextEntry
									editable={!isLoading}
								/>
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
									<Text style={styles.buttonText}>Login</Text>
								)}
							</TouchableOpacity>

							<TouchableOpacity
								onPress={() => router.push('/(auth)/forgot-password')}
								activeOpacity={0.7}
								style={styles.forgotButton}
							>
								<Text style={styles.forgotText}>Forgot Password?</Text>
							</TouchableOpacity>
						</View>
					</ScrollView>
				</TouchableWithoutFeedback>
			</KeyboardAvoidingView>
		</SafeAreaView>
	)
}
