import React, { useCallback, useState } from 'react';
import { StyleSheet, Keyboard, ScrollView } from 'react-native';
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
	const [productId, setProductId] = useState('');
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
				setProductId('');
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
					if (name) showSnackbar(t('show.productOrder.productNameInvalid'));
					else showSnackbar(t('show.productOrder.productNameEmpty'));
				//console.log(snapshot.docs[0].id);
				//console.log(snapshot.docs[0].data());
				setProductId(snapshot.docs[0].id);
				getProductOrders(snapshot.docs[0].id);
			})
			.catch((e: any) => {
				const err = e as FirebaseError;
				console.log(`Error getting product: ${err.message}`);
			});
	};

	const getProductOrders = async (currentProductId: string) => {
		//console.log(currentProductId);
		await firestore()
			.collection('orders')
			.orderBy('client.name', 'asc')
			.get()
			.then((querySnapshot) => {
				const orders = [];
				let i = 0;
				// biome-ignore lint/complexity/noForEach:<Method that returns iterator necessary>
				querySnapshot.forEach((doc) => {
					for (const order of doc.data().order) {
						//console.log(`${order.product.id} : ${currentProductId}`);

						if (order.product.id === currentProductId) {
							//console.log(order);
							orders.push({
								key: i,
								orderId: doc.id,
								orderKey: order.key,
								client: doc.data().client,
								quantity: order.quantity,
								weight: order.weight,
								price: order.price,
								status: order.status,
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
			})
			.catch((e: any) => {
				const err = e as FirebaseError;
				console.log(`Error getting product orders: ${err.message}`);
			});
	};

	// I don't like having to copy the whole order to change one variable,
	// but can't figure out how to do it dynamically (the index is varible = orderKey)
	// on a map nested in an array
	const updateOrderDatabase = async (item: object) => {
		const updatedOrder = [];
		await firestore()
			.collection('orders')
			.doc(item.orderId)
			.get()
			.then((querySnapshot) => {
				updatedOrder.push(...querySnapshot.data().order);
			})
			.catch((e: any) => {
				const err = e as FirebaseError;
				console.log(`Error getting order: ${err.message}`);
			});

		updatedOrder[item.orderKey].status = item.status;

		firestore()
			.collection('orders')
			.doc(item.orderId)
			.update({ order: updatedOrder })
			.then(() => {
				console.log('Updated');
				showSnackbar(t('show.productOrder.updatedStatus'));
			})
			.catch((e: any) => {
				const err = e as FirebaseError;
				console.log(`Error updating order: ${err.message}`);
			});
	};

	const deleteOrder = async (item: object) => {
		const updatedOrder = [];
		await firestore()
			.collection('orders')
			.doc(item.orderId)
			.get()
			.then((querySnapshot) => {
				for (const order of querySnapshot.data().order) {
					if (order.key !== item.orderKey) {
						updatedOrder.push(order);
					}
				}
			})
			.catch((e: any) => {
				const err = e as FirebaseError;
				console.log(`Error getting order: ${err.message}`);
			});

		if (updatedOrder.length <= 0) {
			firestore()
				.collection('orders')
				.doc(item.orderId)
				.delete()
				.then(() => {
					console.log('Order entry deleted because order is empty');
					showSnackbar(t('show.productOrder.deletedOrder'));
					getProductOrders(productId);
				})
				.catch((e: any) => {
					const err = e as FirebaseError;
					console.log(`Error deleting order: ${err.message}`);
				});
		} else {
			firestore()
				.collection('orders')
				.doc(item.orderId)
				.update({ order: updatedOrder })
				.then(() => {
					console.log('Updated');
					showSnackbar(t('show.productOrder.deletedOrder'));
					getProductOrders(productId);
				})
				.catch((e: any) => {
					const err = e as FirebaseError;
					console.log(`Error updating order: ${err.message}`);
				});
		}
	};

	const updateOrderStatus = (item: object) => {
		//console.log(item);
		// Mark as Ready if Incomplete
		if (item.status === 'Incomplete') {
			item.status = 'Ready';
		}
		// Mark as Delivered if Ready
		else if (item.status === 'Ready') {
			item.status = 'Delivered';
		}
		// Delete if Delivered
		else if (item.status === 'Delivered') {
			deleteOrder(item);
			return;
		}
		// Update in Firestore
		updateOrderDatabase(item);
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
						getProductOrders(item.item.id);
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
				style={styles.searchList}
				icon='cake-variant'
				value={name}
				placeholder={t('show.productOrder.productSearch')}
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
					setProductOrders([]);
					setHintProductList([]);
				}}
			/>

			<ScrollView
				contentContainerStyle={styles.scrollContainer}
				keyboardShouldPersistTaps='handled'
			>
				<DataTableOrder
					data={productOrders}
					dataType='productOrder'
					defaultSort='client.name'
					numberofItemsPerPageList={[8, 9, 10]}
					onLongPress={(item: object) => {
						updateOrderStatus(item);
					}}
				/>
			</ScrollView>
		</>
	);
}

const styles = StyleSheet.create({
	scrollContainer: {
		flexGrow: 1,
	},
	searchList: {
		paddingHorizontal: 10,
		marginBottom: 10,
	},
	input: {
		marginVertical: 2,
	},
	errorHelper: {
		fontWeight: 'bold',
		fontSize: 15,
	},
});
