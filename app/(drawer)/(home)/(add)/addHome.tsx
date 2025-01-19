import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

export default function AddHome() {
	const { t } = useTranslation();

	return (
		<View style={styles.container}>
			<View style={styles.buttonContainer}>
				<Button
					style={styles.button}
					contentStyle={styles.buttonContent}
					labelStyle={styles.buttonText}
					icon='account-plus'
					mode='elevated'
					//loading={loginLoading}
					onPress={() => router.push('/(drawer)/(home)/(add)/addClient')}
				>
					{t('add.addClient')}
				</Button>
				<Button
					style={styles.button}
					contentStyle={styles.buttonContent}
					labelStyle={styles.buttonText}
					icon='cake-variant'
					mode='elevated'
					//loading={loginLoading}
					onPress={() => router.push('/(drawer)/(home)/(add)/addProduct')}
				>
					{t('add.addProduct')}
				</Button>
				<Button
					style={styles.button}
					contentStyle={styles.buttonContent}
					labelStyle={styles.buttonText}
					icon='package-variant-closed'
					mode='elevated'
					//loading={loginLoading}
					onPress={() => router.push('/(drawer)/(home)/(add)/addOrder')}
				>
					{t('add.addOrder')}
				</Button>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
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
