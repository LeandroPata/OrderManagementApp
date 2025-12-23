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
	getProductsCount,
	getSingleProductID,
} from '@/utils/Firebase';
import { countProduct } from '@/utils/Utils';

export default function ShowProductQuantity() {
	const { t } = useTranslation();

	const [productList, setProductList] = useState([]);
	const [hintProductList, setHintProductList] = useState([]);

	const [name, setName] = useState('');
	const [productId, setProductId] = useState('');
	const [productCount, setProductCount] = useState([]);

	// All the logic to implement the snackbar
	const { showSnackbar } = useSnackbar();

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
			};
		}, [])
	);

	const getProductList = async () => {
		try {
			const productNames = await getProductNames();
			//console.log(productNames);
			setProductList(productNames);
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

	const getProductCount = (productId: string) => {
		//console.log(productId);
		//console.log(productCount);
		const filteredCount = countProduct(productId, productCount);

		setProductCount(filteredCount);
		//console.log(filteredCount);
	};

	const getAllProductsCount = async () => {
		try {
			const currentCount = await getProductsCount();
			console.log(currentCount);
			setProductCount(currentCount);
		} catch (e: any) {
			console.error(`Error getting products count: ${e.message}`);
		}
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
					setHintProductList([]);
					getAllProductsCount();
				}}
			/>

			<ScrollView
				contentContainerStyle={globalStyles.scrollContainer.show}
				keyboardShouldPersistTaps='handled'
			>
				<DataTableOrder
					data={productCount}
					dataType='productCount'
					defaultSort='name'
					numberofItemsPerPageList={[8, 9, 10]}
					onLongPress={() => {}}
				/>
			</ScrollView>
		</>
	);
}
