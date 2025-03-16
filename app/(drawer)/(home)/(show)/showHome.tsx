import React from 'react';
import { View, ScrollView } from 'react-native';
import { Button } from 'react-native-paper';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { globalStyles } from '@/styles/global';

export default function ShowHome() {
	const { t } = useTranslation();

	return (
		<ScrollView
			contentContainerStyle={globalStyles.scrollContainer.global}
			keyboardShouldPersistTaps='handled'
		>
			<View style={globalStyles.buttonContainer.global}>
				<Button
					style={globalStyles.button}
					contentStyle={globalStyles.buttonContent.global}
					labelStyle={globalStyles.buttonText.global}
					icon='account-search'
					mode='elevated'
					//loading={loginLoading}
					onPress={() => router.push('/(drawer)/(home)/(show)/showClientOrder')}
				>
					{t('show.showClientOrder')}
				</Button>

				<Button
					style={globalStyles.button}
					contentStyle={globalStyles.buttonContent.global}
					labelStyle={globalStyles.buttonText.global}
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
					style={globalStyles.button}
					contentStyle={globalStyles.buttonContent.global}
					labelStyle={globalStyles.buttonText.global}
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
