import { StyleSheet } from 'react-native';
import {
	MD3LightTheme as DefaultLightTheme,
	MD3DarkTheme as DefaultDarkTheme,
} from 'react-native-paper';

export const globalTheme = {
	dark: {
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
	},
	light: {
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
	},
};

export const globalStyles = StyleSheet.create({
	container: {
		home: { flex: 1 },
		item: {
			flexDirection: 'row',
			justifyContent: 'space-between',
			flexWrap: 'wrap',
			maxWidth: '90%',
		},
		image: {
			justifyContent: 'center',
			alignSelf: 'center',
			width: '50%',
			height: '35%',
		},
	},
	scrollContainer: {
		global: {
			flexGrow: 1,
			justifyContent: 'center',
		},
		home: {
			flexGrow: 1,
		},
		show: {
			flexGrow: 1,
		},
	},
	modalContainer: {
		global: {
			marginHorizontal: 30,
		},
		dataTable: {
			marginHorizontal: 30,
			alignItems: 'center',
		},
	},
	modalContentContainer: {
		global: {
			paddingVertical: 10,
			paddingHorizontal: 15,
			borderRadius: 20,
		},
		drawer: {
			paddingVertical: 5,
			paddingHorizontal: 15,
			borderRadius: 20,
			justifyContent: 'center',
		},
		dataTable: {
			paddingVertical: 10,
			paddingHorizontal: 15,
			borderRadius: 20,
			borderWidth: 2,
		},
	},
	buttonContainer: {
		global: {
			marginHorizontal: 20,
			alignItems: 'center',
		},
		order: {
			flex: 1,
			justifyContent: 'flex-end',
			marginHorizontal: 20,
			alignItems: 'center',
		},
	},
	button: {
		marginVertical: 8,
		justifyContent: 'center',
	},
	buttonContent: {
		global: {
			minWidth: 280,
			minHeight: 80,
		},
		modal: {
			minWidth: 150,
			minHeight: 30,
		},
	},
	buttonText: {
		global: {
			fontSize: 25,
			fontWeight: 'bold',
			overflow: 'visible',
			paddingTop: 10,
		},
		modal: {
			fontSize: 15,
			fontWeight: 'bold',
			overflow: 'visible',
		},
	},
	input: {
		marginVertical: 2,
	},
	image: {
		global: {
			resizeMode: 'contain',
			width: '100%',
			height: '100%',
		},
		drawer: {
			alignSelf: 'center',
			resizeMode: 'contain',
		},
	},
	searchList: {
		paddingHorizontal: 10,
		marginBottom: 10,
	},
	text: {
		global: {
			fontSize: 20,
			fontWeight: 'bold',
			marginVertical: 3,
		},
		deliveryDate: {
			fontSize: 20,
			fontWeight: 'bold',
		},
		date: {
			fontSize: 20,
			fontWeight: 'bold',
			marginVertical: 6,
		},
		footer: {
			fontSize: 13,
			textAlign: 'center',
			textAlignVertical: 'center',
		},
		dataTable: {
			title: {
				fontWeight: 'bold',
			},
			row: {
				fontSize: 18,
				fontWeight: 'bold',
				textAlign: 'center',
				textAlignVertical: 'center',
			},
		},
		dialog: {
			fontSize: 15,
		},
		snackbarInfo: {
			fontSize: 15,
		},
		errorHelper: {
			fontSize: 15,
			fontWeight: 'bold',
		},
	},
	content: {
		overflow: 'hidden',
	},
	item: {
		fontSize: 15,
		textAlign: 'center',
		textAlignVertical: 'center',
	},
	drawerStyle: {
		minHeight: 10,
	},
	quantityButtonStyle: {
		marginRight: 5,
		width: '15%',
		paddingVertical: 5,
		paddingHorizontal: 10,
		borderRadius: 15,
	},
	quantityButtonText: {
		fontSize: 20,
		fontWeight: 'bold',
		paddingTop: 5,
		paddingBottom: 5,
		textAlign: 'center',
		textAlignVertical: 'center',
	},
});
