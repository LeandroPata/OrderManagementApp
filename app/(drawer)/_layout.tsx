import React from 'react';
import { Keyboard, TouchableOpacity, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Drawer } from 'expo-router/drawer';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import CustomDrawerContent from '@/components/CustomDrawerContent';

const DrawerLayout = () => {
	const theme = useTheme();
	const insets = useSafeAreaInsets();
	const { t } = useTranslation();

	return (
		<Drawer
			drawerContent={(props) => <CustomDrawerContent {...props} />}
			screenOptions={{
				headerStyle: {
					backgroundColor: theme.colors.background,
				},
				headerTitleStyle: { color: theme.colors.onBackground },
				headerShadowVisible: false,
				header: ({ navigation }) => (
					<View
						style={{
							paddingTop: insets.top,
							paddingHorizontal: 5,
						}}
					>
						<TouchableOpacity
							onPress={() => {
								Keyboard.dismiss();
								navigation.toggleDrawer();
							}}
							style={{ maxWidth: 36 }}
						>
							<Ionicons
								name='menu'
								size={45}
								color={theme.colors.onBackground}
								style={{ alignSelf: 'center' }}
							/>
						</TouchableOpacity>
					</View>
				),
				sceneStyle: {
					backgroundColor: theme.colors.background,
				},
				drawerStyle: {
					backgroundColor: theme.colors.background,
					paddingTop: insets.top,
				},
				drawerLabelStyle: { fontSize: 15, fontWeight: 'bold' },
				drawerActiveTintColor: theme.colors.primary,
				drawerInactiveTintColor: theme.colors.onBackground,
				drawerInactiveBackgroundColor: 'transparent',
			}}
		/>
	);
};

export default DrawerLayout;
