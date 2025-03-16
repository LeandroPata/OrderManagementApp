import React, { useCallback, useState } from 'react';
import { Keyboard, ScrollView } from 'react-native';
import { Divider, Text, TouchableRipple } from 'react-native-paper';
import type { FirebaseError } from 'firebase/app';
import firestore from '@react-native-firebase/firestore';
import { useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import Fuse from 'fuse.js';
import SnackbarInfo from '@/components/SnackbarInfo';
import SearchList from '@/components/SearchList';
import DataTableOrder from '@/components/DataTableOrder';
import { globalStyles } from '@/styles/global';

export default function ShowProductQuantity() {
	const { t } = useTranslation();

	const [productList, setProductList] = useState([]);
	const [hintProductList, setHintProductList] = useState([]);

	const [name, setName] = useState('');
	const [productId, setProductId] = useState('');
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
				setProductId('');
				//setProductQuantity([]);
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
		if (productId) return;

		firestore()
			.collection('products')
			.where('name', '==', productName)
			.get()
			.then((snapshot) => {
				if (!snapshot.docs.length)
					if (name) showSnackbar(t('show.productQuantity.productNameInvalid'));
					else showSnackbar(t('show.productQuantity.productNameEmpty'));
				//console.log(snapshot.docs[0].id);
				//console.log(snapshot.docs[0].data());
				setProductId(snapshot.docs[0].id);
				getProductCount(snapshot.docs[0].id);
			})
			.catch((e: any) => {
				const err = e as FirebaseError;
				console.log(`Error getting product: ${err.message}`);
			});
	};

	const getProductCount = (productId: string) => {
		//console.log(productId);
		const filteredCount = [];
		for (const count of productQuantity) {
			if (count.id === productId) {
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
			.then((querySnapshot) => {
				const currentCount = [];
				const productCount = {};
				let i = 0;
				// biome-ignore lint/complexity/noForEach: <Method that returns iterator necessary>
				querySnapshot.forEach((doc) => {
					//console.log(doc.data().order);
					const existingProduct = currentCount.find(
						(product) =>
							doc.data().order.product.id === product.id &&
							doc.data().order.weight === product.weight
					);
					/* console.log(existingProduct);
					console.log(
						`${doc.data().order.product.name}: ${
							productCount[doc.data().order.product.id]
						}`
					); */
					if (existingProduct) {
						existingProduct.quantity += doc.data().order.quantity;
						if (productCount[existingProduct.id] && doc.data().order.weight) {
							productCount[existingProduct.id] +=
								doc.data().order.quantity * doc.data().order.weight;
							existingProduct.weightTotal = productCount[existingProduct.id];
						}
					} else {
						if (!productCount[doc.data().order.product.id])
							productCount[doc.data().order.product.id] =
								doc.data().order.weight * doc.data().order.quantity;
						else {
							productCount[doc.data().order.product.id] +=
								doc.data().order.weight * doc.data().order.quantity;
						}
						currentCount.push({
							key: i,
							id: doc.data().order.product.id,
							name: doc.data().order.product.name,
							quantity: doc.data().order.quantity,
							weight: doc.data().order.weight,
							weightTotal: productCount[doc.data().order.product.id],
							status: doc.data().order.status,
						});
						i++;
					}
				});
				for (const count of currentCount) {
					count.weightTotal = productCount[count.id];
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

						setName(item.item.name);
						setProductId(item.item.id);
						getProductCount(item.item.id);
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

			<SearchList
				style={globalStyles.searchList}
				icon='cake-variant'
				value={name}
				placeholder={t('show.productQuantity.productSearch')}
				data={hintProductList}
				autoCapitalize='words'
				onChangeText={(input) => {
					setName(input);
					if (input.trim()) filterProductList(input);
					else setHintProductList([]);
				}}
				onEndEditing={() => {
					setHintProductList([]);
					if (!productId) {
						getProduct(name);
					}
				}}
				renderItem={renderProductHint}
				onClearIconPress={() => {
					setName('');
					setProductId('');
					setHintProductList([]);
					getAllProductsCount();
				}}
			/>

			<ScrollView
				contentContainerStyle={globalStyles.scrollContainer.show}
				keyboardShouldPersistTaps='handled'
			>
				<DataTableOrder
					data={productQuantity}
					dataType='productQuantity'
					defaultSort='name'
					numberofItemsPerPageList={[8, 9, 10]}
					onLongPress={() => {}}
				/>
			</ScrollView>
		</>
	);
}
