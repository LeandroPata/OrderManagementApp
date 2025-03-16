import React, { useState } from 'react';
import { View, KeyboardAvoidingView, Keyboard, ScrollView } from 'react-native';
import { Button, TextInput, HelperText } from 'react-native-paper';
import type { FirebaseError } from 'firebase/app';
import firestore from '@react-native-firebase/firestore';
import { useTranslation } from 'react-i18next';
import SnackbarInfo from '@/components/SnackbarInfo';
import { globalStyles } from '@/styles/global';

export default function AddClient() {
	const { t } = useTranslation();

	const [loading, setLoading] = useState(false);

	const [nameError, setNameError] = useState(false);

	const [name, setName] = useState('');
	const [contact, setContact] = useState('');

	// All the logic to implement the snackbar
	const [snackbarVisible, setSnackbarVisible] = useState(false);
	const [snackbarText, setSnackbarText] = useState('');

	const showSnackbar = (text: string) => {
		setSnackbarText(text);
		setSnackbarVisible(true);
	};
	const onDismissSnackbar = () => setSnackbarVisible(false);

	const checkClient = async () => {
		let clientExists = false;
		await firestore()
			.collection('clients')
			.orderBy('name', 'asc')
			.get()
			.then((querySnapshot) => {
				// biome-ignore lint/complexity/noForEach:<Method that returns iterator necessary>
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
	};

	const addClient = async () => {
		setLoading(true);
		Keyboard.dismiss();

		if (!name.trim() || Boolean(await checkClient())) {
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
		<>
			<SnackbarInfo
				text={snackbarText}
				visible={snackbarVisible}
				onDismiss={onDismissSnackbar}
			/>

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
						autoCapitalize='words'
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
		</>
	);
}
