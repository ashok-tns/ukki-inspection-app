import { Tabs } from 'expo-router'
//import { Redirect, Tabs } from 'expo-router'
// import { useContext } from 'react'
// import { AuthContext } from '@/provider/auth-provider'

export default function TabLayout() {
	// const { isAuthenticated } = useContext(AuthContext)

	// if (!isAuthenticated) {
	// 	return <Redirect href="/(auth)/login" />
	// }

	return (
		<Tabs
			screenOptions={{
				tabBarActiveTintColor: '#eaeaea',
				headerShown: false,
			}}
		>
			<Tabs.Screen
				name="index"
				options={{
					title: 'Home',
				}}
			/>
		</Tabs>
	)
}
