import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';
import storage from '@react-native-firebase/storage';
import {
	DrawerContentScrollView,
	DrawerItem,
	useDrawerStatus,
} from '@react-navigation/drawer';
import Constants from 'expo-constants';
import { router, useFocusEffect, usePathname } from 'expo-router';
import type { FirebaseError } from 'firebase/app';
import i18next from 'i18next';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
	Image,
	Platform,
	TouchableOpacity,
	UIManager,
	useWindowDimensions,
	View,
} from 'react-native';
import { EventRegister } from 'react-native-event-listeners';
import {
	Button,
	Dialog,
	Divider,
	HelperText,
	List,
	Modal,
	Portal,
	ProgressBar,
	Switch,
	Text,
	TextInput,
	useTheme,
} from 'react-native-paper';
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import RNFetchBlob from 'rn-fetch-blob';
import { useDialog } from '@/context/DialogContext';
import { useSnackbar } from '@/context/SnackbarContext';
import { globalStyles } from '@/styles/global';
import { getFlagEmoji } from '@/utils/GetCountryFlag';

export default function CustomDrawerContent(props: any) {
	const theme = useTheme();
	const insets = useSafeAreaInsets();
	const { t } = useTranslation();

	const scrollRef = useRef();

	const isDrawerOpen = useDrawerStatus() === 'open';

	useEffect(() => {
		//console.log(isDrawerOpen);
		if (!isDrawerOpen) {
			scrollRef?.current?.scrollTo({ y: 0 });
			if (expanded) toggleAccordion();
		}
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
				checkLeftoverFiles();
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
	const { showSnackbar } = useSnackbar();

	// All the logic to implement DialogContext
	const { showDialog, hideDialog } = useDialog();

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

		//console.log(darkMode);
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

	const checkLeftoverFiles = async () => {
		RNFetchBlob.fs
			.ls(RNFetchBlob.fs.dirs.CacheDir)
			.then((files) => {
				//console.log(files);
				for (const file of files) {
					if (file.endsWith('.apk')) {
						//console.log(file);
						deleteFile(`${RNFetchBlob.fs.dirs.CacheDir}/${file}`);
					}
				}
			})
			.catch((e: any) => {
				console.log(`Listing files failed: ${e.message}`);
			});
	};

	const checkUpdates = async (passive = false) => {
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
						//console.log(ref.name);
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

						showDialog({
							text: t('dialog.runUpdate'),
							onConfirmation: () => downloadUpdate(updateVersion),
							testID: 'RunUpdateDialog',
						});
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

	const deleteFile = async (filePath: string) => {
		await RNFetchBlob.fs
			.unlink(filePath)
			.then(() => {
				console.log('File Deleted');
			})
			.catch((e: any) => {
				console.log(`Deleting file failed: ${e.message}`);
			});
	};

	const downloadUpdate = async (updateFolderName: string) => {
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
			})
			.catch((e: any) => {
				const err = e as FirebaseError;
				console.log(`Getting file name failed: ${err.message}`);
			});

		const updateStorageRef = storage().ref(
			`updates/${updateFolderName}/${updateFileName}`
		);

		//console.log(`updates/${updateFolderName}/${updateFileName}`);

		const apkPath = `${RNFetchBlob.fs.dirs.CacheDir}/${updateFileName}`;

		const task = updateStorageRef.writeToFile(apkPath);
		setUpdateDownloadProgressVisible(true);

		task.on('state_changed', (taskSnapshot) => {
			const downloadProgress =
				(taskSnapshot.bytesTransferred * 100) / taskSnapshot.totalBytes / 100;
			setUpdateDownloadProgress(Number(downloadProgress.toFixed(2)));
			//console.log(Number(downloadProgress.toFixed(2)));
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
		await RNFetchBlob.android
			.actionViewIntent(apkPath, 'application/vnd.android.package-archive')
			.then(() => {
				console.log('Finished');
			})
			.catch((e: any) => {
				console.log(`Installing apk failed: ${e}`);
			});
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
					style={globalStyles.modalContainer.global}
					contentContainerStyle={[
						globalStyles.modalContentContainer.drawer,
						{
							backgroundColor: theme.colors.primaryContainer,
							minHeight: useWindowDimensions().height / 2,
						},
					]}
					testID='ChangePasswordModal'
				>
					<View
						style={{
							flex: 1,
							justifyContent: 'space-evenly',
						}}
					>
						<View>
							<TextInput
								style={globalStyles.input}
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
								testID='CurrentPasswordInput'
							/>
							{currentPasswordError ? (
								<HelperText
									type='error'
									visible={currentPasswordError}
									style={globalStyles.text.errorHelper}
									testID='CurrentPasswordError'
								>
									{t('drawer.currentPasswordError')}
								</HelperText>
							) : null}
						</View>
						<View>
							<TextInput
								style={globalStyles.input}
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
								testID='NewPasswordInput'
							/>
							{newPasswordError ? (
								<HelperText
									type='error'
									visible={newPasswordError}
									style={globalStyles.text.errorHelper}
									testID='NewPasswordError'
								>
									{t('drawer.newPasswordError')}
								</HelperText>
							) : null}
						</View>
						<View>
							<TextInput
								style={globalStyles.input}
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
								testID='ConfirmNewPasswordInput'
							/>
							{confirmNewPasswordError ? (
								<HelperText
									type='error'
									visible={confirmNewPasswordError}
									style={globalStyles.text.errorHelper}
									testID='ConfirmNewPasswordError'
								>
									{t('drawer.confirmNewPasswordError')}
								</HelperText>
							) : null}
						</View>
					</View>

					<Button
						style={globalStyles.button}
						contentStyle={globalStyles.buttonContent.modal}
						labelStyle={globalStyles.buttonText.modal}
						icon='check-bold'
						mode='elevated'
						onPress={changePassword}
						testID='ChangePasswordButton'
					>
						{t('drawer.changePassword')}
					</Button>
				</Modal>
			</Portal>

			<View style={{ flex: 1 }}>
				<DrawerContentScrollView
					{...props}
					style={{
						flex: 1,
					}}
					ref={scrollRef}
				>
					<View style={{ flex: 1, justifyContent: 'flex-start' }}>
						<Image
							style={[
								globalStyles.image.drawer,
								{
									height: useWindowDimensions().height / 10,
									marginTop: -insets.top,
								},
							]}
							source={require('@/assets/images/logoReact.png')}
							testID='DrawerLogo'
						/>

						<Divider
							style={{ marginVertical: 5 }}
							bold={true}
						/>

						<DrawerItem
							labelStyle={globalStyles.text.drawer}
							label={t('drawer.home')}
							style={globalStyles.drawerStyle}
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
							labelStyle={globalStyles.text.drawer}
							label={t('drawer.add')}
							style={globalStyles.drawerStyle}
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
							testID='SearchDrawerButton'
						/>

						<DrawerItem
							labelStyle={globalStyles.text.drawer}
							label={t('drawer.show')}
							style={globalStyles.drawerStyle}
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
							onPress={() =>
								drawerItemPress('/(drawer)/(home)/(show)/showHome')
							}
							testID='UpdateDrawerButton'
						/>

						<DrawerItem
							labelStyle={globalStyles.text.drawer}
							label={t('drawer.importExport')}
							style={globalStyles.drawerStyle}
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
							testID='ImportExportDrawerButton'
						/>
					</View>

					<Divider
						style={{ marginVertical: 5 }}
						bold={true}
					/>

					<View style={{ flex: 1, justifyContent: 'flex-end' }}>
						<View
							style={{
								flexDirection: 'row',
								justifyContent: 'space-between',
								width: '95%',
								minHeight: 10,
							}}
						>
							<List.Item
								title={t('drawer.darkMode')}
								titleStyle={globalStyles.text.drawer}
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
								testID='ThemeSwitch'
							/>
						</View>

						<TouchableOpacity
							style={{ marginLeft: -4, minHeight: 10 }}
							onPress={toggleAccordion}
							testID='LanguageButton'
						>
							<List.Item
								title={t('drawer.language')}
								titleStyle={globalStyles.text.drawer}
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

						<Animated.View style={[globalStyles.content, animatedStyle]}>
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
									testID='EnButton'
								/>
								<List.Item
									title={`${getFlagEmoji('PT')}     Português`}
									onPress={() => {
										i18next.changeLanguage('pt-PT');
										AsyncStorage.setItem('language', 'pt-PT');
									}}
									testID='PtButton'
								/>
							</View>
						</Animated.View>

						<DrawerItem
							labelStyle={globalStyles.text.drawer}
							label={t('drawer.checkUpdate')}
							style={globalStyles.drawerStyle}
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
							onPress={() =>
								showDialog({
									text: t('dialog.checkUpdate'),
									onConfirmation: () => checkUpdates(),
									testID: 'UpdateDialog',
								})
							}
							testID='UpdateAppDrawerButton'
						/>

						<DrawerItem
							labelStyle={globalStyles.text.drawer}
							label={t('drawer.changePassword')}
							style={globalStyles.drawerStyle}
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
							testID='ChangePasswordDrawerButton'
						/>

						<DrawerItem
							labelStyle={globalStyles.text.drawer}
							label={t('drawer.signOut')}
							style={globalStyles.drawerStyle}
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
							onPress={() =>
								showDialog({
									text: t('account.signOutDialog'),
									onConfirmation: () => {
										signOut();
									},
									testID: 'SignOutDialog',
								})
							}
							testID='SignOutDrawerButton'
						/>
					</View>
					{/* <DrawerItemList {...props} /> */}
				</DrawerContentScrollView>

				<Divider
					style={{ marginVertical: 5 }}
					bold={true}
				/>

				<View style={{ paddingBottom: insets.bottom + 5 }}>
					<Text
						style={globalStyles.text.footer}
						testID='VersionText'
					>
						{t('drawer.version')}: {Constants.expoConfig?.version}
					</Text>
				</View>
			</View>
		</>
	);
}
