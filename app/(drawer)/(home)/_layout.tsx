import { Stack } from 'expo-router';
import { useTheme } from 'react-native-paper';

const HomeLayout = () => {
	const theme = useTheme();

	return (
		<Stack
			screenOptions={{
				contentStyle: { backgroundColor: theme.colors.background },
			}}
		>
			<Stack.Screen
				name='home'
				options={{ headerShown: false }}
			/>
			<Stack.Screen
				name='(add)'
				options={{ headerShown: false }}
			/>
			<Stack.Screen
				name='(show)'
				options={{ headerShown: false }}
			/>
			<Stack.Screen
				name='importExport'
				options={{ headerShown: false }}
			/>
		</Stack>
	);
};

export default HomeLayout;
