import { useFocusEffect } from 'expo-router';
import type { FirebaseError } from 'firebase/app';
import Fuse from 'fuse.js';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Keyboard, ScrollView } from 'react-native';
import { Divider, Text, TouchableRipple } from 'react-native-paper';
import DataTableOrder from '@/components/DataTableOrder';
import SearchList from '@/components/SearchList';
import { useSnackbar } from '@/context/SnackbarContext';
import { globalStyles } from '@/styles/global';
import {
	getClientNames,
	getSingleClientID,
	getSingleClientOrders,
} from '@/utils/Firebase';
import { handleOrderStatus } from '@/utils/Utils';

export default function ShowClientOrder() {
	const { t } = useTranslation();

	const [clientList, setClientList] = useState(Array<object>);
	const [hintClientList, setHintClientList] = useState(Array<object>);

	const [name, setName] = useState('');
	const [clientId, setClientId] = useState('');
	const [clientOrders, setClientOrders] = useState(Array<object>);

	// All the logic to implement the snackbar
	const { showSnackbar } = useSnackbar();

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
		try {
			const clientNames = await getClientNames();
			//console.log(clientNames);
			if (clientNames) setClientList(clientNames);
		} catch (e: any) {
			const err = e as FirebaseError;
			console.error(`Error getting client list: ${err.message}`);
		}
	};

	const filterClientList = async (input: string) => {
		const fuseOptions = {
			includeScore: true,
			keys: ['name'],
			minMatchCharLength: 2,
			threshold: 0.3,
			limit: 5,
		};

		try {
			const fuse = new Fuse(clientList, fuseOptions);

			const results = fuse.search(input);
			setHintClientList(results);
			//console.log(results);
		} catch (e: any) {
			console.error(`Error filtering client list: ${e.message}`);
		}
	};

	const getClient = async (nameClient: string) => {
		if (clientId) return;

		try {
			const IDClient = await getSingleClientID(nameClient);
			if (!IDClient)
				if (name) showSnackbar(t('show.clientOrder.clientNameInvalid'));
				else showSnackbar(t('show.clientOrder.clientNameEmpty'));
			else {
				setClientId(IDClient);
				getClientOrders(IDClient);
			}
			return IDClient ? IDClient : false;
		} catch (e: any) {
			console.error(`Error getting client: ${e.message}`);
		}
	};

	const getClientOrders = async (currentClientId: string) => {
		//console.log(currentClientId);

		try {
			const orders = await getSingleClientOrders(currentClientId);
			if (orders) setClientOrders(orders);
			//console.log(orders);
		} catch (e: any) {
			const err = e as FirebaseError;
			console.log(`Error getting client orders: ${err.message}`);
		}
	};

	const updateOrderStatus = async (item: object) => {
		//console.log(item);
		console.log(`Original: ${item.status}`);

		const orderStatus = await handleOrderStatus(item);
		console.log(`Updated: ${orderStatus}`);

		switch (orderStatus) {
			case 'Ready':
			case 'Delivered':
				showSnackbar(t('show.clientOrder.updatedStatus'));
				break;
			case 'Deleted':
				showSnackbar(t('show.clientOrder.deletedOrder'));
				getClientOrders(clientId);
				break;
			default:
				return;
		}
	};

	const renderClientHint = ({ item }: object) => {
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
					onLongPress={async (item: object) => {
						updateOrderStatus(item);
					}}
				/>
			</ScrollView>
		</>
	);
}
