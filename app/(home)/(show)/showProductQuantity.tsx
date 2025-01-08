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

export default function ShowProductQuantity() {
	const theme = useTheme();
	const { t } = useTranslation();

	const [productList, setProductList] = useState([]);
	const [hintProductList, setHintProductList] = useState([]);

	const [name, setName] = useState('');
	const [product, setProduct] = useState([]);
	const [productQuantity, setProductQuantity] = useState([]);

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
			getAllProductsCount();

			// Screen unfocused in return
			return () => {
				//console.log('This route is now unfocused.');
				setName('');
				setProduct([]);
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
		const currentProduct = [];

		for (const doc of productList) {
			if (doc.name === productName.trim()) {
				currentProduct.push({
					key: doc.key,
					name: doc.name,
					price: doc.price,
					priceWeight: doc.priceWeight,
				});
			}
		}

		//console.log(currentProduct[0]);
		if (currentProduct.length === 1) {
			setProduct(currentProduct[0]);
			getProductCount(currentProduct[0].key);
		}

		return currentProduct[0];
	};

	const getProductCount = (productKey: string) => {
		//console.log(productKey);
		const filteredCount = [];
		for (const count of productQuantity) {
			if (count.productKey === productKey) {
				filteredCount.push(count);
			}
		}

		setProductQuantity(filteredCount);
		//console.log(filteredCount);
	};

	const getAllProductsCount = async () => {
		await firestore()
			.collection('orders')
			.orderBy('client.name', 'asc')
			.get()
			.then((snapshot) => {
				const currentCount = [];
				const productCount = {};
				let i = 0;
				// biome-ignore lint/complexity/noForEach: <explanation>
				snapshot.forEach((doc) => {
					for (const order of doc.data().order) {
						const existingProduct = currentCount.find(
							(product) =>
								order.product.name === product.name &&
								order.weight === product.weight
						);

						//console.log(existingProduct);
						if (existingProduct) {
							existingProduct.quantity += order.quantity;
							if (
								productCount[existingProduct.name] &&
								order.product.priceWeight &&
								order.weight
							) {
								productCount[existingProduct.name] +=
									order.quantity * order.weight;
								existingProduct.weightTotal =
									productCount[existingProduct.name];
							}
						} else {
							if (!productCount[order.product.name])
								productCount[order.product.name] =
									order.weight * order.quantity;
							else {
								productCount[order.product.name] +=
									order.weight * order.quantity;
							}
							currentCount.push({
								key: i,
								productKey: order.product.key,
								name: order.product.name,
								quantity: order.quantity,
								weight: order.weight,
								weightTotal: productCount[order.product.name],
							});
							i++;
						}
					}
				});
				for (const count of currentCount) {
					count.weightTotal = productCount[count.name];
				}
				setProductQuantity(currentCount);
				//console.log(currentCount);
			})
			.catch((e: any) => {
				const err = e as FirebaseError;
				console.log(`Error getting product list: ${err.message}`);
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
						const currentProduct = [];
						currentProduct.push({
							key: item.item.key,
							name: item.item.name,
							price: item.item.price,
							priceWeight: item.item.priceWeight,
						});
						setName(item.item.name);
						setProduct(currentProduct[0]);
						getProductCount(currentProduct[0].key);
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
							setProduct([]);
							setHintProductList([]);
							getAllProductsCount();
						}}
					/>
				</KeyboardAvoidingView>
				<View>
					<DataTableOrder
						data={productQuantity}
						dataType='productQuantity'
						defaultSort='name'
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
