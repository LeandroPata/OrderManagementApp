import AsyncStorage from '@react-native-async-storage/async-storage';
import auth, { type FirebaseAuthTypes } from '@react-native-firebase/auth';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useEffect, useState } from 'react';
import { useColorScheme, View } from 'react-native';
import { EventRegister } from 'react-native-event-listeners';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ActivityIndicator, PaperProvider, Portal } from 'react-native-paper';
import '@/locales/i18n';
import { DialogProvider } from '@/context/DialogContext';
import { SnackbarProvider } from '@/context/SnackbarContext';
import { globalTheme } from '@/styles/global';

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

	const theme = colorScheme === 'dark' ? globalTheme.dark : globalTheme.light;

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
					<DialogProvider>
						<SnackbarProvider>
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
						</SnackbarProvider>
					</DialogProvider>
				</Portal.Host>
			</GestureHandlerRootView>
		</PaperProvider>
	);
}
