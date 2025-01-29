import React, { useState } from 'react';
import { View, StyleSheet, PermissionsAndroid, Platform } from 'react-native';
import { Button } from 'react-native-paper';
import type { FirebaseError } from 'firebase/app';
import firestore, { Timestamp } from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import * as DocumentPicker from 'expo-document-picker';
import { useTranslation } from 'react-i18next';
import RNFetchBlob from 'rn-fetch-blob';
import SnackbarInfo from '@/components/SnackbarInfo';

export default function importExport() {
	const { t } = useTranslation();

	const [importLoading, setImportLoading] = useState(false);
	const [exportLoading, setExportLoading] = useState(false);

	// All the logic to implement the snackbar
	const [snackbarVisible, setSnackbarVisible] = useState(false);
	const [snackbarText, setSnackbarText] = useState('');

	const showSnackbar = (text: string) => {
		setSnackbarText(text);
		setSnackbarVisible(true);
	};
	const onDismissSnackbar = () => setSnackbarVisible(false);

	const reference = storage().ref('membersData.csv');

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
	const formatDataOrder = (data) => {
		const orderedKeys = [
			'name',
			'memberNumber',
			'email',
			'phoneNumber',
			'occupation',
			'country',
			'address',
			'zipCode',
			'birthDate',
			'addedDate',
			'endDate',
		];

		return data.map((doc) => {
			const orderedDoc = {};

			for (const key of orderedKeys) {
				orderedDoc[key] = doc[key] || '';
			}

			for (const key of Object.keys(doc)) {
				if (!orderedKeys.includes(key) && key !== 'profilePicture') {
					orderedDoc[key] = doc[key];
				}
			}

			//console.log(orderedDoc);
			return orderedDoc;
		});
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
				} else if (key === 'memberNumber') {
					//console.log(key);
					//console.log(typeof doc[key]);
					doc[key] = Number(doc[key]);
					//console.log(typeof doc[key]);
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
			setImportLoading(false);
			return;
		}
	};

	// converts received data from the firestore database in the json format
	// to a csv format for more readability and ease of editing if necessary
	const convertJSONToCSV = (data) => {
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
			setExportLoading(false);
			return;
		}
	};

	const uploadFile = async (filePath) => {
		const task = reference.putFile(filePath);

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
				setExportLoading(false);
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
			setImportLoading(false);
		}
	};

	const readFile = async (fileUri) => {
		try {
			const fileContent = await RNFetchBlob.fs.readFile(fileUri, 'utf8');
			return fileContent;
		} catch (e: any) {
			//showSnackbar("Couldn't read file: " + e.message);
			console.log(`Couldn't read file: ${e.message}`);
			setImportLoading(false);
			return null;
		}
	};

	const checkMember = async (memberData) => {
		let check = 0;
		await firestore()
			.collection('members')
			.where('memberNumber', '==', memberData.memberNumber)
			.get()
			.then((querySnapshot) => {
				if (!querySnapshot.empty) {
					check = 1;
				}
			});
		return check;
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
			setImportLoading(false);
		}
	};

	const importMembers = async () => {
		setImportLoading(true);

		if (Number(Platform.Version) < 33) {
			const permissionsCheck = await checkPermissions();

			if (!permissionsCheck) {
				setImportLoading(false);
				return;
			}
		}

		const file = await pickFile();
		if (!file || file.canceled) {
			setImportLoading(false);
			return;
		}

		const fileContent = await readFile(file.assets[0].uri);
		//console.log(fileContent);

		const data = await convertCSVtoJSON(fileContent);
		//console.log(data);

		const membersData = await formatDataOrder(data);
		//console.log(membersData);

		// to ensure proper import
		formatDataToImport(membersData);

		const batch = firestore().batch();

		const existingMembers = [];

		try {
			for (const member of membersData) {
				const check = await checkMember(member);
				if (!check) {
					const memberRef = firestore().collection('members').doc();

					// set profilePicture to field to an existing picture if it exists
					// or the default one if it doesn't
					// which I now realize will never happen and will always be the default,
					// because the document ID is completely new, oh well
					/* const url = await storage()
						.ref('profilePicture/' + memberRef + '.jpg')
						.getDownloadURL();
          console.log(url); */

					member.profilePicture =
						process.env.EXPO_PUBLIC_PLACEHOLDER_PICTURE_URL;

					batch.set(memberRef, member);
				} else {
					existingMembers.push(member.memberNumber);
				}
			}
		} catch (e: any) {
			const err = e as FirebaseError;
			//showSnackbar('Error importing: ' + err.message);
			console.log(`Error importing: ${err.message}`);
			setImportLoading(false);
			return;
		} finally {
			await batch.commit();
			console.log(existingMembers);

			let importMsg = t('importExport.importSuccess');
			if (existingMembers.length) {
				importMsg += `\n${t(
					'importExport.importExistingMembers'
				)}: ${existingMembers.toString()}`;
			}
			showSnackbar(importMsg);
			console.log(importMsg);
			setImportLoading(false);
		}
	};

	const exportMembers = async () => {
		setExportLoading(true);

		if (Number(Platform.Version) < 33) {
			const permissionsCheck = await checkPermissions();

			if (!permissionsCheck) {
				setExportLoading(false);
				return;
			}
		}

		try {
			const snapshot = await firestore()
				.collection('members')
				.orderBy('memberNumber', 'asc')
				.get();

			const rawData = snapshot.docs.map((doc) => doc.data());
			//console.log(rawData);

			const membersData = formatDataOrder(rawData);

			// to ensure proper export
			formatDataToExport(membersData);

			const file = convertJSONToCSV(membersData);
			//console.log(file);

			const filePath = `${RNFetchBlob.fs.dirs.CacheDir}/membersData.csv`;
			//console.log(filePath);

			await RNFetchBlob.fs.writeFile(filePath, file);

			await uploadFile(filePath);

			let docPath = `${RNFetchBlob.fs.dirs.DownloadDir}/membersData.csv`;
			//console.log(docPath);

			let i = 1;

			while (await RNFetchBlob.fs.exists(docPath)) {
				docPath = `${
					RNFetchBlob.fs.dirs.DownloadDir
				}/membersData${i.toString()}.csv`;
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
					showSnackbar(t('importExport.exportSuccess'));
					console.log('Exporting successfull!');
				})
				.catch((e: any) => {
					const err = e as FirebaseError;
					//showSnackbar('Data download failed: ' + err.message);
					console.log(`Data download failed: ${err.message}`);
					setExportLoading(false);
				});
		} catch (e: any) {
			const err = e as FirebaseError;
			console.log(`Exporting members failed: ${err.message}`);
			//showSnackbar('Exporting members failed: ' + err.message);
			setExportLoading(false);
			return;
		} finally {
			setExportLoading(false);
		}
	};

	return (
		<>
			<SnackbarInfo
				text={snackbarText}
				visible={snackbarVisible}
				onDismiss={onDismissSnackbar}
			/>

			<View style={styles.container}>
				<View style={styles.buttonContainer}>
					<Button
						style={styles.button}
						contentStyle={styles.buttonContent}
						labelStyle={styles.buttonText}
						icon='database-import'
						mode='elevated'
						loading={importLoading}
						onPress={importMembers}
					>
						{t('importExport.importMembers')}
					</Button>
					<Button
						style={styles.button}
						contentStyle={styles.buttonContent}
						labelStyle={styles.buttonText}
						icon='database-export'
						mode='elevated'
						loading={exportLoading}
						onPress={exportMembers}
					>
						{t('importExport.exportMembers')}
					</Button>
				</View>
			</View>
		</>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
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
