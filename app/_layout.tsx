import { useEffect, useState } from 'react';
import { useColorScheme, View } from 'react-native';
import {
	PaperProvider,
	Portal,
	ActivityIndicator,
	MD3LightTheme as DefaultLightTheme,
	MD3DarkTheme as DefaultDarkTheme,
} from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import auth, { type FirebaseAuthTypes } from '@react-native-firebase/auth';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SystemUI from 'expo-system-ui';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { EventRegister } from 'react-native-event-listeners';
import '@/locales/i18n';

export default function RootLayout() {
	const router = useRouter();
	const segments = useSegments();
	const currentColorScheme = useColorScheme();

	const [initializing, setInitializing] = useState(true);
	const [user, setUser] = useState<FirebaseAuthTypes.User | null>();

	const [colorScheme, setColorScheme] = useState('');
	//console.log(colorScheme);

	if (!colorScheme) {
		AsyncStorage.getItem('colorScheme').then((token) => {
			//console.log('Token: ' + token);
			if (token) setColorScheme(token);
			else {
				setColorScheme(currentColorScheme);
				AsyncStorage.setItem('colorScheme', currentColorScheme).then((token) =>
					console.log(`Done: ${token}`)
				);
			}
		});
	}

	const theme =
		colorScheme === 'dark'
			? {
					...DefaultDarkTheme,
					colors: {
						primary: 'rgb(255, 180, 172)',
						onPrimary: 'rgb(96, 18, 17)',
						primaryContainer: 'rgb(127, 41, 36)',
						onPrimaryContainer: 'rgb(255, 218, 214)',
						secondary: 'rgb(231, 189, 184)',
						onSecondary: 'rgb(68, 41, 39)',
						secondaryContainer: 'rgb(93, 63, 60)',
						onSecondaryContainer: 'rgb(255, 218, 214)',
						tertiary: 'rgb(224, 195, 140)',
						onTertiary: 'rgb(63, 45, 4)',
						tertiaryContainer: 'rgb(88, 68, 25)',
						onTertiaryContainer: 'rgb(254, 223, 166)',
						error: 'rgb(142, 0, 3)',
						onError: 'rgb(105, 0, 5)',
						errorContainer: 'rgb(147, 0, 10)',
						onErrorContainer: 'rgb(255, 255, 255)',
						background: 'rgb(25, 25, 24)',
						onBackground: 'rgb(237, 224, 222)',
						surface: 'rgb(32, 26, 25)',
						onSurface: 'rgb(237, 224, 222)',
						surfaceVariant: 'rgb(83, 67, 65)',
						onSurfaceVariant: 'rgb(216, 194, 191)',
						outline: 'rgb(160, 140, 138)',
						outlineVariant: 'rgb(83, 67, 65)',
						shadow: 'rgb(0, 0, 0)',
						scrim: 'rgb(0, 0, 0)',
						inverseSurface: 'rgb(237, 224, 222)',
						inverseOnSurface: 'rgb(54, 47, 46)',
						inversePrimary: 'rgb(158, 64, 57)',
						elevation: {
							level0: 'transparent',
							level1: 'rgb(43, 34, 32)',
							level2: 'rgb(50, 38, 37)',
							level3: 'rgb(57, 43, 41)',
							level4: 'rgb(59, 45, 43)',
							level5: 'rgb(63, 48, 46)',
						},
						surfaceDisabled: 'rgba(237, 224, 222, 0.12)',
						onSurfaceDisabled: 'rgb(237, 224, 222)',
						backdrop: 'rgba(59, 45, 43, 0.4)',
					},
			  }
			: {
					...DefaultLightTheme,
					colors: {
						primary: 'rgb(157, 65, 57)',
						onPrimary: 'rgb(255, 255, 255)',
						primaryContainer: 'rgb(255, 218, 214)',
						onPrimaryContainer: 'rgb(65, 0, 2)',
						secondary: 'rgb(119, 86, 82)',
						onSecondary: 'rgb(255, 255, 255)',
						secondaryContainer: 'rgb(255, 218, 214)',
						onSecondaryContainer: 'rgb(44, 21, 19)',
						tertiary: 'rgb(113, 91, 46)',
						onTertiary: 'rgb(255, 255, 255)',
						tertiaryContainer: 'rgb(253, 223, 166)',
						onTertiaryContainer: 'rgb(38, 25, 0)',
						error: 'rgb(186, 26, 26)',
						onError: 'rgb(255, 255, 255)',
						errorContainer: 'rgb(255, 218, 214)',
						onErrorContainer: 'rgb(65, 0, 2)',
						background: 'rgb(255, 251, 255)',
						onBackground: 'rgb(32, 26, 25)',
						surface: 'rgb(255, 251, 255)',
						onSurface: 'rgb(32, 26, 25)',
						surfaceVariant: 'rgb(245, 221, 218)',
						onSurfaceVariant: 'rgb(83, 67, 65)',
						outline: 'rgb(133, 115, 113)',
						outlineVariant: 'rgb(216, 194, 191)',
						shadow: 'rgb(0, 0, 0)',
						scrim: 'rgb(0, 0, 0)',
						inverseSurface: 'rgb(54, 47, 46)',
						inverseOnSurface: 'rgb(251, 238, 236)',
						inversePrimary: 'rgb(255, 180, 171)',
						elevation: {
							level0: 'transparent',
							level1: 'rgb(250, 242, 245)',
							level2: 'rgb(247, 236, 239)',
							level3: 'rgb(244, 231, 233)',
							level4: 'rgb(243, 229, 231)',
							level5: 'rgb(241, 225, 227)',
						},
						surfaceDisabled: 'rgba(32, 26, 25, 0.12)',
						onSurfaceDisabled: 'rgb(32, 26, 25)',
						backdrop: 'rgba(59, 45, 43, 0.4)',
					},
			  };

	const onAuthStateChanged = (user: FirebaseAuthTypes.User | null) => {
		//console.log('onAuthStateChanged', user);
		setUser(user);
		if (initializing) setInitializing(false);
	};

	useEffect(() => {
		const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
		return subscriber;
	}, []);

	useEffect(() => {
		if (initializing) return;

		const inAuthGroup = segments[0] === '(home)';

		if (user && !inAuthGroup) {
			router.replace('/(drawer)/(home)/home');
		} else if (!user && inAuthGroup) {
			router.replace('/');
		}
	}, [user, initializing]);

	useEffect(() => {
		const eventListener: string = EventRegister.addEventListener(
			'updateTheme',
			(data) => setColorScheme(data)
		);
		return () => EventRegister.removeEventListener(eventListener);
	});

	useEffect(() => {
		//console.log(colorScheme);
		SystemUI.setBackgroundColorAsync(theme.colors.background);
	}, [theme.colors.background, colorScheme]);

	if (initializing)
		return (
			<View
				style={{
					alignItems: 'center',
					justifyContent: 'center',
					flex: 1,
				}}
			>
				<ActivityIndicator
					size={75}
					color={theme.colors.primary}
				/>
			</View>
		);

	return (
		<PaperProvider theme={theme}>
			<GestureHandlerRootView style={{ flex: 1 }}>
				<Portal.Host>
					<StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
					<Stack
						screenOptions={{
							contentStyle: { backgroundColor: theme.colors.background },
						}}
					>
						<Stack.Screen
							name='index'
							options={{ headerShown: false }}
						/>
						<Stack.Screen
							name='(drawer)'
							options={{ headerShown: false }}
						/>
					</Stack>
				</Portal.Host>
			</GestureHandlerRootView>
		</PaperProvider>
	);
}
