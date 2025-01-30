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
						primary: 'rgb(150, 204, 255)',
						onPrimary: 'rgb(0, 51, 83)',
						primaryContainer: 'rgb(0, 74, 117)',
						onPrimaryContainer: 'rgb(206, 229, 255)',
						secondary: 'rgb(185, 200, 218)',
						onSecondary: 'rgb(35, 50, 64)',
						secondaryContainer: 'rgb(58, 72, 87)',
						onSecondaryContainer: 'rgb(213, 228, 247)',
						tertiary: 'rgb(165, 200, 255)',
						onTertiary: 'rgb(0, 49, 95)',
						tertiaryContainer: 'rgb(0, 71, 134)',
						onTertiaryContainer: 'rgb(212, 227, 255)',
						error: 'rgb(142, 0, 3)',
						onError: 'rgb(105, 0, 5)',
						errorContainer: 'rgb(147, 0, 10)',
						onErrorContainer: 'rgb(255, 255, 255)',
						background: 'rgb(26, 28, 30)',
						onBackground: 'rgb(226, 226, 229)',
						surface: 'rgb(26, 28, 30)',
						onSurface: 'rgb(226, 226, 229)',
						surfaceVariant: 'rgb(66, 71, 78)',
						onSurfaceVariant: 'rgb(194, 199, 207)',
						outline: 'rgb(140, 145, 152)',
						outlineVariant: 'rgb(66, 71, 78)',
						shadow: 'rgb(0, 0, 0)',
						scrim: 'rgb(0, 0, 0)',
						inverseSurface: 'rgb(226, 226, 229)',
						inverseOnSurface: 'rgb(47, 48, 51)',
						inversePrimary: 'rgb(0, 99, 154)',
						elevation: {
							level0: 'transparent',
							level1: 'rgb(32, 37, 41)',
							level2: 'rgb(36, 42, 48)',
							level3: 'rgb(40, 47, 55)',
							level4: 'rgb(41, 49, 57)',
							level5: 'rgb(43, 53, 62)',
						},
						surfaceDisabled: 'rgba(226, 226, 229, 0.12)',
						onSurfaceDisabled: 'rgba(226, 226, 229, 0.38)',
						backdrop: 'rgba(44, 49, 55, 0.4)',
					},
			  }
			: {
					...DefaultLightTheme,
					colors: {
						primary: 'rgb(0, 99, 154)',
						onPrimary: 'rgb(255, 255, 255)',
						primaryContainer: 'rgb(206, 229, 255)',
						onPrimaryContainer: 'rgb(0, 29, 50)',
						secondary: 'rgb(81, 96, 111)',
						onSecondary: 'rgb(255, 255, 255)',
						secondaryContainer: 'rgb(213, 228, 247)',
						onSecondaryContainer: 'rgb(14, 29, 42)',
						tertiary: 'rgb(0, 95, 175)',
						onTertiary: 'rgb(255, 255, 255)',
						tertiaryContainer: 'rgb(212, 227, 255)',
						onTertiaryContainer: 'rgb(0, 28, 58)',
						error: 'rgb(186, 26, 26)',
						onError: 'rgb(255, 255, 255)',
						errorContainer: 'rgb(255, 218, 214)',
						onErrorContainer: 'rgb(65, 0, 2)',
						background: 'rgb(252, 252, 255)',
						onBackground: 'rgb(26, 28, 30)',
						surface: 'rgb(252, 252, 255)',
						onSurface: 'rgb(26, 28, 30)',
						surfaceVariant: 'rgb(222, 227, 235)',
						onSurfaceVariant: 'rgb(66, 71, 78)',
						outline: 'rgb(114, 119, 127)',
						outlineVariant: 'rgb(194, 199, 207)',
						shadow: 'rgb(0, 0, 0)',
						scrim: 'rgb(0, 0, 0)',
						inverseSurface: 'rgb(47, 48, 51)',
						inverseOnSurface: 'rgb(240, 240, 244)',
						inversePrimary: 'rgb(150, 204, 255)',
						elevation: {
							level0: 'transparent',
							level1: 'rgb(239, 244, 250)',
							level2: 'rgb(232, 240, 247)',
							level3: 'rgb(224, 235, 244)',
							level4: 'rgb(222, 234, 243)',
							level5: 'rgb(217, 231, 241)',
						},
						surfaceDisabled: 'rgba(26, 28, 30, 0.12)',
						onSurfaceDisabled: 'rgba(26, 28, 30, 0.38)',
						backdrop: 'rgba(44, 49, 55, 0.4)',
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

		const inAuthGroup = segments[0] === '(drawer)';

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
