import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Keyboard } from 'react-native';
import {
	Button,
	Divider,
	TouchableRipple,
	Text,
	TextInput,
	useTheme,
} from 'react-native-paper';
import type { FirebaseError } from 'firebase/app';
import firestore, { Timestamp } from '@react-native-firebase/firestore';
import { useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import Fuse from 'fuse.js';
import DatePicker from 'react-native-date-picker';
import SnackbarInfo from '@/components/SnackbarInfo';
import SearchList from '@/components/SearchList';
import DataTableOrder from '@/components/DataTableOrder';

export default function AddOrder() {
	const theme = useTheme();
	const { t } = useTranslation();

	const [loading, setLoading] = useState(false);
	const [deliveryDateModal, setDeliveryDateModal] = useState(false);
	const [deliveryTimeModal, setDeliveryTimeModal] = useState(false);

	const [clientList, setClientList] = useState([]);
	const [hintClientList, setHintClientList] = useState([]);
	const [productList, setProductList] = useState([]);
	const [hintProductList, setHintProductList] = useState([]);

	const [name, setName] = useState('');
	const [productName, setProductName] = useState('');
	const [productQuantity, setProductQuantity] = useState('1');
	const [productWeight, setProductWeight] = useState('');
	const [notes, setNotes] = useState('');

	const [client, setClient] = useState({});
	const [product, setProduct] = useState({});
	const [order, setOrder] = useState([]);
	const [deliveryDate, setDeliveryDate] = useState(new Date());
	const [deliveryTime, setDeliveryTime] = useState(new Date(0, 0, 0));

	// All the logic to implement the snackbar
	const [snackbarVisible, setSnackbarVisible] = useState(false);
	const [snackbarText, setSnackbarText] = useState('');

	const showSnackbar = (text: string) => {
		setSnackbarText(text);
		setSnackbarVisible(true);
	};
	const onDismissSnackbar = () => setSnackbarVisible(false);

	useFocusEffect(
		useCallback(() => {
			// Screen focused
			//console.log("Hello, I'm focused!");
			getClientList();
			getProductList();

			// Screen unfocused in return
			return () => {
				//console.log('This route is now unfocused.');
			};
		}, [])
	);

	const getClientList = async () => {
		await firestore()
			.collection('clients')
			.orderBy('name', 'asc')
			.get()
			.then((querySnapshot) => {
				const clientsName = [];
				// biome-ignore lint/complexity/noForEach:<Method that returns iterator necessary>
				querySnapshot.forEach((doc) => {
					clientsName.push({ key: doc.id, name: doc.data().name });
				});
				//console.log(clientsName);
				setClientList(clientsName);
			})
			.catch((e: any) => {
				const err = e as FirebaseError;
				console.log(`Error getting client list: ${err.message}`);
			});
	};

	const getProductList = async () => {
		await firestore()
			.collection('products')
			.orderBy('name', 'asc')
			.get()
			.then((querySnapshot) => {
				const productsName = [];
				// biome-ignore lint/complexity/noForEach:<Method that returns iterator necessary>
				querySnapshot.forEach((doc) => {
					productsName.push({
						key: doc.id,
						name: doc.data().name,
						price: Number(doc.data().price),
						priceWeight: doc.data().priceByWeight,
					});
				});
				//console.log(productsName);
				setProductList(productsName);
			})
			.catch((e: any) => {
				const err = e as FirebaseError;
				console.log(`Error getting product list: ${err.message}`);
			});
	};

	const filterClientList = async (input: string) => {
		const fuseOptions = {
			includeScore: true,
			keys: ['name'],
			minMatchCharLength: 2,
			threshold: 0.3,
			limit: 5,
		};
		const fuse = new Fuse(clientList, fuseOptions);

		const results = fuse.search(input);
		setHintClientList(results);
		//console.log(results);
	};

	const filterProductList = async (input: string) => {
		const fuseOptions = {
			includeScore: true,
			keys: ['name'],
			minMatchCharLength: 2,
			threshold: 0.3,
			limit: 5,
		};
		const fuse = new Fuse(productList, fuseOptions);

		const results = fuse.search(input);
		setHintProductList(results);
		//console.log(results);
	};

	const checkClient = () => {
		let clientExists = false;

		for (const client of clientList) {
			//console.log(client.name + ' : ' + name + ' : ' + (client.name === name));
			if (client.name === name) clientExists = true;
		}

		//console.log(clientExists);
		return clientExists;
	};

	const getClient = (clientName: string) => {
		if (Object.keys(client).length !== 0) return;
		const currentClient = {};

		for (const doc of clientList) {
			if (doc.name === clientName.trim()) {
				currentClient.key = doc.key;
				currentClient.name = doc.name;
			}
		}
		setClient(currentClient);
		console.log(currentClient);

		return currentClient;
	};

	const getProduct = (productName: string) => {
		if (Object.keys(product).length !== 0) return;
		const currentProduct = {};

		for (const doc of productList) {
			if (doc.name === productName.trim()) {
				currentProduct.key = doc.key;
				currentProduct.name = doc.name;
				currentProduct.price = doc.price;
				currentProduct.priceWeight = doc.priceWeight;
			}
		}
		setProduct(currentProduct);
		console.log(currentProduct);

		return currentProduct;
	};

	const addToOrder = () => {
		Keyboard.dismiss();

		if (Object.keys(client).length === 0) {
			const currentClient = getClient(name);
			console.log(currentClient);
			if (Object.keys(currentClient).length === 0) {
				showSnackbar('No valid client selected!');
				console.log('No client error');
				return;
			}
		} else if (Object.keys(product).length === 0) {
			const currentProduct = getProduct(productName);
			console.log(!currentProduct);
			if (Object.keys(currentProduct).length === 0) {
				showSnackbar('No valid product selected!');
				console.log('No product error');
				return;
			}
		}
		//console.log(client);
		console.log(product);
		console.log(product.priceWeight);
		console.log(!productWeight.trim());

		if (product.priceWeight && !productWeight.trim()) {
			showSnackbar('Weight is mandatory for this product!');
			console.log('No weight for priceByWeight product');
			return;
		}

		const weight =
			product.priceWeight && productWeight.trim()
				? Number(Number.parseFloat(productWeight).toFixed(2))
				: Number(Number.parseFloat('0.00').toFixed(2));
		//console.log(weight)

		const price =
			product.priceWeight && weight > 0
				? Number(productQuantity) * (product.price * weight)
				: Number(productQuantity) * product.price;
		//console.log(price);

		try {
			const newOrder = order;
			//console.log(newOrder.length);
			newOrder.push({
				key: newOrder.length,
				product: product,
				quantity: Number(productQuantity),
				weight: weight,
				price: Number(price.toFixed(2)),
				notes: notes,
				status: 'Incomplete',
			});
			//console.log(newOrder);
			setOrder(newOrder);
		} catch {
			(e: any) => {
				const err = e as FirebaseError;
				console.log(`Error adding to order: ${err.message}`);
			};
		} finally {
			setProductName('');
			setProductQuantity('1');
			setProductWeight('');
			setNotes('');
			setProduct({});

			showSnackbar('Added to current order!');
			console.log('Added to order');
		}
	};

	const createOrder = async () => {
		setLoading(true);
		Keyboard.dismiss();

		if (!name.trim() || !client || !checkClient()) {
			showSnackbar('No valid client selected!');
			//setNameError(true);
			setLoading(false);
			return;
		} else if (!order.length) {
			showSnackbar('Order is empty!');
			console.log('Order empty');
			setLoading(false);
			return;
		}

		const docRef = firestore().collection('orders').doc();

		try {
			docRef
				.set({
					client: client,
					order: order,
					deliveryDateTime: Timestamp.fromDate(
						new Date(
							deliveryDate.getFullYear(),
							deliveryDate.getMonth(),
							deliveryDate.getDate(),
							deliveryTime.getHours(),
							deliveryTime.getMinutes(),
							deliveryTime.getSeconds()
						)
					),
				})
				.then(() => {
					console.log('Added');
					showSnackbar(t('add.order.added'));
					setName('');
					setClient({});
					setHintClientList([]);
					setProductName('');
					setProduct({});
					setHintProductList([]);
					setProductQuantity('1');
					setProductWeight('');
					setOrder([]);
				});
		} catch (e: any) {
			const err = e as FirebaseError;
			console.log(`Adding order failed: ${err.message}`);
			setLoading(false);
		} finally {
			setLoading(false);
		}
	};

	const deleteOrder = async (item: object) => {
		console.log(item);
		const updatedOrder = [];
		let i = 0;

		try {
			for (const singleOrder of order) {
				console.log(singleOrder);
				if (singleOrder.key !== item.key) {
					singleOrder.key = i;
					updatedOrder.push(singleOrder);
					i++;
				}
			}

			console.log(updatedOrder);
			setOrder(updatedOrder);
			showSnackbar('Deleted!');
		} catch (e: any) {
			console.log(`Deleting order failed: ${e.message}`);
		}
	};

	const renderClientHint = ({ item }) => {
		//console.log(item.item.name + ' : ' + item.score);
		return (
			<>
				<Divider bold={true} />
				<TouchableRipple
					onPress={() => {
						Keyboard.dismiss();

						const currentClient = {};
						currentClient.key = item.item.key;
						currentClient.name = item.item.name;

						setName(item.item.name);
						//console.log(currentClient);
						setClient(currentClient);
						setHintClientList([]);
					}}
				>
					<Text style={{ padding: 5 }}>{item.item.name}</Text>
				</TouchableRipple>
				<Divider bold={true} />
			</>
		);
	};

	const renderProductHint = ({ item }) => {
		//console.log(item.item.name + ' : ' + item.score);
		return (
			<>
				<Divider bold={true} />
				<TouchableRipple
					onPress={() => {
						Keyboard.dismiss();

						const currentProduct = {};
						currentProduct.key = item.item.key;
						currentProduct.name = item.item.name;
						currentProduct.price = item.item.price;
						currentProduct.priceWeight = item.item.priceWeight;

						setProductName(item.item.name);
						//console.log(currentProduct);
						setProduct(currentProduct);
						setHintProductList([]);
					}}
				>
					<Text style={{ padding: 5 }}>{item.item.name}</Text>
				</TouchableRipple>
				<Divider bold={true} />
			</>
		);
	};

	return (
		<>
			<SnackbarInfo
				text={snackbarText}
				visible={snackbarVisible}
				onDismiss={onDismissSnackbar}
			/>

			<View style={styles.container}>
				<KeyboardAvoidingView style={{ paddingHorizontal: 10 }}>
					<SearchList
						style={{ marginBottom: 10 }}
						icon='account'
						value={name}
						placeholder='Search Client'
						data={hintClientList}
						onChangeText={(input) => {
							setName(input);
							if (input.trim()) filterClientList(input);
							else setHintClientList([]);
						}}
						onEndEditing={() => {
							setHintClientList([]);
							if (!client) {
								getClient(name);
							}
						}}
						renderItem={renderClientHint}
						onClearIconPress={() => {
							setName('');
							setClient({});
							setOrder([]);
							setHintClientList([]);
						}}
					/>
					<SearchList
						icon='cake-variant'
						value={productName}
						placeholder='Search Product'
						data={hintProductList}
						onChangeText={(input) => {
							setProductName(input);
							if (input.trim()) filterProductList(input);
							else setHintProductList([]);
						}}
						onEndEditing={() => {
							setHintProductList([]);
							if (!product) {
								getProduct(productName);
							}
						}}
						renderItem={renderProductHint}
						onClearIconPress={() => {
							setProductName('');
							setProduct({});
							setHintProductList([]);
						}}
					/>
					<View
						style={{
							flexDirection: 'row',
							marginVertical: 10,
						}}
					>
						<View
							style={{
								flexDirection: 'row',
								width: '50%',
								alignItems: 'center',
								justifyContent: 'center',
							}}
						>
							<TouchableRipple
								style={{
									marginRight: 5,
									width: '15%',
									paddingVertical: 5,
									paddingHorizontal: 10,
									borderRadius: 15,
								}}
								borderless={true}
								onPress={() => {
									if (Number(productQuantity) > 1)
										setProductQuantity(
											(Number(productQuantity) - 1).toString()
										);
								}}
							>
								<Text
									style={{
										color: theme.colors.primary,
										fontSize: 20,
										fontWeight: 'bold',
										paddingTop: 5,
										paddingBottom: 5,
										textAlign: 'center',
										textAlignVertical: 'center',
									}}
								>
									-
								</Text>
							</TouchableRipple>
							<TextInput
								style={{ width: '45%' }}
								mode='outlined'
								value={productQuantity}
								onChangeText={(input) => {
									setProductQuantity(input.replace(/[^0-9]/g, ''));
								}}
								onEndEditing={() => {
									if (!productQuantity.trim()) {
										setProductQuantity('1');
									}
								}}
								autoCapitalize='none'
								keyboardType='numeric'
								label='Quantity'
							/>
							<TouchableRipple
								style={{
									marginHorizontal: 5,
									width: '15%',
									paddingVertical: 5,
									paddingHorizontal: 10,
									borderRadius: 15,
								}}
								borderless={true}
								onPress={() => {
									setProductQuantity((Number(productQuantity) + 1).toString());
								}}
							>
								<Text
									style={{
										color: theme.colors.primary,
										fontSize: 20,
										fontWeight: 'bold',
										paddingTop: 5,
										paddingBottom: 5,
										textAlign: 'center',
										textAlignVertical: 'center',
									}}
								>
									+
								</Text>
							</TouchableRipple>
						</View>
						<View
							style={{
								width: '49%',
							}}
						>
							<TextInput
								mode='outlined'
								value={productWeight}
								onChangeText={(input) => {
									setProductWeight(input.replace(/[^0-9.,]/g, ''));
								}}
								onEndEditing={() => {
									setProductWeight(productWeight.replace(',', '.').trim());
								}}
								autoCapitalize='none'
								keyboardType='decimal-pad'
								label='Weight(kg)'
							/>
						</View>
					</View>
					<TextInput
						style={styles.input}
						value={notes}
						onChangeText={setNotes}
						autoCapitalize='sentences'
						keyboardType='default'
						label='Notes'
					/>
					<Button
						style={styles.button}
						labelStyle={[styles.buttonText, { fontSize: 20, paddingTop: 5 }]}
						onPress={addToOrder}
					>
						Add to Order
					</Button>
				</KeyboardAvoidingView>
				<View>
					<DataTableOrder
						data={order}
						dataType='newOrder'
						defaultSort='product.name'
						numberofItemsPerPageList={[2, 3, 4]}
						onLongPress={(item: object) => {
							deleteOrder(item);
						}}
					/>
					<View
						style={{
							flexDirection: 'row',
							//alignItems: 'center',
							justifyContent: 'center',
							alignContent: 'center',
							marginTop: 10,
						}}
					>
						<Text style={[styles.title, { color: theme.colors.primary }]}>
							Delivery Date:
						</Text>

						<Button
							labelStyle={styles.dateText}
							onPress={() => setDeliveryDateModal(true)}
						>
							{deliveryDate.toLocaleDateString('pt-pt')}
						</Button>
						<DatePicker
							modal
							mode='date'
							locale='pt-pt'
							is24hourSource='locale'
							open={deliveryDateModal}
							date={deliveryDate}
							minimumDate={new Date()}
							theme={theme.dark ? 'dark' : 'light'}
							onConfirm={(date) => {
								setDeliveryDateModal(false);
								setDeliveryDate(date);
							}}
							onCancel={() => {
								setDeliveryDateModal(false);
							}}
						/>

						<Button
							labelStyle={styles.dateText}
							onPress={() => setDeliveryTimeModal(true)}
						>
							{deliveryTime.toLocaleTimeString('pt-pt')}
						</Button>
						<DatePicker
							modal
							mode='time'
							locale='pt-pt'
							is24hourSource='locale'
							open={deliveryTimeModal}
							date={deliveryTime}
							//minimumDate={new Date()}
							theme={theme.dark ? 'dark' : 'light'}
							onConfirm={(date) => {
								setDeliveryTimeModal(false);
								setDeliveryTime(date);
							}}
							onCancel={() => {
								setDeliveryTimeModal(false);
							}}
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
						loading={loading}
						onPress={createOrder}
					>
						{t('add.order.add')}
					</Button>
				</View>
			</View>
		</>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	buttonContainer: {
		flex: 1,
		justifyContent: 'flex-end',
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
	input: {
		marginVertical: 2,
	},
	title: {
		fontSize: 20,
		fontWeight: 'bold',
	},
	dateText: {
		fontWeight: 'bold',
		fontSize: 20,
		marginVertical: 6,
	},
	errorHelper: {
		fontWeight: 'bold',
		fontSize: 15,
	},
});
