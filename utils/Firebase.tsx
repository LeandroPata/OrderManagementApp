import firestore from '@react-native-firebase/firestore';
import type { FirebaseError } from 'firebase/app';
import { isEmpty } from './Utils';

export const getClients = async () => {
	const querySnapshot = await firestore()
		.collection('clients')
		.orderBy('name', 'asc')
		.get()
		.catch((e: any) => {
			const err = e as FirebaseError;
			//showSnackbar('Error getting all clients list: ' + err.message);
			console.log(`Error getting all clients list: ${err.message}`);
		});
	const clientsAll = [];

	querySnapshot.forEach((doc) => {
		clientsAll.push({
			key: doc.id,
			name: doc.data().name,
			contact: doc.data().contact,
		});
	});

	return clientsAll.length ? clientsAll : false;
};

export const getSingleClient = async (id: string) => {
	id = id.trim();

	const docSnapshot = await firestore()
		.collection('clients')
		.doc(id)
		.get()
		.catch((e: any) => {
			const err = e as FirebaseError;
			//showSnackbar('Getting client failed: ' + err.message);
			console.log(`Getting client failed: ${err.message}`);
		});
	//console.log(docSnapshot.data());
	//console.log(docSnapshot.exists);
	return docSnapshot.exists ? docSnapshot.data() : false;
};

export const getSingleClientByName = async (name: string) => {
	name = name.trim();
	let doc = {};

	const querySnapshot = await firestore()
		.collection('clients')
		.where('name', '==', name)
		.limit(1)
		.get()
		.catch((e: any) => {
			const err = e as FirebaseError;
			//showSnackbar('Error getting client: ' + err.message);
			console.log(`Error getting client: ${err.message}`);
		});

	querySnapshot.forEach((docSnapshot) => {
		doc = docSnapshot.data();
	});

	//console.log(doc);
	return !isEmpty(doc) ? doc : false;
};

export const getSingleClientID = async (name: string) => {
	name = name.trim();
	let clientID = '';

	const querySnapshot = await firestore()
		.collection('clients')
		.where('name', '==', name)
		.limit(1)
		.get()
		.catch((e: any) => {
			const err = e as FirebaseError;
			//showSnackbar('Error getting client ID: ' + err.message);
			console.log(`Error getting client ID: ${err.message}`);
		});

	querySnapshot.forEach((docSnapshot) => {
		clientID = docSnapshot.id.trim();
	});

	//console.log(clientID);
	return clientID ? clientID : false;
};

export const getClientNames = async () => {
	const querySnapshot = await firestore()
		.collection('clients')
		.orderBy('name', 'asc')
		.get()
		.catch((e: any) => {
			const err = e as FirebaseError;
			//showSnackbar('Error getting client names: ' + err.message);
			console.log(`Error getting client names: ${err.message}`);
		});
	const clientNames = [];

	querySnapshot.forEach((doc) => {
		if (!clientNames.includes(doc.data().name))
			clientNames.push({ id: doc.id, name: doc.data().name });
	});
	//console.log(clientNames);
	return clientNames.length ? clientNames : false;
};

export const checkClient = async (id: string) => {
	//console.log(id);
	let docCheck = false;
	const docRef = firestore().collection('clients').doc(id);

	await docRef
		.get()
		.then((doc) => {
			if (doc.exists) docCheck = true;
		})
		.catch((e: any) => {
			const err = e as FirebaseError;
			//showSnackbar('Checking client failed: ' + err.message);
			console.log(`Checking client failed: ${err.message}`);
		});
	return docCheck;
};

export const checkClientByName = async (name: string) => {
	//console.log(name);
	let docCheck = false;
	if (!name.trim()) return false;
	try {
		const querySnapshot = await firestore()
			.collection('clients')
			.where('name', '==', name)
			.get();

		if (!querySnapshot.empty) docCheck = true;
	} catch (e: any) {
		const err = e as FirebaseError;
		console.log(`Checking client name failed: ${err.message}`);
		return docCheck;
	}
	return docCheck;
};

export const deleteClientDoc = async (id: string) => {
	await firestore()
		.collection('clients')
		.doc(id)
		.delete()
		.catch((e: any) => {
			const err = e as FirebaseError;
			//showSnackbar('Client deletion failed: ' + err.message);
			console.log(`Client deletion failed: ${err.message}`);
			return false;
		});
	return true;
};

export const getProducts = async () => {
	const querySnapshot = await firestore()
		.collection('products')
		.orderBy('name', 'asc')
		.get()
		.catch((e: any) => {
			const err = e as FirebaseError;
			//showSnackbar('Error getting all products list: ' + err.message);
			console.log(`Error getting all products list: ${err.message}`);
		});
	const clientsAll = [];

	querySnapshot.forEach((doc) => {
		clientsAll.push({
			key: doc.id,
			name: doc.data().name,
			price: doc.data().price,
			priceByWeight: doc.data().priceByWeight,
		});
	});

	return clientsAll.length ? clientsAll : false;
};

export const getSingleProduct = async (id: string) => {
	const docSnapshot = await firestore()
		.collection('products')
		.doc(id)
		.get()
		.catch((e: any) => {
			const err = e as FirebaseError;
			//showSnackbar('Getting product failed: ' + err.message);
			console.log(`Getting product failed: ${err.message}`);
		});
	//console.log(docSnapshot.data());
	//console.log(docSnapshot.exists);

	return docSnapshot.exists ? docSnapshot.data() : false;
};

export const getSingleProductByName = async (name: string) => {
	let doc = {};
	const querySnapshot = await firestore()
		.collection('products')
		.where('name', '==', name)
		.limit(1)
		.get()
		.catch((e: any) => {
			const err = e as FirebaseError;
			//showSnackbar('Getting product failed: ' + err.message);
			console.log(`Getting product failed: ${err.message}`);
		});

	querySnapshot.forEach((docSnapshot) => {
		doc = docSnapshot.data();
	});

	//console.log(doc);
	return !isEmpty(doc) ? doc : false;
};

export const getSingleProductID = async (name: string) => {
	name = name.trim();
	let productID = '';

	const querySnapshot = await firestore()
		.collection('products')
		.where('name', '==', name)
		.limit(1)
		.get()
		.catch((e: any) => {
			const err = e as FirebaseError;
			//showSnackbar('Error getting product ID: ' + err.message);
			console.log(`Error getting product ID: ${err.message}`);
		});

	querySnapshot.forEach((docSnapshot) => {
		productID = docSnapshot.id.trim();
	});

	//console.log(productID);
	return productID ? productID : false;
};

export const getProductNames = async () => {
	const querySnapshot = await firestore()
		.collection('products')
		.orderBy('name', 'asc')
		.get()
		.catch((e: any) => {
			const err = e as FirebaseError;
			//showSnackbar('Error getting product names: ' + err.message);
			console.log(`Error getting product names: ${err.message}`);
		});
	const productNames = [];

	querySnapshot.forEach((doc) => {
		if (!productNames.includes(doc.data().name))
			productNames.push({ id: doc.id, name: doc.data().name });
	});

	//console.log(productNames);
	return productNames.length ? productNames : false;
};

export const checkProduct = async (id: string) => {
	//console.log(id);
	let docCheck = false;
	const docRef = firestore().collection('product').doc(id);

	await docRef
		.get()
		.then((doc) => {
			console.log(doc.data());
			console.log(doc.exists);
			if (doc.exists) docCheck = true;
		})
		.catch((e: any) => {
			const err = e as FirebaseError;
			//showSnackbar('Checking product failed: ' + err.message);
			console.log(`Checking product failed: ${err.message}`);
		});
	return docCheck;
};

export const checkProductByName = async (name: string) => {
	//console.log(name);
	let docCheck = false;
	try {
		const querySnapshot = await firestore()
			.collection('products')
			.where('name', '==', name)
			.get();

		if (!querySnapshot.empty) docCheck = true;
	} catch (e: any) {
		const err = e as FirebaseError;
		console.log(`Checking product name failed: ${err.message}`);
		return docCheck;
	}
	return docCheck;
};

export const deleteProductDoc = async (id: string) => {
	await firestore()
		.collection('products')
		.doc(id)
		.delete()
		.catch((e: any) => {
			const err = e as FirebaseError;
			//showSnackbar('Product deletion failed: ' + err.message);
			console.log(`Product deletion failed: ${err.message}`);
			return false;
		});
	return true;
};

export const deleteOrderDoc = async (id: string) => {
	await firestore()
		.collection('order')
		.doc(id)
		.delete()
		.catch((e: any) => {
			const err = e as FirebaseError;
			//showSnackbar('Order deletion failed: ' + err.message);
			console.log(`Order deletion failed: ${err.message}`);
			return false;
		});
	return true;
};
