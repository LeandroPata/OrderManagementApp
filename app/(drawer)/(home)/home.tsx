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

export default function Home() {
	const { t } = useTranslation();

	return (
		<ScrollView
			contentContainerStyle={styles.scrollContainer}
			keyboardShouldPersistTaps='handled'
		>
			<View
				style={[
					styles.imageContainer,
					{
						width: useWindowDimensions().width * 0.5,
						height: useWindowDimensions().height * 0.3,
					},
				]}
			>
				<View style={{ height: '100%', width: '100%' }}>
					<Image
						source={require('@/assets/images/logoReact.png')}
						style={styles.image}
						resizeMode='contain'
					/>
				</View>
			</View>
			<View style={styles.buttonContainer}>
				<Button
					style={styles.button}
					contentStyle={styles.buttonContent}
					labelStyle={styles.buttonText}
					icon='account-plus'
					mode='elevated'
					//loading={loginLoading}
					onPress={() => router.push('/(drawer)/(home)/(add)/addHome')}
				>
					{t('home.add')}
				</Button>

				<Button
					style={styles.button}
					contentStyle={styles.buttonContent}
					labelStyle={styles.buttonText}
					icon='account-search'
					mode='elevated'
					//loading={loginLoading}
					onPress={() => router.push('/(drawer)/(home)/(show)/showHome')}
				>
					{t('home.show')}
				</Button>

				<Button
					style={styles.button}
					contentStyle={styles.buttonContent}
					labelStyle={styles.buttonText}
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

const styles = StyleSheet.create({
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
		//backgroundColor: 'blue',
		alignSelf: 'center',
	},
	image: {
		flex: 1,
		maxWidth: '100%',
		maxHeight: '100%',
	},
});
