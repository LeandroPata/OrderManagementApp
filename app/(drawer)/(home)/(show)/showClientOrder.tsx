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
import { globalStyles } from '@/styles/global';

export default function ShowClientOrder() {
	const theme = useTheme();
	const { t } = useTranslation();

	const [clientList, setClientList] = useState([]);
	const [hintClientList, setHintClientList] = useState([]);

	const [name, setName] = useState('');
	const [clientId, setClientId] = useState('');
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
				setClientId('');
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
		if (clientId) return;

		firestore()
			.collection('clients')
			.where('name', '==', clientName)
			.get()
			.then((snapshot) => {
				if (!snapshot.docs.length)
					if (name) showSnackbar(t('show.clientOrder.clientNameInvalid'));
					else showSnackbar(t('show.clientOrder.clientNameEmpty'));
				//console.log(snapshot.docs[0].id);
				//console.log(snapshot.docs[0].data());
				setClientId(snapshot.docs[0].id);
				getClientOrders(snapshot.docs[0].id);
			})
			.catch((e: any) => {
				const err = e as FirebaseError;
				console.log(`Error getting client: ${err.message}`);
			});
	};

	const getClientOrders = async (currentClientId: string) => {
		//console.log(currentClientId);
		await firestore()
			.collection('orders')
			.orderBy('order.product.name', 'asc')
			.where('client.id', '==', currentClientId)
			.get()
			.then((querySnapshot) => {
				const orders = [];

				// biome-ignore lint/complexity/noForEach:<Method that returns iterator necessary>
				querySnapshot.forEach((doc) => {
					//console.log(doc.data().order);
					orders.push({
						id: doc.id,
						product: doc.data().order.product,
						quantity: doc.data().order.quantity,
						weight: doc.data().order.weight,
						price: doc.data().order.price,
						notes: doc.data().order.notes,
						deliveryDateTime: new Date(doc.data().deliveryDateTime.toDate()),
						status: doc.data().order.status,
					});
				});
				setClientOrders(orders);
				//console.log(orders);
			})
			.catch((e: any) => {
				const err = e as FirebaseError;
				console.log(`Error getting client orders: ${err.message}`);
			});
	};

	// Because of the database changes, directly changing the
	// status variable of the order is now possible
	const updateOrderDatabase = async (item: object) => {
		firestore()
			.collection('orders')
			.doc(item.id)
			.update({ 'order.status': item.status })
			.then(() => {
				//console.log('Updated status');
				showSnackbar(t('show.clientOrder.updatedStatus'));
			})
			.catch((e: any) => {
				const err = e as FirebaseError;
				console.log(`Error updating order: ${err.message}`);
			});
	};

	const deleteOrder = async (item: object) => {
		firestore()
			.collection('orders')
			.doc(item.id)
			.delete()
			.then(() => {
				//console.log('Order deleted');
				showSnackbar(t('show.clientOrder.DeletedOrder'));
				getClientOrders(clientId);
			})
			.catch((e: any) => {
				const err = e as FirebaseError;
				console.log(`Error deleting order: ${err.message}`);
			});
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

						setName(item.item.name);
						setClientId(item.item.id);
						getClientOrders(item.item.id);
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
				style={globalStyles.searchList}
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
					if (!clientId) {
						getClient(name);
					}
				}}
				renderItem={renderClientHint}
				onClearIconPress={() => {
					setName('');
					setClientId('');
					setHintClientList([]);
					setClientOrders([]);
				}}
			/>

			<ScrollView
				contentContainerStyle={globalStyles.scrollContainer.show}
				keyboardShouldPersistTaps='handled'
			>
				<DataTableOrder
					data={clientOrders}
					dataType='clientOrder'
					defaultSort='product.name'
					numberofItemsPerPageList={[8, 9, 10]}
					onLongPress={(item: object) => {
						updateOrderStatus(item);
					}}
				/>
			</ScrollView>
		</>
	);
}

/* const styles = StyleSheet.create({
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
}); */
