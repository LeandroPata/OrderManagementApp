import React from 'react';
import { useTheme } from 'react-native-paper';
import { Stack } from 'expo-router';

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
