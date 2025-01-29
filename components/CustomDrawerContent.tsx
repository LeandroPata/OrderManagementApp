import React, { useCallback, useEffect, useState } from 'react';
import {
	Platform,
	UIManager,
	View,
	StyleSheet,
	TouchableOpacity,
	Image,
	useWindowDimensions,
} from 'react-native';
import {
	Dialog,
	List,
	Portal,
	ProgressBar,
	Switch,
	useTheme,
	Text,
	Modal,
	TextInput,
	HelperText,
	Button,
} from 'react-native-paper';
import {
	DrawerContentScrollView,
	DrawerItem,
	useDrawerStatus,
} from '@react-navigation/drawer';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useFocusEffect, usePathname } from 'expo-router';
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

export default function CustomDrawerContent(props: any) {
	const theme = useTheme();
	const insets = useSafeAreaInsets();
	const { t } = useTranslation();

	const isDrawerOpen = useDrawerStatus() === 'open';

	useEffect(() => {
		//console.log(isDrawerOpen);
		if (!isDrawerOpen && expanded) toggleAccordion();
	}, [isDrawerOpen]);

	const [firstTimeCount, setFirstTimeCount] = useState(0);

	useFocusEffect(
		useCallback(() => {
			// Screen focused
			//console.log("Hello, I'm focused!");
			//console.log(firstTimeCount);
			if (!firstTimeCount) {
				setFirstTimeCount(1);
				checkUpdates(true);
			}

			// Screen unfocused in return
			return () => {
				//console.log('This route is now unfocused.');
			};
		}, [])
	);

	const [currentRoute, setCurrentRoute] = useState(usePathname());

	const [expanded, setExpanded] = useState(false);
	const [darkModeSwitch, setDarkModeSwitch] = useState(false);

	const [changePasswordModal, setChangePasswordModal] = useState(false);

	const [currentPassword, setCurrentPassword] = useState('');
	const [newPassword, setNewPassword] = useState('');
	const [confirmNewPassword, setConfirmNewPassword] = useState('');

	const [currentPasswordError, setCurrentPasswordError] = useState(false);
	const [newPasswordError, setNewPasswordError] = useState(false);
	const [confirmNewPasswordError, setConfirmNewPasswordError] = useState(false);

	const [updateVersion, setUpdateVersion] = useState('');
	const [updateDownloadProgressVisible, setUpdateDownloadProgressVisible] =
		useState(false);
	const [updateDownloadProgress, setUpdateDownloadProgress] = useState(1);

	const user = auth().currentUser;

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

	const checkUpdates = async (passive = false) => {
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
					if (!passive) {
						console.log('Do update?');

						setRunUpdateConfirmationVisible(true);
					} else {
						console.log('Passive update check');
						showSnackbar(t('drawer.passiveUpdateCheck'));
					}
				} else {
					if (!passive) {
						console.log('No update');
						showSnackbar(t('drawer.noUpdate'));
					}
				}
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

		const apkPath = `${RNFetchBlob.fs.dirs.DownloadDir}/${updateFileName}`;

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

	const onChangePasswordModalDismiss = () => {
		setChangePasswordModal(false);
		setCurrentPassword('');
		setCurrentPasswordError(false);
		setNewPassword('');
		setNewPasswordError(false);
		setConfirmNewPassword('');
		setConfirmNewPasswordError(false);
	};

	const checkCurrentPassword = async () => {
		let passwordCheck = false;
		if (!user || currentPassword.trim() === '') {
			passwordCheck = false;
			return passwordCheck;
		}
		const credential = auth.EmailAuthProvider.credential(
			user.email,
			currentPassword
		);
		await user
			?.reauthenticateWithCredential(credential)
			.then(() => {
				console.log('Successfull reauthentication');
				passwordCheck = true;
			})
			.catch((e: any) => {
				const err = e as FirebaseError;
				if (err.code === 'auth/invalid-credential') {
					console.log(`Invalid credentials: ${err.message}`);
					setCurrentPassword('');
					setCurrentPasswordError(true);
				} else {
					//showSnackbar('Sign in failed: ' + err.message);
					console.log(`Reauthentication failed: ${err.message}`);
				}
				passwordCheck = false;
			});
		return passwordCheck;
	};

	const changePassword = async () => {
		if (!currentPassword.trim() || currentPassword.trim().length < 6) {
			console.log('Invalid current password');
			setCurrentPasswordError(true);
			return;
		} else if (!newPassword.trim() || newPassword.trim().length < 6) {
			console.log('Invalid new password');
			setNewPasswordError(true);
			return;
		} else if (
			!confirmNewPassword.trim() ||
			confirmNewPassword.trim().length < 6
		) {
			console.log('Invalid confirmed new password');
			setConfirmNewPasswordError(true);
			return;
		} else if (newPassword !== confirmNewPassword) {
			console.log('Passwords do not match');
			setNewPasswordError(false);
			setConfirmNewPasswordError(true);
			return;
		} else if (!(await checkCurrentPassword())) {
			console.log('False');
			return;
		}

		user
			?.updatePassword(newPassword)
			.then(() => {
				console.log('Password updated');
				showSnackbar(t('drawer.passwordUpdated'));
			})
			.catch((e: any) => {
				const err = e as FirebaseError;
				//showSnackbar('Sign in failed: ' + err.message);
				console.log(`Updating password failed: ${err.message}`);
			});
	};

	const signOut = () => {
		setSignOutConfirmationVisible(false);
		props.navigation.closeDrawer();
		auth().signOut();
	};

	const drawerItemPress = (goToPathName: string) => {
		props.navigation.closeDrawer();
		setCurrentRoute(goToPathName);
		router.replace(goToPathName);
	};

	return (
		<>
			<DialogConfirmation
				text={t('drawer.checkUpdateDialog')}
				visible={checkUpdateConfirmationVisible}
				onDismiss={onDismissDialogConfirmation}
				onConfirmation={() => checkUpdates()}
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
				onConfirmation={signOut}
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
				<Modal
					visible={changePasswordModal}
					onDismiss={onChangePasswordModalDismiss}
					style={styles.modalContainer}
					contentContainerStyle={[
						styles.modalContentContainer,
						{
							backgroundColor: theme.colors.primaryContainer,
							minHeight: useWindowDimensions().height / 2,
						},
					]}
				>
					<View
						style={{
							flex: 1,
							justifyContent: 'space-evenly',
						}}
					>
						<View>
							<TextInput
								style={styles.input}
								value={currentPassword}
								onChangeText={setCurrentPassword}
								onEndEditing={() => {
									if (
										currentPassword.trim() === '' ||
										currentPassword.trim().length < 6
									)
										setCurrentPasswordError(true);
									else setCurrentPasswordError(false);
								}}
								error={currentPasswordError}
								autoCapitalize='none'
								label={t('drawer.currentPassword')}
								secureTextEntry
							/>
							{currentPasswordError ? (
								<HelperText
									type='error'
									visible={currentPasswordError}
									style={styles.errorHelper}
								>
									{t('drawer.currentPasswordError')}
								</HelperText>
							) : null}
						</View>
						<View>
							<TextInput
								style={styles.input}
								value={newPassword}
								onChangeText={setNewPassword}
								onEndEditing={() => {
									if (
										newPassword.trim() === '' ||
										newPassword.trim().length < 6
									)
										setNewPasswordError(true);
									else setNewPasswordError(false);
								}}
								error={newPasswordError}
								autoCapitalize='none'
								label={t('drawer.newPassword')}
								secureTextEntry
							/>
							{newPasswordError ? (
								<HelperText
									type='error'
									visible={newPasswordError}
									style={styles.errorHelper}
								>
									{t('drawer.newPasswordError')}
								</HelperText>
							) : null}
						</View>
						<View>
							<TextInput
								style={styles.input}
								value={confirmNewPassword}
								onChangeText={setConfirmNewPassword}
								onEndEditing={() => {
									if (
										newPassword.trim() !== '' &&
										(confirmNewPassword.trim() === '' ||
											confirmNewPassword.trim().length < 6 ||
											newPassword !== confirmNewPassword)
									)
										setConfirmNewPasswordError(true);
									else setConfirmNewPasswordError(false);
								}}
								error={confirmNewPasswordError}
								autoCapitalize='none'
								label={t('drawer.confirmNewPassword')}
								secureTextEntry
							/>
							{confirmNewPasswordError ? (
								<HelperText
									type='error'
									visible={confirmNewPasswordError}
									style={styles.errorHelper}
								>
									{t('drawer.confirmNewPasswordError')}
								</HelperText>
							) : null}
						</View>
					</View>
					<Button
						style={styles.button}
						contentStyle={styles.buttonContent}
						labelStyle={styles.buttonText}
						icon='check-bold'
						mode='elevated'
						onPress={changePassword}
					>
						{t('drawer.changePassword')}
					</Button>
				</Modal>
			</Portal>

			<SnackbarInfo
				text={snackbarText}
				visible={snackbarVisible}
				onDismiss={onDismissSnackbar}
			/>

			<View style={{ flex: 1 }}>
				<DrawerContentScrollView
					{...props}
					scrollEnabled={false}
				>
					<Image
						style={styles.image}
						source={require('@/assets/images/logoReact.png')}
					/>
					<DrawerItem
						labelStyle={{ fontSize: 15, fontWeight: 'bold' }}
						label={t('drawer.home')}
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
						pressColor='rgba(80, 80, 80, 0.32)'
						focused={currentRoute === '/(drawer)/(home)/home'}
						onPress={() => drawerItemPress('/(drawer)/(home)/home')}
					/>
					<DrawerItem
						labelStyle={{ fontSize: 15, fontWeight: 'bold' }}
						label={t('drawer.add')}
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
						pressColor='rgba(80, 80, 80, 0.32)'
						focused={currentRoute === '/(drawer)/(home)/(add)/addHome'}
						onPress={() => drawerItemPress('/(drawer)/(home)/(add)/addHome')}
					/>
					<DrawerItem
						labelStyle={{ fontSize: 15, fontWeight: 'bold' }}
						label={t('drawer.show')}
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
						pressColor='rgba(80, 80, 80, 0.32)'
						focused={currentRoute === '/(drawer)/(home)/(show)/showHome'}
						onPress={() => drawerItemPress('/(drawer)/(home)/(show)/showHome')}
					/>
					<DrawerItem
						labelStyle={{ fontSize: 15, fontWeight: 'bold' }}
						label={t('drawer.importExport')}
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
						pressColor='rgba(80, 80, 80, 0.32)'
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
								size={27}
							/>
						)}
						inactiveTintColor={theme.colors.onBackground}
						activeTintColor={theme.colors.primary}
						inactiveBackgroundColor='transparent'
						pressColor='rgba(80, 80, 80, 0.32)'
						onPress={() => setCheckUpdateConfirmationVisible(true)}
					/>
					<DrawerItem
						labelStyle={{ fontSize: 15, fontWeight: 'bold' }}
						label={t('drawer.changePassword')}
						icon={({ color }) => (
							<Ionicons
								name={'lock-open-outline'}
								color={color}
								size={28}
							/>
						)}
						inactiveTintColor={theme.colors.onBackground}
						activeTintColor={theme.colors.primary}
						inactiveBackgroundColor='transparent'
						pressColor='rgba(80, 80, 80, 0.32)'
						onPress={() => setChangePasswordModal(true)}
					/>
					<DrawerItem
						labelStyle={{ fontSize: 15, fontWeight: 'bold' }}
						label={t('drawer.signOut')}
						icon={({ color }) => (
							<Ionicons
								name={'log-out-outline'}
								color={color}
								size={32}
							/>
						)}
						inactiveTintColor={theme.colors.onBackground}
						activeTintColor={theme.colors.primary}
						inactiveBackgroundColor='transparent'
						pressColor='rgba(80, 80, 80, 0.32)'
						onPress={() => setSignOutConfirmationVisible(true)}
					/>
					<Text style={styles.title}>
						{t('drawer.version')}: {Constants.expoConfig?.version}
					</Text>
				</View>
			</View>
		</>
	);
}

const styles = StyleSheet.create({
	content: {
		overflow: 'hidden',
	},
	image: {
		alignSelf: 'center',
		resizeMode: 'contain',
		width: '50%',
		height: '50%',
	},
	modalContainer: {
		marginHorizontal: 30,
	},
	modalContentContainer: {
		paddingVertical: 5,
		paddingHorizontal: 15,
		borderRadius: 20,
		justifyContent: 'center',
	},
	input: {
		marginVertical: 2,
	},
	errorHelper: {
		fontWeight: 'bold',
		fontSize: 15,
	},
	button: {
		marginVertical: 8,
		justifyContent: 'center',
	},
	buttonContent: {
		minWidth: 50,
		minHeight: 20,
	},
	buttonText: {
		fontSize: 25,
		fontWeight: 'bold',
		overflow: 'visible',
		paddingTop: 10,
	},
	title: {
		fontSize: 13,
		textAlign: 'center',
		textAlignVertical: 'center',
	},
});
