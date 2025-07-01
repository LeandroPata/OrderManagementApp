import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import { Button } from 'react-native-paper';
import { globalStyles } from '@/styles/global';

export default function AddHome() {
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
					icon='account-plus'
					mode='elevated'
					//loading={loginLoading}
					onPress={() => router.push('/(drawer)/(home)/(add)/addClient')}
				>
					{t('add.addClient')}
				</Button>

				<Button
					style={globalStyles.button}
					contentStyle={globalStyles.buttonContent.global}
					labelStyle={globalStyles.buttonText.global}
					icon='cake-variant'
					mode='elevated'
					//loading={loginLoading}
					onPress={() => router.push('/(drawer)/(home)/(add)/addProduct')}
				>
					{t('add.addProduct')}
				</Button>

				<Button
					style={globalStyles.button}
					contentStyle={globalStyles.buttonContent.global}
					labelStyle={globalStyles.buttonText.global}
					icon='package-variant-closed'
					mode='elevated'
					//loading={loginLoading}
					onPress={() => router.push('/(drawer)/(home)/(add)/addOrder')}
				>
					{t('add.addOrder')}
				</Button>
			</View>
		</ScrollView>
	);
}
