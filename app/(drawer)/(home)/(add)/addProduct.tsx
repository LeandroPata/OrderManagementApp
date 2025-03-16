import React, { useState } from 'react';
import { View, KeyboardAvoidingView, Keyboard, ScrollView } from 'react-native';
import {
	Button,
	TextInput,
	HelperText,
	Checkbox,
	Text,
} from 'react-native-paper';
import type { FirebaseError } from 'firebase/app';
import firestore from '@react-native-firebase/firestore';
import { useTranslation } from 'react-i18next';
import SnackbarInfo from '@/components/SnackbarInfo';
import { globalStyles } from '@/styles/global';

export default function AddProduct() {
	const { t } = useTranslation();

	const [loading, setLoading] = useState(false);

	const [nameError, setNameError] = useState(false);

	const [name, setName] = useState('');
	const [price, setPrice] = useState('');
	const [priceWeightChecked, setPriceWeightChecked] = useState(false);

	// All the logic to implement the snackbar
	const [snackbarVisible, setSnackbarVisible] = useState(false);
	const [snackbarText, setSnackbarText] = useState('');

	const showSnackbar = (text: string) => {
		setSnackbarText(text);
		setSnackbarVisible(true);
	};
	const onDismissSnackbar = () => setSnackbarVisible(false);

	const checkProduct = async () => {
		let productExists = false;
		await firestore()
			.collection('products')
			.orderBy('name', 'asc')
			.get()
			.then((querySnapshot) => {
				// biome-ignore lint/complexity/noForEach:<Method that returns iterator necessary>
				querySnapshot.forEach((doc) => {
					if (name.trim() === doc.data().name) productExists = true;
				});
			});
		console.log(`Product exists: ${productExists}`);
		return productExists;
	};

	const addProduct = async () => {
		setLoading(true);
		Keyboard.dismiss();

		if (!name.trim() || Boolean(await checkProduct())) {
			showSnackbar(t('add.product.nameError'));
			setNameError(true);
			setLoading(false);
			return;
		}

		const docRef = firestore().collection('products').doc();

		docRef
			.set({
				name: name.trim(),
				price: Number(price.replace(',', '.').trim()).toFixed(2),
				priceByWeight: priceWeightChecked,
			})
			.then(() => {
				console.log('Added');
				showSnackbar(t('add.product.added'));
				setName('');
				setPrice('');
				setPriceWeightChecked(false);
			})
			.catch((e: any) => {
				const err = e as FirebaseError;
				console.log(`Adding product failed: ${err.message}`);
				setLoading(false);
			})
			.finally(() => {
				setLoading(false);
				setNameError(false);
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
						label={t('add.product.name')}
					/>
					{nameError ? (
						<HelperText
							type='error'
							visible={nameError}
							style={globalStyles.text.errorHelper}
						>
							{t('add.product.nameInvalid')}
						</HelperText>
					) : null}

					<View
						style={{
							flexDirection: 'row',
							alignItems: 'center',
							justifyContent: 'space-between',
						}}
					>
						<TextInput
							style={[globalStyles.input, { width: '50%' }]}
							value={price}
							onChangeText={(input) => {
								setPrice(input.replace(/[^0-9.,]/g, ''));
							}}
							onEndEditing={() => {
								setPrice(Number(price.replace(',', '.').trim()).toFixed(2));
							}}
							autoCapitalize='none'
							inputMode='decimal'
							keyboardType='decimal-pad'
							label={t('add.product.price')}
						/>
						<View style={{ flexDirection: 'row', marginRight: 10 }}>
							<Checkbox
								status={priceWeightChecked ? 'checked' : 'unchecked'}
								onPress={() => setPriceWeightChecked(!priceWeightChecked)}
							/>
							<Text style={globalStyles.text.global}>
								{t('add.product.priceWeight')}
							</Text>
						</View>
					</View>
				</KeyboardAvoidingView>

				<View style={globalStyles.buttonContainer.global}>
					<Button
						style={globalStyles.button}
						contentStyle={globalStyles.buttonContent.global}
						labelStyle={globalStyles.buttonText.global}
						icon='account-plus'
						mode='elevated'
						loading={loading}
						onPress={addProduct}
					>
						{t('add.product.add')}
					</Button>
				</View>
			</ScrollView>
		</>
	);
}
