import firestore from '@react-native-firebase/firestore';
import type { FirebaseError } from 'firebase/app';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Keyboard, KeyboardAvoidingView, ScrollView, View } from 'react-native';
import { Button, HelperText, TextInput } from 'react-native-paper';
import { useSnackbar } from '@/context/SnackbarContext';
import { globalStyles } from '@/styles/global';
import { checkClientByName } from '@/utils/Firebase';

export default function AddClient() {
	const { t } = useTranslation();

	const [loading, setLoading] = useState(false);

	const [nameError, setNameError] = useState(false);

	const [name, setName] = useState('');
	const [contact, setContact] = useState('');

	// All the logic to implement the snackbar
	const { showSnackbar } = useSnackbar();

	/* 	const checkClient = async () => {
		let clientExists = false;
		await firestore()
			.collection('clients')
			.orderBy('name', 'asc')
			.get()
			.then((querySnapshot) => {
				querySnapshot.forEach((doc) => {
					if (name.trim() === doc.data().name) clientExists = true;
				});
			})
			.catch((e: any) => {
				const err = e as FirebaseError;
				console.log(`Checking client failed: ${err.message}`);
				setLoading(false);
			});
		return clientExists;
	}; */

	const addClient = async () => {
		setLoading(true);
		Keyboard.dismiss();

		const clientCheck = await checkClientByName(name.trim());

		if (!name.trim() || clientCheck) {
			showSnackbar(t('add.client.nameError'));
			setNameError(true);
			setLoading(false);
			return;
		}

		const docRef = firestore().collection('clients').doc();

		docRef
			.set({
				name: name.trim(),
				contact: contact.trim(),
			})
			.then(() => {
				console.log('Added');
				showSnackbar(t('add.client.added'));
				setName('');
				setContact('');
			})
			.catch((e: any) => {
				const err = e as FirebaseError;
				console.log(`Adding client failed: ${err.message}`);
				setLoading(false);
			})
			.finally(() => {
				setLoading(false);
			});
	};

	return (
		<ScrollView
			contentContainerStyle={globalStyles.scrollContainer.global}
			keyboardShouldPersistTaps='handled'
		>
			<KeyboardAvoidingView style={{ paddingHorizontal: 10 }}>
				<TextInput
					style={globalStyles.input}
					value={name}
					onChangeText={setName}
					onEndEditing={() => {
						if (!name.trim()) {
							setNameError(true);
						} else setNameError(false);
						setName(name.trim());
					}}
					error={nameError}
					autoCapitalize='sentences'
					keyboardType='default'
					label={t('add.client.name')}
				/>
				{nameError ? (
					<HelperText
						type='error'
						visible={nameError}
						style={globalStyles.text.errorHelper}
					>
						{t('add.client.nameInvalid')}
					</HelperText>
				) : null}

				<TextInput
					style={globalStyles.input}
					value={contact}
					onChangeText={(input) => {
						setContact(input.replace(/[^0-9+\-\s]/g, ''));
					}}
					onEndEditing={() => {
						setContact(contact.trim());
					}}
					autoCapitalize='none'
					inputMode='tel'
					keyboardType='phone-pad'
					label={t('add.client.contact')}
				/>
			</KeyboardAvoidingView>

			<View style={globalStyles.buttonContainer.global}>
				<Button
					style={globalStyles.button}
					contentStyle={globalStyles.buttonContent.global}
					labelStyle={globalStyles.buttonText.global}
					icon='account-plus'
					mode='elevated'
					loading={loading}
					onPress={addClient}
				>
					{t('add.client.add')}
				</Button>
			</View>
		</ScrollView>
	);
}
