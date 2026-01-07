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
	getProductNames,
	getSingleProductID,
	getSingleProductOrders,
} from '@/utils/Firebase';
import { handleOrderStatus } from '@/utils/Utils';

export default function ShowProductOrder() {
	const { t } = useTranslation();

	const [productList, setProductList] = useState(Array<object>);
	const [hintProductList, setHintProductList] = useState(Array<object>);

	const [name, setName] = useState('');
	const [productId, setProductId] = useState('');
	const [productOrders, setProductOrders] = useState(Array<object>);

	// All the logic to implement the snackbar
	const { showSnackbar } = useSnackbar();

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
		try {
			const productNames = await getProductNames();
			//console.log(productNames);
			if (productNames) setProductList(productNames);
		} catch (e: any) {
			const err = e as FirebaseError;
			console.error(`Error getting product list: ${err.message}`);
		}
	};

	const filterProductList = async (input: string) => {
		const fuseOptions = {
			includeScore: true,
			keys: ['name'],
			minMatchCharLength: 2,
			threshold: 0.3,
			limit: 5,
		};

		try {
			const fuse = new Fuse(productList, fuseOptions);

			const results = fuse.search(input);
			setHintProductList(results);
			//console.log(results);
		} catch (e: any) {
			console.error(`Error filtering product list: ${e.message}`);
		}
	};

	const getProduct = async (nameProduct: string) => {
		if (productId) return;

		try {
			const IDProduct = await getSingleProductID(nameProduct);
			if (!IDProduct)
				if (name) showSnackbar(t('show.productOrder.productNameInvalid'));
				else showSnackbar(t('show.productOrder.productNameEmpty'));
			else {
				setProductId(IDProduct);
				getProductOrders(IDProduct);
			}
			return IDProduct ? IDProduct : false;
		} catch (e: any) {
			console.error(`Error getting product: ${e.message}`);
		}
	};

	const getProductOrders = async (currentProductId: string) => {
		//console.log(currentProductId);

		try {
			const orders = await getSingleProductOrders(currentProductId);
			if (orders) setProductOrders(orders);
			//console.log(orders);
		} catch (e: any) {
			const err = e as FirebaseError;
			console.log(`Error getting product orders: ${err.message}`);
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
				getProductOrders(productId);
				break;
			default:
				return;
		}
	};

	const renderProductHint = ({ item }: object) => {
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
			<SearchList
				style={globalStyles.searchList}
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
				onSubmitEditing={() => {
					if (!productId) {
						getProduct(name);
					}
				}}
				onFocus={() => filterProductList(name)}
				onBlur={() => setHintProductList([])}
				renderItem={renderProductHint}
				onClearIconPress={() => {
					setName('');
					setProductId('');
					setProductOrders([]);
					setHintProductList([]);
				}}
			/>

			<ScrollView
				contentContainerStyle={globalStyles.scrollContainer.show}
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
