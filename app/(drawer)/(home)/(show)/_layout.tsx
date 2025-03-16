import React from 'react';
import { useTheme } from 'react-native-paper';
import { Stack } from 'expo-router';

const ShowLayout = () => {
	const theme = useTheme();

	return (
		<Stack
			screenOptions={{
				contentStyle: { backgroundColor: theme.colors.background },
			}}
		>
			<Stack.Screen
				name='showHome'
				options={{ headerShown: false }}
			/>
			<Stack.Screen
				name='showClientOrder'
				options={{ headerShown: false }}
			/>
			<Stack.Screen
				name='showProductOrder'
				options={{ headerShown: false }}
			/>
			<Stack.Screen
				name='showProductQuantity'
				options={{ headerShown: false }}
			/>
		</Stack>
	);
};

export default ShowLayout;
