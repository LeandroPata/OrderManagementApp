import React, { useCallback, useState } from 'react';
import {
	View,
	StyleSheet,
	KeyboardAvoidingView,
	Keyboard,
	ScrollView,
} from 'react-native';
import { Divider, Text, TouchableRipple, useTheme } from 'react-native-paper';
import type { FirebaseError } from 'firebase/app';
import firestore from '@react-native-firebase/firestore';
import { useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import Fuse from 'fuse.js';
import SnackbarInfo from '@/components/SnackbarInfo';
import SearchList from '@/components/SearchList';
import DataTableOrder from '@/components/DataTableOrder';

export default function ShowClientOrder() {
	const theme = useTheme();
	const { t } = useTranslation();

	const [clientList, setClientList] = useState([]);
	const [hintClientList, setHintClientList] = useState([]);

	const [name, setName] = useState('');
	const [client, setClient] = useState({});
	const [clientOrders, setClientOrders] = useState([]);

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

			// Screen unfocused in return
			return () => {
				//console.log('This route is now unfocused.');
				setName('');
				setClient({});
				setClientOrders([]);
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

	const getClient = (clientName: string) => {
		if (client) return;
		const currentClient = {};

		for (const doc of clientList) {
			if (doc.name === clientName.trim()) {
				currentClient.key = doc.key;
				currentClient.name = doc.name;
			}
		}
		setClient(currentClient);
		getClientOrders(currentClient.key);

		return currentClient;
	};

	const getClientOrders = async (clientKey: string) => {
		//console.log(clientKey);
		await firestore()
			.collection('orders')
			.orderBy('client.name', 'asc')
			.get()
			.then((querySnapshot) => {
				const orders = [];
				let i = 0;

				// biome-ignore lint/complexity/noForEach:<Method that returns iterator necessary>
				querySnapshot.forEach((doc) => {
					//console.log(doc.data());
					if (doc.data().client.key === clientKey) {
						for (const order of doc.data().order) {
							//console.log(order);
							orders.push({
								key: i,
								orderId: doc.id,
								orderKey: order.key,
								product: order.product,
								quantity: order.quantity,
								weight: order.weight,
								price: order.price,
								notes: order.notes,
								deliveryDateTime: new Date(
									doc.data().deliveryDateTime.toDate()
								),
								status: order.status,
							});
							i++;
						}
					}
				});
				setClientOrders(orders);
				//console.log(orders);
			})
			.catch((e: any) => {
				const err = e as FirebaseError;
				console.log(`Error getting client orders: ${err.message}`);
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
			.then((snapshot) => {
				updatedOrder.push(...snapshot.data().order);
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
				console.log('Updated status');
				showSnackbar(t('show.clientOrder.updatedStatus'));
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
			.then((snapshot) => {
				for (const order of snapshot.data().order) {
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
					showSnackbar(t('show.clientOrder.DeletedOrder'));
					getClientOrders(client.key);
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
					showSnackbar(t('show.clientOrder.DeletedOrder'));
					getClientOrders(client.key);
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
						setClient(currentClient);
						getClientOrders(currentClient.key);
						setHintClientList([]);
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
				icon='account'
				value={name}
				placeholder={t('show.clientOrder.clientSearch')}
				data={hintClientList}
				autoCapitalize='words'
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
					setHintClientList([]);
					setClientOrders([]);
				}}
			/>

			<ScrollView
				contentContainerStyle={styles.scrollContainer}
				keyboardShouldPersistTaps='handled'
			>
				<DataTableOrder
					data={clientOrders}
					dataType='clientOrder'
					defaultSort='product.name'
					numberofItemsPerPageList={[6, 7, 8]}
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
