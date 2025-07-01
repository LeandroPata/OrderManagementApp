import firestore, { Timestamp } from '@react-native-firebase/firestore';
import { useFocusEffect } from 'expo-router';
import type { FirebaseError } from 'firebase/app';
import Fuse from 'fuse.js';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Keyboard, KeyboardAvoidingView, ScrollView, View } from 'react-native';
import DatePicker from 'react-native-date-picker';
import {
	Button,
	Divider,
	Text,
	TextInput,
	TouchableRipple,
	useTheme,
} from 'react-native-paper';
import DataTableOrder from '@/components/DataTableOrder';
import SearchList from '@/components/SearchList';
import { useSnackbar } from '@/context/SnackbarContext';
import { globalStyles } from '@/styles/global';

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

	const [clientId, setClientId] = useState('');
	const [productId, setProductId] = useState('');
	const [orders, setOrders] = useState([]);
	const [deliveryDate, setDeliveryDate] = useState(new Date());
	const [deliveryTime, setDeliveryTime] = useState(new Date(0, 0, 0));

	// All the logic to implement the snackbar
	const { showSnackbar } = useSnackbar();

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

				querySnapshot.forEach((doc) => {
					clientsName.push({ id: doc.id, name: doc.data().name });
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

				querySnapshot.forEach((doc) => {
					productsName.push({
						id: doc.id,
						name: doc.data().name,
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
		if (clientId) return;

		firestore()
			.collection('clients')
			.where('name', '==', clientName)
			.get()
			.then((snapshot) => {
				if (!snapshot.docs.length)
					if (name) showSnackbar(t('add.order.clientNameInvalid'));
					else showSnackbar(t('add.order.clientNameEmpty'));
				//console.log(snapshot.docs[0].id);
				//console.log(snapshot.docs[0].data());
				setClientId(snapshot.docs[0].id);
				//getClientOrders(snapshot.docs[0].id);
			})
			.catch((e: any) => {
				const err = e as FirebaseError;
				console.log(`Error getting client: ${err.message}`);
			});
	};

	const getProduct = (productName: string) => {
		if (productId) return;

		firestore()
			.collection('products')
			.where('name', '==', productName)
			.get()
			.then((snapshot) => {
				if (!snapshot.docs.length)
					if (name) showSnackbar(t('add.order.productNameInvalid'));
					else showSnackbar(t('add.order.productNameEmpty'));
				//console.log(snapshot.docs[0].id);
				//console.log(snapshot.docs[0].data());
				setProductId(snapshot.docs[0].id);
				//getProductOrders(snapshot.docs[0].id);
			})
			.catch((e: any) => {
				const err = e as FirebaseError;
				console.log(`Error getting product: ${err.message}`);
			});
	};

	const addToOrder = async () => {
		Keyboard.dismiss();
		try {
			if (clientId === '') {
				const currentClientId = getClient(name);
				//console.log(currentClientId);
				if (currentClientId === '') {
					showSnackbar(t('add.order.clientNameInvalid'));
					console.log('No client error');
					return;
				}
			} else if (productId === '') {
				const currentProduct = getProduct(productName);
				//console.log(!currentProduct);
				if (Object.keys(currentProduct).length === 0) {
					showSnackbar(t('add.order.productNameInvalid'));
					console.log('No product error');
					return;
				}
			}

			//console.log(clientId);
			//console.log(productId);
			const product = {};

			await firestore()
				.collection('products')
				.doc(productId)
				.get()
				.then((snapshot) => {
					product.price = snapshot.data().price;
					product.priceWeight = snapshot.data().priceByWeight;
				})
				.catch((e: any) => {
					const err = e as FirebaseError;
					console.log(`Getting product data failed: ${err.message}`);
				});
			//console.log(product);
			//console.log(product.priceWeight);
			//console.log(!productWeight.trim());

			if (product.priceWeight && !productWeight.trim()) {
				showSnackbar(t('add.order.weightMandatory'));
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

			const newOrder = orders;

			const newOrderRef = firestore().collection('orders').doc();
			//console.log(newOrderRef.id);
			newOrder.push({
				id: newOrderRef.id,
				product: { id: productId, name: productName },
				quantity: Number(productQuantity),
				weight: weight,
				price: Number(price.toFixed(2)),
				notes: notes,
				status: 'Incomplete',
			});
			//console.log(newOrder);
			setOrders(newOrder);
		} catch {
			(e: any) => {
				console.log(`Error adding to order: ${e.message}`);
			};
		} finally {
			setProductName('');
			setProductQuantity('1');
			setProductWeight('');
			setNotes('');
			setProductId('');

			showSnackbar(t('add.order.addedToOrder'));
			console.log('Added to order');
		}
	};

	const createOrder = async () => {
		setLoading(true);
		Keyboard.dismiss();

		if (!name.trim() || !clientId || !checkClient()) {
			showSnackbar(t('add.order.clientNameInvalid'));
			//setNameError(true);
			setLoading(false);
			return;
		} else if (!orders.length) {
			showSnackbar(t('add.order.orderEmpty'));
			console.log('Order empty');
			setLoading(false);
			return;
		}

		const clientName = await (
			await firestore().collection('clients').doc(clientId).get()
		).data().name;

		if (!clientName) {
			console.log('Error getting client name');
			return;
		}

		try {
			const batch = firestore().batch();
			for (const order of orders) {
				//console.log(order);
				const orderRef = firestore().collection('orders').doc(order.id);
				//console.log(orderRef);
				const orderDB = {
					client: { id: clientId, name: clientName },
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
				};
				//console.log(orderDB);
				batch.set(orderRef, orderDB);
			}
			await batch.commit();

			console.log('Added');
			showSnackbar(t('add.order.addedOrder'));
			setName('');
			setClientId('');
			setHintClientList([]);
			setProductName('');
			setProductId('');
			setHintProductList([]);
			setProductQuantity('1');
			setProductWeight('');
			setOrders([]);
		} catch (e: any) {
			const err = e as FirebaseError;
			console.log(`Adding order failed: ${err.message}`);
			setLoading(false);
			return;
		} finally {
			setLoading(false);
		}
	};

	const deleteOrder = async (item: object) => {
		//console.log(item);

		try {
			const orderIndex = orders.findIndex((order) => order.id === item.id);
			//console.log(orderIndex);

			//console.log(orders);
			const updatedOrder = orders.toSpliced(orderIndex, 1);
			//console.log(updatedOrder);
			setOrders(updatedOrder);

			showSnackbar(t('add.order.deleted'));
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

						setName(item.item.name);
						setClientId(item.item.id);
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

						setProductName(item.item.name);
						//console.log(currentProduct);
						setProductId(item.item.id);
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
			<SearchList
				style={globalStyles.searchList}
				icon='account'
				value={name}
				placeholder={t('add.order.clientSearch')}
				data={hintClientList}
				autoCapitalize='words'
				onChangeText={(input) => {
					setName(input);
					if (input.trim()) filterClientList(input);
					else setHintClientList([]);
				}}
				/* onEndEditing={() => {
					setHintClientList([]);
					if (!clientId) {
						getClient(name);
					}
				}} */
				onSubmitEditing={() => {
					if (!clientId) {
						getClient(name);
					}
				}}
				onFocus={() => filterClientList(name)}
				onBlur={() => setHintClientList([])}
				renderItem={renderClientHint}
				onClearIconPress={() => {
					setName('');
					setClientId('');
					setOrders([]);
					setHintClientList([]);
				}}
			/>

			<SearchList
				style={globalStyles.searchList}
				icon='cake-variant'
				value={productName}
				placeholder={t('add.order.productSearch')}
				data={hintProductList}
				autoCapitalize='words'
				onChangeText={(input) => {
					setProductName(input);
					if (input.trim()) filterProductList(input);
					else setHintProductList([]);
				}}
				/* onEndEditing={() => {
					setHintProductList([]);
					if (!productId) {
						getProduct(productName);
					}
				}} */
				onSubmitEditing={() => {
					if (!productId) {
						getProduct(productName);
					}
				}}
				onFocus={() => filterProductList(productName)}
				onBlur={() => setHintProductList([])}
				renderItem={renderProductHint}
				onClearIconPress={() => {
					setProductName('');
					setProductId('');
					setHintProductList([]);
				}}
			/>

			<ScrollView
				contentContainerStyle={globalStyles.scrollContainer.global}
				keyboardShouldPersistTaps='handled'
			>
				<KeyboardAvoidingView style={{ paddingHorizontal: 10 }}>
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
								style={globalStyles.quantityButtonStyle}
								borderless={true}
								onPress={() => {
									if (Number(productQuantity) > 1)
										setProductQuantity(
											(Number(productQuantity) - 1).toString()
										);
								}}
							>
								<Text
									style={[
										globalStyles.quantityButtonText,
										{
											color: theme.colors.primary,
										},
									]}
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
								label={t('add.order.productQuantity')}
							/>
							<TouchableRipple
								style={globalStyles.quantityButtonStyle}
								borderless={true}
								onPress={() => {
									setProductQuantity((Number(productQuantity) + 1).toString());
								}}
							>
								<Text
									style={[
										globalStyles.quantityButtonText,
										{
											color: theme.colors.primary,
										},
									]}
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
								label={`${t('add.order.weight')}(kg)`}
							/>
						</View>
					</View>
					<TextInput
						style={globalStyles.input}
						value={notes}
						onChangeText={setNotes}
						autoCapitalize='sentences'
						keyboardType='default'
						label={t('add.order.notes')}
					/>
					<Button
						style={[globalStyles.button, { width: '50%', alignSelf: 'center' }]}
						labelStyle={[
							globalStyles.buttonText.global,
							{ fontSize: 20, paddingTop: 5 },
						]}
						onPress={addToOrder}
					>
						{t('add.order.addToOrder')}
					</Button>
				</KeyboardAvoidingView>
				<View>
					<DataTableOrder
						data={orders}
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
							justifyContent: 'center',
							alignContent: 'center',
							marginTop: 10,
						}}
					>
						<Text
							style={[
								globalStyles.text.deliveryDate,
								{ color: theme.colors.primary },
							]}
						>
							{t('add.order.deliveryDate')}
						</Text>

						<Button
							labelStyle={globalStyles.text.date}
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
							labelStyle={globalStyles.text.date}
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

				<View style={globalStyles.buttonContainer.order}>
					<Button
						style={globalStyles.button}
						contentStyle={globalStyles.buttonContent.global}
						labelStyle={globalStyles.buttonText.global}
						icon='package-variant-closed'
						mode='elevated'
						loading={loading}
						onPress={createOrder}
					>
						{t('add.order.addOrder')}
					</Button>
				</View>
			</ScrollView>
		</>
	);
}
