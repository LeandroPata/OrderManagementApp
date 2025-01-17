import React from 'react';
import { useTheme } from 'react-native-paper';
import { Stack } from 'expo-router';

const AddLayout = () => {
	const theme = useTheme();
	return (
		<Stack
			screenOptions={{
				contentStyle: { backgroundColor: theme.colors.background },
			}}
		>
			<Stack.Screen
				name='addHome'
				options={{ headerShown: false }}
			/>
			<Stack.Screen
				name='addClient'
				options={{ headerShown: false }}
			/>
			<Stack.Screen
				name='addProduct'
				options={{ headerShown: false }}
			/>
			<Stack.Screen
				name='addOrder'
				options={{ headerShown: false }}
			/>
		</Stack>
	);
};

export default AddLayout;
