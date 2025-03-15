import React from 'react';
import {
	View,
	StyleSheet,
	ScrollView,
	Image,
	useWindowDimensions,
} from 'react-native';
import { Button } from 'react-native-paper';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { globalStyles } from '@/styles/global';

export default function Home() {
	const { t } = useTranslation();

	return (
		<ScrollView
			contentContainerStyle={globalStyles.scrollContainer.home}
			keyboardShouldPersistTaps='handled'
		>
			<View
				style={[
					globalStyles.container.image,
					{
						width: useWindowDimensions().width * 0.5,
						height: useWindowDimensions().height * 0.3,
					},
				]}
			>
				<View style={{ height: '100%', width: '100%' }}>
					<Image
						source={require('@/assets/images/logoReact.png')}
						style={globalStyles.image.global}
						resizeMode='contain'
					/>
				</View>
			</View>
			<View style={globalStyles.buttonContainer.global}>
				<Button
					style={globalStyles.button}
					contentStyle={globalStyles.buttonContent.global}
					labelStyle={globalStyles.buttonText}
					icon='account-plus'
					mode='elevated'
					//loading={loginLoading}
					onPress={() => router.push('/(drawer)/(home)/(add)/addHome')}
				>
					{t('home.add')}
				</Button>

				<Button
					style={globalStyles.button}
					contentStyle={globalStyles.buttonContent.global}
					labelStyle={globalStyles.buttonText}
					icon='account-search'
					mode='elevated'
					//loading={loginLoading}
					onPress={() => router.push('/(drawer)/(home)/(show)/showHome')}
				>
					{t('home.show')}
				</Button>

				<Button
					style={globalStyles.button}
					contentStyle={globalStyles.buttonContent.global}
					labelStyle={globalStyles.buttonText}
					icon='database'
					mode='elevated'
					//loading={loginLoading}
					onPress={() => router.push('/(drawer)/(home)/importExport')}
				>
					{t('home.importExport')}
				</Button>
			</View>
		</ScrollView>
	);
}

/* const styles = StyleSheet.create({
	scrollContainer: {
		flexGrow: 1,
		//justifyContent: 'center',
	},
	buttonContainer: {
		marginHorizontal: 20,
		alignItems: 'center',
	},
	button: {
		marginVertical: 8,
		justifyContent: 'center',
	},
	buttonContent: {
		minWidth: 280,
		minHeight: 80,
	},
	buttonText: {
		fontSize: 25,
		fontWeight: 'bold',
		overflow: 'visible',
		paddingTop: 10,
	},
	imageContainer: {
		justifyContent: 'center',
		alignSelf: 'center',
		width: '50%',
		height: '35%',
	},
	image: {
		resizeMode: 'contain',
		width: '100%',
		height: '100%',
	},
}); */
