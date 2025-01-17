import React, { useState } from 'react';
import {
	Platform,
	UIManager,
	View,
	StyleSheet,
	TouchableOpacity,
	Linking,
} from 'react-native';
import {
	Dialog,
	List,
	Portal,
	ProgressBar,
	Switch,
	useTheme,
} from 'react-native-paper';
import {
	DrawerContentScrollView,
	DrawerItem,
	DrawerItemList,
} from '@react-navigation/drawer';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import auth from '@react-native-firebase/auth';
import { useTranslation } from 'react-i18next';
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withTiming,
} from 'react-native-reanimated';
import { EventRegister } from 'react-native-event-listeners';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { FirebaseError } from 'firebase/app';
import storage from '@react-native-firebase/storage';
import i18next from 'i18next';
import RNFetchBlob from 'rn-fetch-blob';
import Constants from 'expo-constants';
import getFlagEmoji from './GetCountryFlag';
import SnackbarInfo from './SnackbarInfo';
import DialogConfirmation from './DialogConfirmation';
import { router, usePathname } from 'expo-router';

export default function CustomDrawerContent(props: any) {
	const theme = useTheme();
	const insets = useSafeAreaInsets();
	const { t } = useTranslation();

	const [currentRoute, setCurrentRoute] = useState(usePathname());

	const [expanded, setExpanded] = useState(false);
	const [darkModeSwitch, setDarkModeSwitch] = useState(false);

	const [updateVersion, setUpdateVersion] = useState('');
	const [updateDownloadProgressVisible, setUpdateDownloadProgressVisible] =
		useState(false);
	const [updateDownloadProgress, setUpdateDownloadProgress] = useState(1);

	// All the logic to implement the snackbar
	const [snackbarVisible, setSnackbarVisible] = useState(false);
	const [snackbarText, setSnackbarText] = useState('');

	const showSnackbar = (text: string) => {
		setSnackbarText(text);
		setSnackbarVisible(true);
	};
	const onDismissSnackbar = () => setSnackbarVisible(false);

	// All the logic to implemet DialogConfirmation
	const [checkUpdateConfirmationVisible, setCheckUpdateConfirmationVisible] =
		useState(false);
	const [runUpdateConfirmationVisible, setRunUpdateConfirmationVisible] =
		useState(false);
	const [signOutConfirmationVisible, setSignOutConfirmationVisible] =
		useState(false);
	const onDismissDialogConfirmation = () => {
		setCheckUpdateConfirmationVisible(false);
		setRunUpdateConfirmationVisible(false);
		setSignOutConfirmationVisible(false);
	};

	AsyncStorage.getItem('colorScheme').then((token) => {
		token === 'dark' ? setDarkModeSwitch(true) : setDarkModeSwitch(false);
	});

	const height = useSharedValue(0); // Animated height value

	if (Platform.OS === 'android') {
		// Enable LayoutAnimation for Android
		UIManager.setLayoutAnimationEnabledExperimental?.(true);
	}

	const toggleAccordion = () => {
		setExpanded((prev) => !prev);
		height.value = expanded ? withTiming(0) : withTiming(120);
	};

	const animatedStyle = useAnimatedStyle(() => ({
		height: height.value,
	}));

	const changeColorScheme = async () => {
		setDarkModeSwitch(!darkModeSwitch);
		const darkMode = !darkModeSwitch;
		if (darkMode) {
			EventRegister.emit('updateTheme', 'dark');
			AsyncStorage.setItem('colorScheme', 'dark');
		} else {
			EventRegister.emit('updateTheme', 'light');
			AsyncStorage.setItem('colorScheme', 'light');
		}

		console.log(darkMode);
	};

	const compareVersions = (newVersion: string) => {
		const currentVersionNumber = Constants.expoConfig?.version
			?.split('.')
			.map(Number) || [0, 0, 0];
		const newVersionNumber = newVersion.split('.').map(Number);
		//console.log('Initial: ' + currentVersionNumber + ' : ' + newVersionNumber);

		for (
			let i = 0;
			i < Math.max(currentVersionNumber.length, newVersionNumber.length);
			i++
		) {
			//console.log(currentVersionNumber[i] + ' : ' + newVersionNumber[i]);
			if (currentVersionNumber[i] < newVersionNumber[i]) {
				//console.log('Newer Version');
				return true;
			} else if (currentVersionNumber[i] > newVersionNumber[i]) {
				//console.log('Older Version');
				return false;
			}
		}
		//console.log('Same Version');
		return false;
	};

	const checkUpdates = async () => {
		setCheckUpdateConfirmationVisible(false);
		setUpdateDownloadProgress(0);

		const updatesStorageRef = storage().ref('updates');
		let update = false;

		await updatesStorageRef
			.listAll()
			.then((result) => {
				for (const ref of result.prefixes) {
					if (compareVersions(ref.name)) {
						update = true;
						setUpdateVersion(ref.name);
						console.log(ref.name);
					}
				}
			})
			.catch((e: any) => {
				const err = e as FirebaseError;
				console.log(`Update checking error: ${err.message}`);
			})
			.finally(() => {
				if (update) {
					console.log('Do update?');

					setRunUpdateConfirmationVisible(true);
				} else console.log('No update');
			});
	};

	const downloadUpdate = async (updateFolderName: string) => {
		setRunUpdateConfirmationVisible(false);

		console.log(`Downloading update: ${updateFolderName}`);

		let updateFileName = '';

		await storage()
			.ref(`updates/${updateFolderName}`)
			.listAll()
			.then((result) => {
				for (const ref of result.items) {
					if (ref.name.endsWith('.apk')) {
						updateFileName = ref.name;
					}
				}
			});

		const updateStorageRef = storage().ref(
			`updates/${updateFolderName}/${updateFileName}`
		);

		console.log(`updates/${updateFolderName}/${updateFileName}`);

		const apkPath = `${RNFetchBlob.fs.dirs.DownloadDir}/${updateFolderName}`;

		const task = updateStorageRef.writeToFile(apkPath);
		setUpdateDownloadProgressVisible(true);

		task.on('state_changed', (taskSnapshot) => {
			const downloadProgress =
				(taskSnapshot.bytesTransferred * 100) / taskSnapshot.totalBytes / 100;
			setUpdateDownloadProgress(Number(downloadProgress.toFixed(2)));
			console.log(Number(downloadProgress.toFixed(2)));
		});

		await task
			.then(() => {
				setUpdateDownloadProgressVisible(false);
				console.log('Update Downloaded!');
				installUpdate(apkPath);
			})
			.catch((e: any) => {
				const err = e as FirebaseError;
				console.log(`Update download failed: ${err.message}`);
				setUpdateDownloadProgressVisible(false);
			});
	};

	const installUpdate = async (apkPath: string) => {
		setUpdateDownloadProgressVisible(false);
		console.log(`Installing: ${apkPath}`);
		try {
			await RNFetchBlob.android.actionViewIntent(
				apkPath,
				'application/vnd.android.package-archive'
			);
		} catch (e: any) {
			console.log(`Installing apk failed: ${e}`);
		} finally {
			console.log('Finished');
		}
	};

	const drawerItemPress = (goToPathName: string) => {
		props.navigation.closeDrawer();
		setCurrentRoute(goToPathName);
		router.replace(goToPathName);
	};

	return (
		<>
			<SnackbarInfo
				text={snackbarText}
				visible={snackbarVisible}
				onDismiss={onDismissSnackbar}
			/>
			<View style={{ flex: 1 }}>
				<DialogConfirmation
					text={t('drawer.checkUpdateDialog')}
					visible={checkUpdateConfirmationVisible}
					onDismiss={onDismissDialogConfirmation}
					onConfirmation={checkUpdates}
				/>

				<DialogConfirmation
					text={t('drawer.runUpdateDialog')}
					visible={runUpdateConfirmationVisible}
					onDismiss={onDismissDialogConfirmation}
					onConfirmation={() => downloadUpdate(updateVersion)}
				/>

				<DialogConfirmation
					text={t('drawer.signOutDialog')}
					visible={signOutConfirmationVisible}
					onDismiss={onDismissDialogConfirmation}
					onConfirmation={() => {
						setSignOutConfirmationVisible(false);
						auth().signOut();
					}}
				/>

				<Portal>
					<Dialog visible={updateDownloadProgressVisible}>
						<Dialog.Title style={{ textAlign: 'center' }}>
							{t('drawer.downloadingDialog')}
						</Dialog.Title>
						<Dialog.Content>
							<ProgressBar
								progress={updateDownloadProgress}
								color={theme.colors.primary}
							/>
						</Dialog.Content>
					</Dialog>
				</Portal>

				<DrawerContentScrollView
					{...props}
					scrollEnabled={false}
				>
					<DrawerItem
						labelStyle={{ fontSize: 15, fontWeight: 'bold' }}
						label='Home Menu'
						icon={({ focused, size, color }) => (
							<Ionicons
								name={focused ? 'home' : 'home-outline'}
								size={size}
								color={color}
							/>
						)}
						inactiveTintColor={theme.colors.onBackground}
						activeTintColor={theme.colors.primary}
						inactiveBackgroundColor='transparent'
						focused={currentRoute === '/(drawer)/(home)/home'}
						onPress={() => drawerItemPress('/(drawer)/(home)/home')}
					/>
					<DrawerItem
						labelStyle={{ fontSize: 15, fontWeight: 'bold' }}
						label='Add Menu'
						icon={({ focused, size, color }) => (
							<Ionicons
								name={focused ? 'person-add' : 'person-add-outline'}
								size={size}
								color={color}
							/>
						)}
						inactiveTintColor={theme.colors.onBackground}
						activeTintColor={theme.colors.primary}
						inactiveBackgroundColor='transparent'
						focused={currentRoute === '/(drawer)/(home)/(add)/addHome'}
						onPress={() => drawerItemPress('/(drawer)/(home)/(add)/addHome')}
					/>
					<DrawerItem
						labelStyle={{ fontSize: 15, fontWeight: 'bold' }}
						label='Show Menu'
						icon={({ focused, size, color }) => (
							<Ionicons
								name={focused ? 'search' : 'search-outline'}
								size={size}
								color={color}
							/>
						)}
						inactiveTintColor={theme.colors.onBackground}
						activeTintColor={theme.colors.primary}
						inactiveBackgroundColor='transparent'
						focused={currentRoute === '/(drawer)/(home)/(show)/showHome'}
						onPress={() => drawerItemPress('/(drawer)/(home)/(show)/showHome')}
					/>
					<DrawerItem
						labelStyle={{ fontSize: 15, fontWeight: 'bold' }}
						label='Import/Export'
						icon={({ focused, size, color }) => (
							<Ionicons
								name={focused ? 'server' : 'server-outline'}
								size={size}
								color={color}
							/>
						)}
						inactiveTintColor={theme.colors.onBackground}
						activeTintColor={theme.colors.primary}
						inactiveBackgroundColor='transparent'
						focused={currentRoute === '/(drawer)/(home)/importExport'}
						onPress={() => drawerItemPress('/(drawer)/(home)/importExport')}
					/>
					{/* <DrawerItemList {...props} /> */}
				</DrawerContentScrollView>

				<View style={{ paddingBottom: 20 + insets.bottom }}>
					<View
						style={{
							flexDirection: 'row',
							justifyContent: 'space-between',
							width: '95%',
						}}
					>
						<List.Item
							title={t('drawer.darkMode')}
							titleStyle={{ fontSize: 15, fontWeight: 'bold' }}
							left={(props) => (
								<Ionicons
									{...props}
									name='moon-sharp'
									size={25}
								/>
							)}
						/>
						<Switch
							value={darkModeSwitch}
							onValueChange={changeColorScheme}
						/>
					</View>
					<TouchableOpacity
						style={{ marginLeft: -4 }}
						onPress={toggleAccordion}
					>
						<List.Item
							title={t('drawer.language')}
							titleStyle={{ fontSize: 15, fontWeight: 'bold' }}
							left={(props) => (
								<Ionicons
									{...props}
									name='language-sharp'
									size={32}
								/>
							)}
							right={(props) => (
								<Ionicons
									{...props}
									name={expanded ? 'arrow-up' : 'arrow-down'}
									size={25}
								/>
							)}
						/>
					</TouchableOpacity>
					<Animated.View style={[styles.content, animatedStyle]}>
						<View
							style={{
								width: '80%',
								justifyContent: 'center',

								alignSelf: 'center',
							}}
						>
							<List.Item
								title={`${getFlagEmoji('GB')}     English`}
								onPress={() => {
									i18next.changeLanguage('en-US');
									AsyncStorage.setItem('language', 'en-US');
								}}
							/>
							<List.Item
								title={`${getFlagEmoji('PT')}     Português`}
								onPress={() => {
									i18next.changeLanguage('pt-PT');
									AsyncStorage.setItem('language', 'pt-PT');
								}}
							/>
						</View>
					</Animated.View>

					<DrawerItem
						labelStyle={{ fontSize: 15, fontWeight: 'bold' }}
						label={t('drawer.checkUpdate')}
						icon={({ color }) => (
							<Ionicons
								name={'cloud-download-outline'}
								color={color}
								size={32}
							/>
						)}
						inactiveTintColor={theme.colors.onBackground}
						activeTintColor={theme.colors.primary}
						inactiveBackgroundColor='transparent'
						onPress={() => setCheckUpdateConfirmationVisible(true)}
					/>

					<DrawerItem
						labelStyle={{ fontSize: 15, fontWeight: 'bold' }}
						label={t('drawer.signOut')}
						icon={({ focused, color }) => (
							<Ionicons
								name={'log-out-outline'}
								color={color}
								size={32}
							/>
						)}
						inactiveTintColor={theme.colors.onBackground}
						activeTintColor={theme.colors.primary}
						inactiveBackgroundColor='transparent'
						onPress={() => setSignOutConfirmationVisible(true)}
					/>
				</View>
			</View>
		</>
	);
}

const styles = StyleSheet.create({
	content: {
		overflow: 'hidden',
	},
});
