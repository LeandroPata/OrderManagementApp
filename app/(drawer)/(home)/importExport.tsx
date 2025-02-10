import React, { useState } from 'react';
import {
	View,
	StyleSheet,
	PermissionsAndroid,
	Platform,
	ScrollView,
} from 'react-native';
import { Button } from 'react-native-paper';
import type { FirebaseError } from 'firebase/app';
import firestore, { Timestamp } from '@react-native-firebase/firestore';
import storage, {
	type FirebaseStorageTypes,
} from '@react-native-firebase/storage';
import * as DocumentPicker from 'expo-document-picker';
import { useTranslation } from 'react-i18next';
import RNFetchBlob from 'rn-fetch-blob';
import SnackbarInfo from '@/components/SnackbarInfo';

export default function importExport() {
	const { t } = useTranslation();

	const [importClientLoading, setImportClientLoading] = useState(false);
	const [importProductLoading, setImportProductLoading] = useState(false);
	const [importOrderLoading, setImportOrderLoading] = useState(false);
	const [exportClientLoading, setExportClientLoading] = useState(false);
	const [exportProductLoading, setExportProductLoading] = useState(false);
	const [exportOrderLoading, setExportOrderLoading] = useState(false);

	// All the logic to implement the snackbar
	const [snackbarVisible, setSnackbarVisible] = useState(false);
	const [snackbarText, setSnackbarText] = useState('');

	const showSnackbar = (text: string) => {
		setSnackbarText(text);
		setSnackbarVisible(true);
	};
	const onDismissSnackbar = () => setSnackbarVisible(false);

	// converts date format from pt-PT locale (23/01/2024) to ISO date format (2024-01-23T00:00:00.000Z)
	// and then converts to Firestore Timestamp format
	const convertToTimestamp = (date: Date) => {
		const [day, month, year] = date.split('/').map(Number);
		const convertedDate = new Date(year, month - 1, day);
		/* console.log(
      date + ' : ' + Timestamp.fromDate(new Date(convertedDate.toISOString()))
    ); */
		return Timestamp.fromDate(new Date(convertedDate.toISOString()));
	};

	// formats data from database to be ordered in a specific way
	const formatDataOrder = (data, dataType: string, operationType: string) => {
		try {
			//console.log(data);
			const orderedKeys = [];

			switch (dataType) {
				case 'client':
					orderedKeys.push('name', 'contact');
					break;
				case 'product':
					orderedKeys.push('name', 'price', 'priceByWeight');
					break;
				case 'order':
					/* orderedKeys.push(
					'client.id',
					'client.name',
					'deliveryDateTime',
					'order.key',
					'product.id',
					'product.name',
					'quantity',
					'price',
					'weight',
					'notes',
					'status'
				); */
					break;
				default:
					console.log('Wrong DataType');
					return;
			}
			if (dataType === 'order') {
				switch (operationType) {
					case 'import': {
						//console.log(data);
						return data.map((doc) => {
							//console.log(doc);

							const orderedDoc = {};
							const client = {};
							const product = {};
							const order = {};
							client['id'] = doc['client.id'];
							client['name'] = doc['client.name'];
							product['id'] = doc['product.id'];
							product['name'] = doc['product.name'];
							order['id'] = doc['order.id'];
							order['notes'] = doc['notes'];
							order['price'] = Number(doc['price']);
							order['quantity'] = Number(doc['quantity']);
							order['status'] = doc['status'];
							order['weight'] = Number(doc['weight']);
							order['product'] = product;
							orderedDoc['client'] = client;
							orderedDoc['deliveryDateTime'] = doc['deliveryDateTime'];
							orderedDoc['order'] = order;

							//console.log(orderedDoc);
							return orderedDoc;
						});
					}
					case 'export': {
						return data.map((doc) => {
							console.log(doc);
							const orderedDoc = {};
							orderedDoc['client.id'] = doc.client.id || '';
							orderedDoc['client.name'] = doc.client.name || '';
							orderedDoc['order.id'] = doc.order.id || '';
							orderedDoc['product.id'] = doc.order.product.id || '';
							orderedDoc['product.name'] = doc.order.product.name || '';
							orderedDoc['quantity'] = doc.order.quantity || '';
							orderedDoc['price'] = doc.order.price || '';
							orderedDoc['weight'] = doc.order.weight || '';
							orderedDoc['notes'] = doc.order.notes || '';
							orderedDoc['deliveryDateTime'] = doc.deliveryDateTime || '';
							orderedDoc['status'] = doc.order.status || '';

							console.log(orderedDoc);
							return orderedDoc;
						});
					}
					default:
						console.log('Wrong OperationType');
				}
			} else {
				return data.map((doc) => {
					//console.log(doc);

					const orderedDoc = {};
					for (const key of orderedKeys) {
						orderedDoc[key] = doc[key] || '';
					}

					for (const key of Object.keys(doc)) {
						if (!orderedKeys.includes(key)) {
							orderedDoc[key] = doc[key];
						}
					}
					//console.log(orderedDoc);
					return orderedDoc;
				});
			}
		} catch (e: any) {
			//showSnackbar('Error formatting: ' + err.message);
			console.log(`Error formatting: ${e.message}`);
			setImportClientLoading(false);
			setImportProductLoading(false);
			setImportOrderLoading(false);
			setExportClientLoading(false);
			setExportProductLoading(false);
			setExportOrderLoading(false);
			return;
		}
	};

	// formats data in order to be properly imported to the firestore database
	// (date types, strings to number type)
	const formatDataToImport = (data) => {
		for (const doc of data) {
			for (const key of Object.keys(doc)) {
				const regex = /^([0-2][0-9]|3[0-1])\/(0[1-9]|1[0-2])\/\d{4}$/;
				if (regex.test(doc[key])) {
					//console.log(key);
					//console.log(doc[key]);
					doc[key] = convertToTimestamp(doc[key]);
					//console.log(doc[key]);
				}
			}
		}
	};

	// formats data in order to be more user friendly when exported
	// (readable date types)
	const formatDataToExport = (data) => {
		for (const doc of data) {
			for (const key of Object.keys(doc)) {
				if (doc[key] instanceof Timestamp) {
					//console.log(key);
					//console.log(doc[key]);
					doc[key] = new Date(doc[key].toDate()).toLocaleDateString('pt-pt');
					//console.log(doc[key]);
				}
			}
		}
	};

	// splits a row from a csv file into their separate values
	const splitCSVRow = (row) => {
		// regex identifies if expression is enclosed by double quotes (".*?") which = value, or
		// if expression is unquoted and delimited by commas but has spaces ([^",]+(?=\s*,|$)) which = value, or
		// if expression is unquoted, has no spaces and is delimited by commas ([^",\s]+) which = value
		const regex = /(".*?"|[^",]+(?=\s*,|$)|[^",\s]+)/g;
		const values = row.match(regex);

		return values.map((value) => {
			// remove enclosing quotes and unescape inner quotes if the value is quoted
			if (value.startsWith('"') && value.endsWith('"')) {
				return value.slice(1, -1).replace(/""/g, '"');
			}
			return value.trim();
		});
	};

	// converts imported csv file to json in order to be properly imported to
	// the firestore database
	const convertCSVtoJSON = (fileContent) => {
		try {
			const rows = fileContent.split('\n').filter((row) => row.trim() !== '');
			const headers = splitCSVRow(rows[0]);

			const data = rows.slice(1).map((row) => {
				const values = splitCSVRow(row);
				const doc = {};
				headers.forEach((header, index) => {
					doc[header] = values[index] || '';
				});
				return doc;
			});

			return data;
		} catch (e: any) {
			//showSnackbar('Error converting to JSON: ' + e.message);
			console.log(`Error converting to JSON: ${e.message}`);
			setImportClientLoading(false);
			setImportProductLoading(false);
			setImportOrderLoading(false);
			return;
		}
	};

	// converts received data from the firestore database in the json format
	// to a csv format for more readability and ease of editing if necessary
	const convertJSONToCSV = (data) => {
		//console.log(data);
		try {
			const headers = Object.keys(data[0])
				.map((key) => `"${key}"`)
				.join(',');
			const rows = data
				.map((row) =>
					Object.values(row)
						.map((value) => `"${value}"`)
						.join(',')
				)
				.join('\n');
			return `${headers}\n${rows}`;
		} catch (e: any) {
			//showSnackbar('Error converting to CSV: ' + e.message);
			console.log(`Error converting to CSV: ${e.message}`);
			setExportClientLoading(false);
			setExportProductLoading(false);
			setExportOrderLoading(false);
			return;
		}
	};

	const uploadFile = async (
		storageReference: FirebaseStorageTypes.Reference,
		filePath: string
	) => {
		const task = storageReference.putFile(filePath);

		task.on('state_changed', (taskSnapshot) => {
			console.log(
				`${taskSnapshot.bytesTransferred} transferred out of ${taskSnapshot.totalBytes}`
			);
		});

		await task
			.then(() => {
				console.log('Data uploaded to the bucket!');
				//showSnackbar('Data uploaded to the bucket!');
			})
			.catch((e: any) => {
				const err = e as FirebaseError;
				//showSnackbar('File upload failed: ' + err.message);
				console.log(`File upload failed: ${err.message}`);
				setExportClientLoading(false);
				setExportProductLoading(false);
				setExportOrderLoading(false);
			});
	};

	const pickFile = async () => {
		//console.log(Platform.OS);
		try {
			const doc = await DocumentPicker.getDocumentAsync({
				type:
					Platform.OS === 'android'
						? 'text/comma-separated-values'
						: 'text/csv',
				copyToCacheDirectory: false,
			});

			return doc;
		} catch (e: any) {
			//showSnackbar('File not chosen: ' + e.message);
			console.log(`File not chosen: ${e.message}`);
			setImportClientLoading(false);
			setImportProductLoading(false);
			setImportOrderLoading(false);
		}
	};

	const readFile = async (fileUri) => {
		try {
			const fileContent = await RNFetchBlob.fs.readFile(fileUri, 'utf8');
			return fileContent;
		} catch (e: any) {
			//showSnackbar("Couldn't read file: " + e.message);
			console.log(`Couldn't read file: ${e.message}`);
			setImportClientLoading(false);
			setImportProductLoading(false);
			setImportOrderLoading(false);
			return null;
		}
	};

	const checkData = async (data, dataType: string) => {
		let check = 0;
		switch (dataType) {
			case 'client':
				await firestore()
					.collection('clients')
					.where('name', '==', data.name)
					.get()
					.then((querySnapshot) => {
						if (!querySnapshot.empty) {
							check = 1;
						}
					});
				return check;
			case 'product':
				await firestore()
					.collection('products')
					.where('name', '==', data.name)
					.get()
					.then((querySnapshot) => {
						if (!querySnapshot.empty) {
							check = 1;
						}
					});
				return check;
			case 'order':
				await firestore()
					.collection('orders')
					.where('order.id', '==', data.order.id)
					.get()
					.then((querySnapshot) => {
						if (!querySnapshot.empty) {
							check = 1;
						}
					});
				return check;
			default:
				console.log('Wrong Datatype');
		}
	};

	const checkPermissions = async () => {
		const checkRead = await PermissionsAndroid.check(
			PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
		);

		const checkWrite = await PermissionsAndroid.check(
			PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
		);

		console.log(checkRead);
		console.log(checkWrite);

		if (!checkRead || !checkWrite) {
			const granted = await requestPermissions();
			return granted;
		}
		return true;
	};

	const requestPermissions = async () => {
		let grantedRead = '';
		let grantedWrite = '';

		try {
			grantedRead = await PermissionsAndroid.request(
				PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
			);
			grantedWrite = await PermissionsAndroid.request(
				PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
			);

			console.log(grantedRead);
			console.log(grantedWrite);

			if (
				!(grantedRead === PermissionsAndroid.RESULTS.GRANTED) ||
				!(grantedWrite === PermissionsAndroid.RESULTS.GRANTED)
			) {
				showSnackbar(t('importExport.storagePermission'));
				return false;
			}
			return true;
		} catch (e: any) {
			//showSnackbar('Error with permissions: ' + e.message);
			console.log(`Error with permissions: ${e.message}`);
			setImportClientLoading(false);
			setImportProductLoading(false);
			setImportOrderLoading(false);
		}
	};

	const importClients = async () => {
		setImportClientLoading(true);

		if (Number(Platform.Version) < 33) {
			const permissionsCheck = await checkPermissions();

			if (!permissionsCheck) {
				setImportClientLoading(false);
				return;
			}
		}

		const file = await pickFile();
		if (!file || file.canceled) {
			setImportClientLoading(false);
			return;
		}

		const fileContent = await readFile(file.assets[0].uri);
		//console.log(fileContent);

		const data = await convertCSVtoJSON(fileContent);
		//console.log(data);

		const clientsData = await formatDataOrder(data, 'client', 'import');
		//console.log(clientsData);

		// to ensure proper import
		formatDataToImport(clientsData);

		const batch = firestore().batch();

		const existingClients = [];

		try {
			for (const client of clientsData) {
				const check = await checkData(client, 'client');
				if (!check) {
					const clientRef = firestore().collection('clients').doc();

					batch.set(clientRef, client);
				} else {
					existingClients.push(client.name);
				}
			}
		} catch (e: any) {
			const err = e as FirebaseError;
			//showSnackbar('Error importing: ' + err.message);
			console.log(`Error importing: ${err.message}`);
			setImportClientLoading(false);
			return;
		} finally {
			await batch.commit();
			console.log(existingClients);

			let importMsg = t('importExport.importClientsSuccess');
			if (existingClients.length) {
				importMsg += `\n${t(
					'importExport.importExistingClients'
				)}: ${existingClients.toString()}`;
			}
			showSnackbar(importMsg);
			console.log(importMsg);
			setImportClientLoading(false);
		}
	};

	const importProducts = async () => {
		setImportProductLoading(true);

		if (Number(Platform.Version) < 33) {
			const permissionsCheck = await checkPermissions();

			if (!permissionsCheck) {
				setImportProductLoading(false);
				return;
			}
		}

		const file = await pickFile();
		if (!file || file.canceled) {
			setImportProductLoading(false);
			return;
		}

		const fileContent = await readFile(file.assets[0].uri);
		//console.log(fileContent);

		const data = await convertCSVtoJSON(fileContent);
		//console.log(data);

		const productsData = await formatDataOrder(data, 'product', 'import');
		//console.log(productsData);

		// to ensure proper import
		formatDataToImport(productsData);

		const batch = firestore().batch();

		const existingProducts = [];

		try {
			for (const product of productsData) {
				const check = await checkData(product, 'product');
				if (!check) {
					const productRef = firestore().collection('products').doc();

					batch.set(productRef, product);
				} else {
					existingProducts.push(product.name);
				}
			}
		} catch (e: any) {
			const err = e as FirebaseError;
			//showSnackbar('Error importing: ' + err.message);
			console.log(`Error importing: ${err.message}`);
			setImportProductLoading(false);
			return;
		} finally {
			await batch.commit();
			console.log(existingProducts);

			let importMsg = t('importExport.importProductsSuccess');
			if (existingProducts.length) {
				importMsg += `\n${t(
					'importExport.importExistingProducts'
				)}: ${existingProducts.toString()}`;
			}
			showSnackbar(importMsg);
			console.log(importMsg);
			setImportProductLoading(false);
		}
	};

	const importOrders = async () => {
		setImportOrderLoading(true);

		if (Number(Platform.Version) < 33) {
			const permissionsCheck = await checkPermissions();

			if (!permissionsCheck) {
				setImportOrderLoading(false);
				return;
			}
		}

		const file = await pickFile();
		if (!file || file.canceled) {
			setImportOrderLoading(false);
			return;
		}

		const fileContent = await readFile(file.assets[0].uri);
		//console.log(fileContent);

		const data = await convertCSVtoJSON(fileContent);
		//console.log(data);

		const ordersData = await formatDataOrder(data, 'order', 'import');
		console.log(ordersData);

		// to ensure proper import
		formatDataToImport(ordersData);

		const batch = firestore().batch();
		let existingOrders = 0;

		try {
			for (const order of ordersData) {
				console.log(order);
				const check = await checkData(order, 'order');
				if (!check) {
					const orderRef = firestore().collection('orders').doc(order.order.id);

					batch.set(orderRef, order);
				} else {
					existingOrders += 1;
				}
			}
		} catch (e: any) {
			const err = e as FirebaseError;
			//showSnackbar('Error importing: ' + err.message);
			console.log(`Error importing: ${err.message}`);
			setImportOrderLoading(false);
			return;
		} finally {
			await batch.commit();
		}

		let importMsg = t('importExport.importOrdersSuccess');
		if (existingOrders) {
			importMsg += `\n${t('importExport.importExistingOrders')}`;
		}
		showSnackbar(importMsg);
		console.log(importMsg);
		setImportOrderLoading(false);
	};

	const exportClients = async () => {
		setExportClientLoading(true);

		if (Number(Platform.Version) < 33) {
			const permissionsCheck = await checkPermissions();

			if (!permissionsCheck) {
				setExportClientLoading(false);
				return;
			}
		}

		try {
			const snapshot = await firestore()
				.collection('clients')
				.orderBy('name', 'asc')
				.get();

			const rawData = snapshot.docs.map((doc) => doc.data());
			//console.log(rawData);

			const clientsData = formatDataOrder(rawData, 'client', 'export');

			// to ensure proper export
			formatDataToExport(clientsData);

			const file = convertJSONToCSV(clientsData);
			//console.log(file);

			const filePath = `${RNFetchBlob.fs.dirs.CacheDir}/clientsData.csv`;
			//console.log(filePath);

			const reference = storage().ref('data/clientsData.csv');

			await RNFetchBlob.fs.writeFile(filePath, file);

			await uploadFile(reference, filePath);

			let docPath = `${RNFetchBlob.fs.dirs.DownloadDir}/clientsData.csv`;
			//console.log(docPath);

			let i = 1;

			while (await RNFetchBlob.fs.exists(docPath)) {
				docPath = `${
					RNFetchBlob.fs.dirs.DownloadDir
				}/clientsData${i.toString()}.csv`;
				console.log(docPath);
				i++;
			}

			const task = reference.writeToFile(docPath);

			task.on('state_changed', (taskSnapshot) => {
				console.log(
					`${taskSnapshot.bytesTransferred} transferred out of ${taskSnapshot.totalBytes}`
				);
			});

			await task
				.then(() => {
					showSnackbar(t('importExport.exportClientsSuccess'));
					console.log('Exporting clients successfull');
				})
				.catch((e: any) => {
					const err = e as FirebaseError;
					//showSnackbar('Data download failed: ' + err.message);
					console.log(`Data download failed: ${err.message}`);
					setExportClientLoading(false);
				});
		} catch (e: any) {
			const err = e as FirebaseError;
			console.log(`Exporting clients failed: ${err.message}`);
			//showSnackbar('Exporting clients failed: ' + err.message);
			setExportClientLoading(false);
			return;
		} finally {
			setExportClientLoading(false);
		}
	};

	const exportProducts = async () => {
		setExportProductLoading(true);

		if (Number(Platform.Version) < 33) {
			const permissionsCheck = await checkPermissions();

			if (!permissionsCheck) {
				setExportProductLoading(false);
				return;
			}
		}

		try {
			const snapshot = await firestore()
				.collection('products')
				.orderBy('name', 'asc')
				.get();

			const rawData = snapshot.docs.map((doc) => doc.data());
			//console.log(rawData);

			const productsData = formatDataOrder(rawData, 'product', 'export');

			// to ensure proper export
			formatDataToExport(productsData);

			const file = convertJSONToCSV(productsData);
			//console.log(file);

			const filePath = `${RNFetchBlob.fs.dirs.CacheDir}/productsData.csv`;
			//console.log(filePath);

			const reference = storage().ref('data/productsData.csv');

			await RNFetchBlob.fs.writeFile(filePath, file);

			await uploadFile(reference, filePath);

			let docPath = `${RNFetchBlob.fs.dirs.DownloadDir}/productsData.csv`;
			//console.log(docPath);

			let i = 1;

			while (await RNFetchBlob.fs.exists(docPath)) {
				docPath = `${
					RNFetchBlob.fs.dirs.DownloadDir
				}/productsData${i.toString()}.csv`;
				console.log(docPath);
				i++;
			}

			const task = reference.writeToFile(docPath);

			task.on('state_changed', (taskSnapshot) => {
				console.log(
					`${taskSnapshot.bytesTransferred} transferred out of ${taskSnapshot.totalBytes}`
				);
			});

			await task
				.then(() => {
					showSnackbar(t('importExport.exportProductsSuccess'));
					console.log('Exporting products successfull');
				})
				.catch((e: any) => {
					const err = e as FirebaseError;
					//showSnackbar('Data download failed: ' + err.message);
					console.log(`Data download failed: ${err.message}`);
					setExportProductLoading(false);
				});
		} catch (e: any) {
			const err = e as FirebaseError;
			console.log(`Exporting products failed: ${err.message}`);
			//showSnackbar('Exporting products failed: ' + err.message);
			setExportProductLoading(false);
			return;
		} finally {
			setExportProductLoading(false);
		}
	};

	const exportOrders = async () => {
		setExportOrderLoading(true);

		if (Number(Platform.Version) < 33) {
			const permissionsCheck = await checkPermissions();

			if (!permissionsCheck) {
				setExportOrderLoading(false);
				return;
			}
		}

		try {
			const snapshot = await firestore()
				.collection('orders')
				.orderBy('client.name', 'asc')
				.get();

			const rawData = snapshot.docs.map((doc) => doc.data());
			//console.log(rawData);

			const ordersData = formatDataOrder(rawData, 'order', 'export');
			//console.log(ordersData);

			// to ensure proper export
			formatDataToExport(ordersData);

			const file = convertJSONToCSV(ordersData);
			//console.log(file);

			const filePath = `${RNFetchBlob.fs.dirs.CacheDir}/ordersData.csv`;
			//console.log(filePath);

			const reference = storage().ref('data/ordersData.csv');

			await RNFetchBlob.fs.writeFile(filePath, file);

			await uploadFile(reference, filePath);

			let docPath = `${RNFetchBlob.fs.dirs.DownloadDir}/ordersData.csv`;
			//console.log(docPath);

			let i = 1;

			while (await RNFetchBlob.fs.exists(docPath)) {
				docPath = `${
					RNFetchBlob.fs.dirs.DownloadDir
				}/ordersData${i.toString()}.csv`;
				console.log(docPath);
				i++;
			}

			const task = reference.writeToFile(docPath);

			task.on('state_changed', (taskSnapshot) => {
				console.log(
					`${taskSnapshot.bytesTransferred} transferred out of ${taskSnapshot.totalBytes}`
				);
			});

			await task
				.then(() => {
					showSnackbar(t('importExport.exportOrdersSuccess'));
					console.log('Exporting orders successfull');
				})
				.catch((e: any) => {
					const err = e as FirebaseError;
					//showSnackbar('Data download failed: ' + err.message);
					console.log(`Data download failed: ${err.message}`);
					setExportOrderLoading(false);
				});
		} catch (e: any) {
			const err = e as FirebaseError;
			console.log(`Exporting orders failed: ${err.message}`);
			//showSnackbar('Exporting orders failed: ' + err.message);
			setExportOrderLoading(false);
			return;
		} finally {
			setExportOrderLoading(false);
		}
	};

	return (
		<>
			<SnackbarInfo
				text={snackbarText}
				visible={snackbarVisible}
				onDismiss={onDismissSnackbar}
			/>

			<ScrollView
				contentContainerStyle={styles.scrollContainer}
				keyboardShouldPersistTaps='handled'
			>
				<View style={styles.buttonContainer}>
					<Button
						style={styles.button}
						contentStyle={styles.buttonContent}
						labelStyle={styles.buttonText}
						icon='database-import'
						mode='elevated'
						loading={importClientLoading}
						onPress={importClients}
					>
						{t('importExport.importClients')}
					</Button>
					<Button
						style={styles.button}
						contentStyle={styles.buttonContent}
						labelStyle={styles.buttonText}
						icon='database-import'
						mode='elevated'
						loading={importProductLoading}
						onPress={importProducts}
					>
						{t('importExport.importProducts')}
					</Button>
					<Button
						style={styles.button}
						contentStyle={styles.buttonContent}
						labelStyle={styles.buttonText}
						icon='database-import'
						mode='elevated'
						loading={importOrderLoading}
						onPress={importOrders}
					>
						{t('importExport.importOrders')}
					</Button>
					<Button
						style={styles.button}
						contentStyle={styles.buttonContent}
						labelStyle={styles.buttonText}
						icon='database-export'
						mode='elevated'
						loading={exportClientLoading}
						onPress={exportClients}
					>
						{t('importExport.exportClients')}
					</Button>
					<Button
						style={styles.button}
						contentStyle={styles.buttonContent}
						labelStyle={styles.buttonText}
						icon='database-export'
						mode='elevated'
						loading={exportProductLoading}
						onPress={exportProducts}
					>
						{t('importExport.exportProducts')}
					</Button>
					<Button
						style={styles.button}
						contentStyle={styles.buttonContent}
						labelStyle={styles.buttonText}
						icon='database-export'
						mode='elevated'
						loading={exportOrderLoading}
						onPress={exportOrders}
					>
						{t('importExport.exportOrders')}
					</Button>
				</View>
			</ScrollView>
		</>
	);
}

const styles = StyleSheet.create({
	scrollContainer: {
		flexGrow: 1,
		justifyContent: 'center',
	},
	buttonContainer: {
		marginHorizontal: 20,
		alignItems: 'center',
	},
	button: {
		marginVertical: 8,
		justifyContent: 'center',
	},
	buttonContent: {
		minWidth: 280,
		minHeight: 80,
	},
	buttonText: {
		fontSize: 25,
		fontWeight: 'bold',
		overflow: 'visible',
		paddingTop: 10,
	},
});
