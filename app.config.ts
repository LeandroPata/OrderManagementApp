import { ExpoConfig, ConfigContext } from '@expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
	...config,
	name: 'OrderManagementApp',
	slug: 'OrderManagementApp',
	version: '1.0.0',
	orientation: 'portrait',
	icon: './assets/images/icon.png',
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
			foregroundImage: './assets/images/adaptive-icon.png',
			backgroundColor: '#ffffff',
		},
		package: 'com.leandropata.ordermanagementapp',
		permissions: [
			'android.permission.READ_EXTERNAL_STORAGE',
			'android.permission.WRITE_EXTERNAL_STORAGE',
		],
		googleServicesFile:
			process.env.GOOGLE_SERVICES_JSON || './google-services.json',
	},
	web: {
		bundler: 'metro',
		output: 'static',
		favicon: './assets/images/favicon.png',
	},
	plugins: [
		'expo-router',
		[
			'expo-splash-screen',
			{
				image: './assets/images/splash-icon.png',
				imageWidth: 200,
				resizeMode: 'contain',
				backgroundColor: '#ffffff',
			},
		],
		['expo-build-properties', { ios: { useFrameworks: 'static' } }],
		'expo-localization',
		'@react-native-firebase/app',
		'@react-native-firebase/auth',
	],
	experiments: { typedRoutes: true },
});
