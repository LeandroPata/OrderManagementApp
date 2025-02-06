import type { ExpoConfig, ConfigContext } from '@expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
	...config,
	name: 'OrderManagementApp',
	slug: 'OrderManagementApp',
	version: '0.12.2',
	orientation: 'default',
	icon: './assets/images/iconReact.png',
	scheme: 'myapp',
	userInterfaceStyle: 'automatic',
	newArchEnabled: false,
	ios: {
		supportsTablet: true,
		bundleIdentifier: 'com.leandropata.ordermanagementapp',
		googleServicesFile:
			process.env.GOOGLE_SERVICES_PLIST || './GoogleService-Info.plist',
	},
	android: {
		adaptiveIcon: {
			foregroundImage: './assets/images/adaptiveIconReact.png',
			backgroundColor: '#fffbff',
		},
		package: 'com.leandropata.ordermanagementapp',
		permissions: [
			'android.permission.READ_EXTERNAL_STORAGE',
			'android.permission.WRITE_EXTERNAL_STORAGE',
			'android.permission.REQUEST_INSTALL_PACKAGES',
		],
		intentFilters: [
			{
				action: 'VIEW',
				data: [
					{
						scheme: 'file',
						mimeType: 'application/vnd.android.package-archive',
					},
				],
				category: ['BROWSABLE', 'DEFAULT'],
			},
		],
		googleServicesFile:
			process.env.GOOGLE_SERVICES_JSON || './google-services.json',
	},
	web: {
		bundler: 'metro',
		output: 'static',
		favicon: './assets/images/logoReact.png',
	},
	plugins: [
		'expo-router',
		[
			'expo-splash-screen',
			{
				image: './assets/images/logoReact.png',
				imageWidth: 200,
				resizeMode: 'contain',
				backgroundColor: '#fffbff',
				dark: {
					image: './assets/images/logoReact.png',
					imageWidth: 200,
					resizeMode: 'contain',
					backgroundColor: '#191918',
				},
			},
		],
		[
			'expo-build-properties',
			{
				android: {
					enableProguardInReleaseBuilds: true,
					enableShrinkResourcesInReleaseBuilds: true,
				},
				ios: {
					useFrameworks: 'static',
				},
			},
		],
		'expo-localization',
		'@react-native-firebase/app',
		'@react-native-firebase/auth',
	],
	experiments: { typedRoutes: true },
	extra: {
		eas: {
			projectId: '9cb15171-b707-4e5a-bfd0-ae289a2ecf07',
		},
	},
});
