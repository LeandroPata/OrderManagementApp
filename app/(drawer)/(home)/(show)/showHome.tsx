import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Button } from 'react-native-paper';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

export default function ShowHome() {
	const { t } = useTranslation();

	return (
		<ScrollView
			contentContainerStyle={styles.scrollContainer}
			keyboardShouldPersistTaps='handled'
		>
			<View style={styles.buttonContainer}>
				<Button
					style={styles.button}
					contentStyle={styles.buttonContent}
					labelStyle={styles.buttonText}
					icon='account-search'
					mode='elevated'
					//loading={loginLoading}
					onPress={() => router.push('/(drawer)/(home)/(show)/showClientOrder')}
				>
					{t('show.showClientOrder')}
				</Button>

				<Button
					style={styles.button}
					contentStyle={styles.buttonContent}
					labelStyle={styles.buttonText}
					icon='cake-variant'
					mode='elevated'
					//loading={loginLoading}
					onPress={() =>
						router.push('/(drawer)/(home)/(show)/showProductOrder')
					}
				>
					{t('show.showProductOrder')}
				</Button>

				<Button
					style={styles.button}
					contentStyle={styles.buttonContent}
					labelStyle={styles.buttonText}
					icon='cake-layered'
					mode='elevated'
					//loading={loginLoading}
					onPress={() =>
						router.push('/(drawer)/(home)/(show)/showProductQuantity')
					}
				>
					{t('show.showProductQuantity')}
				</Button>
			</View>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	scrollContainer: {
		flexGrow: 1,
		justifyContent: 'center',
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
});
