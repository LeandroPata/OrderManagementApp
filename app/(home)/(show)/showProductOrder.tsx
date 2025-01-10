import React, { useCallback, useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Keyboard } from 'react-native';
import { Divider, Text, TouchableRipple, useTheme } from 'react-native-paper';
import type { FirebaseError } from 'firebase/app';
import firestore from '@react-native-firebase/firestore';
import { useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import Fuse from 'fuse.js';
import SnackbarInfo from '@/components/SnackbarInfo';
import SearchList from '@/components/SearchList';
import DataTableOrder from '@/components/DataTableOrder';

export default function ShowProductOrder() {
	const theme = useTheme();
	const { t } = useTranslation();

	const [productList, setProductList] = useState([]);
	const [hintProductList, setHintProductList] = useState([]);

	const [name, setName] = useState('');
	const [product, setProduct] = useState({});
	const [productOrders, setProductOrders] = useState([]);

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
			getProductList();

			// Screen unfocused in return
			return () => {
				//console.log('This route is now unfocused.');
				setName('');
				setProduct({});
				setProductOrders([]);
			};
		}, [])
	);

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

	const getProduct = (productName: string) => {
		if (product) return;
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
		getProductOrders(currentProduct.key);

		return currentProduct;
	};

	const getProductOrders = async (productKey: string) => {
		//console.log(productKey);
		await firestore()
			.collection('orders')
			.orderBy('client.name', 'asc')
			.get()
			.then((snapshot) => {
				const orders = [];
				let i = 0;
				// biome-ignore lint/complexity/noForEach:<Method that returns iterator necessary>
				snapshot.forEach((doc) => {
					console.log(doc.data());

					for (const order of doc.data().order) {
						//console.log(`${order.product.key} : ${productKey}`);

						if (order.product.key === productKey) {
							console.log(order);
							orders.push({
								key: i,
								client: doc.data().client,
								quantity: order.quantity,
								weight: order.weight,
								price: order.price,
								notes: order.notes,
								deliveryDateTime: new Date(
									doc.data().deliveryDateTime.toDate()
								),
							});
							i++;
						}
					}
				});

				setProductOrders(orders);
				//console.log(orders);
			});
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

						setName(item.item.name);
						setProduct(currentProduct);
						getProductOrders(currentProduct.key);
						setHintProductList([]);
						//console.log(currentProduct[0]);
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
				<KeyboardAvoidingView
					style={{ paddingHorizontal: 10, marginBottom: 120 }}
				>
					<SearchList
						style={{ marginBottom: 10 }}
						icon='account'
						value={name}
						placeholder='Search Product'
						data={hintProductList}
						onChangeText={(input) => {
							setName(input);
							if (input.trim()) filterProductList(input);
							else setHintProductList([]);
						}}
						onEndEditing={() => {
							setHintProductList([]);
							if (!product) {
								getProduct(name);
							}
						}}
						renderItem={renderProductHint}
						onClearIconPress={() => {
							setName('');
							setProduct({});
							setHintProductList([]);
							setProductOrders([]);
						}}
					/>
				</KeyboardAvoidingView>
				<View>
					<DataTableOrder
						data={productOrders}
						dataType='productOrder'
						defaultSort='client.name'
						numberofItemsPerPageList={[6, 7, 8]}
					/>
				</View>
			</View>
		</>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	input: {
		marginVertical: 2,
	},
	errorHelper: {
		fontWeight: 'bold',
		fontSize: 15,
	},
});
