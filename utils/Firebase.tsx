import firestore from '@react-native-firebase/firestore';
import type { FirebaseError } from 'firebase/app';
import { isEmpty } from '@/utils/Utils';

export const getClients = async () => {
	const querySnapshot = await firestore()
		.collection('clients')
		.orderBy('name', 'asc')
		.get()
		.catch((e: any) => {
			const err = e as FirebaseError;
			//showSnackbar('Error getting all clients list: ' + err.message);
			console.error(`Error getting all clients list: ${err.message}`);
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
			console.error(`Getting client failed: ${err.message}`);
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
			console.error(`Error getting client: ${err.message}`);
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
			console.error(`Error getting client ID: ${err.message}`);
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
			console.error(`Error getting client names: ${err.message}`);
		});
	const clientNames = [];

	querySnapshot.forEach((doc) => {
		if (!clientNames.includes(doc.data().name))
			clientNames.push({ id: doc.id, name: doc.data().name });
	});
	//console.log(clientNames);
	return clientNames.length ? clientNames : false;
};

export const getSingleClientOrders = async (id: string) => {
	const orders = [];
	await firestore()
		.collection('orders')
		.orderBy('order.product.name', 'asc')
		.where('client.id', '==', id)
		.get()
		.then((querySnapshot) => {
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
		})
		.catch((e: any) => {
			const err = e as FirebaseError;
			console.error(`Error getting client orders: ${err.message}`);
		});
	//console.log(orders);
	return orders.length ? orders : false;
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
			console.error(`Checking client failed: ${err.message}`);
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
		console.error(`Checking client name failed: ${err.message}`);
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
			console.error(`Client deletion failed: ${err.message}`);
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
			console.error(`Error getting all products list: ${err.message}`);
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
			console.error(`Getting product failed: ${err.message}`);
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
			console.error(`Getting product failed: ${err.message}`);
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
			console.error(`Error getting product ID: ${err.message}`);
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
			console.error(`Error getting product names: ${err.message}`);
		});
	const productNames = [];

	querySnapshot.forEach((doc) => {
		if (!productNames.includes(doc.data().name))
			productNames.push({ id: doc.id, name: doc.data().name });
	});

	//console.log(productNames);
	return productNames.length ? productNames : false;
};

export const getSingleProductOrders = async (id: string) => {
	const orders = [];
	await firestore()
		.collection('orders')
		.orderBy('client.name', 'asc')
		.where('order.product.id', '==', id)
		.get()
		.then((querySnapshot) => {
			querySnapshot.forEach((doc) => {
				orders.push({
					id: doc.id,
					client: doc.data().client,
					quantity: doc.data().order.quantity,
					weight: doc.data().order.weight,
					price: doc.data().order.price,
					status: doc.data().order.status,
					notes: doc.data().order.notes,
					deliveryDateTime: new Date(doc.data().deliveryDateTime.toDate()),
				});
			});
		})
		.catch((e: any) => {
			const err = e as FirebaseError;
			console.error(`Error getting product orders: ${err.message}`);
		});

	//console.log(orders);
	return orders.length ? orders : false;
};

export const getProductsCount = async () => {
	const currentCount = [];

	await firestore()
		.collection('orders')
		.orderBy('order.product.name', 'asc')
		.get()
		.then((querySnapshot) => {
			const productQuantity = {};
			let i = 0;

			querySnapshot.forEach((doc) => {
				//console.log(doc.data().order);
				const existingProduct = currentCount.find(
					(product) =>
						doc.data().order.product.id === product.id
						&& doc.data().order.weight === product.weight
						&& doc.data().order.status === product.status
				);

				if (existingProduct) {
					existingProduct.quantity += doc.data().order.quantity;
					if (productQuantity[existingProduct.id] && doc.data().order.weight) {
						productQuantity[existingProduct.id] +=
							doc.data().order.quantity * doc.data().order.weight;
						existingProduct.weightTotal = productQuantity[existingProduct.id];
					}
				} else {
					if (!productQuantity[doc.data().order.product.id])
						productQuantity[doc.data().order.product.id] =
							doc.data().order.weight * doc.data().order.quantity;
					else {
						productQuantity[doc.data().order.product.id] +=
							doc.data().order.weight * doc.data().order.quantity;
					}
					currentCount.push({
						key: i,
						id: doc.data().order.product.id,
						name: doc.data().order.product.name,
						quantity: doc.data().order.quantity,
						weight: doc.data().order.weight,
						weightTotal: productQuantity[doc.data().order.product.id],
						status: doc.data().order.status,
					});
					i++;
				}
			});
			for (const count of currentCount) {
				count.weightTotal = productQuantity[count.id];
			}
			//console.log(currentCount);
		})
		.catch((e: any) => {
			const err = e as FirebaseError;
			console.log(`Error getting product count: ${err.message}`);
		});

	return currentCount;
};

export const getIncompleteProductsCount = async () => {
	const currentCount = [];

	await firestore()
		.collection('orders')
		.where('order.status', '==', 'Incomplete')
		.orderBy('order.product.name', 'asc')
		.get()
		.then((querySnapshot) => {
			const productQuantity = {};
			let i = 0;

			querySnapshot.forEach((doc) => {
				//console.log(doc.data().order);
				const existingProduct = currentCount.find(
					(product) =>
						doc.data().order.product.id === product.id
						&& doc.data().order.weight === product.weight
						&& doc.data().order.status === product.status
				);

				if (existingProduct) {
					existingProduct.quantity += doc.data().order.quantity;
					if (productQuantity[existingProduct.id] && doc.data().order.weight) {
						productQuantity[existingProduct.id] +=
							doc.data().order.quantity * doc.data().order.weight;
						existingProduct.weightTotal = productQuantity[existingProduct.id];
					}
				} else {
					if (!productQuantity[doc.data().order.product.id])
						productQuantity[doc.data().order.product.id] =
							doc.data().order.weight * doc.data().order.quantity;
					else {
						productQuantity[doc.data().order.product.id] +=
							doc.data().order.weight * doc.data().order.quantity;
					}
					currentCount.push({
						key: i,
						id: doc.data().order.product.id,
						name: doc.data().order.product.name,
						quantity: doc.data().order.quantity,
						weight: doc.data().order.weight,
						weightTotal: productQuantity[doc.data().order.product.id],
						status: doc.data().order.status,
					});
					i++;
				}
			});
			for (const count of currentCount) {
				count.weightTotal = productQuantity[count.id];
			}
			//console.log(currentCount);
		})
		.catch((e: any) => {
			const err = e as FirebaseError;
			console.log(`Error getting product count: ${err.message}`);
		});

	return currentCount;
};

export const checkProduct = async (id: string) => {
	//console.log(id);
	let docCheck = false;
	const docRef = firestore().collection('products').doc(id);

	await docRef
		.get()
		.then((doc) => {
			//console.log(doc.data());
			//console.log(doc.exists);
			if (doc.exists) docCheck = true;
		})
		.catch((e: any) => {
			const err = e as FirebaseError;
			//showSnackbar('Checking product failed: ' + err.message);
			console.error(`Checking product failed: ${err.message}`);
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
		console.error(`Checking product name failed: ${err.message}`);
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
			console.error(`Product deletion failed: ${err.message}`);
			return false;
		});
	return true;
};

export const checkOrder = async (id: string) => {
	//console.log(id);

	let docCheck = false;
	const docRef = firestore().collection('orders').doc(id);

	await docRef
		.get()
		.then((doc) => {
			//console.log(doc.data());
			//console.log(doc.exists);
			if (doc.exists) docCheck = true;
		})
		.catch((e: any) => {
			const err = e as FirebaseError;
			//showSnackbar('Checking product failed: ' + err.message);
			console.error(`Checking product failed: ${err.message}`);
		});
	return docCheck;
};

export const updateSingleOrderStatus = async (order: object) => {
	//console.log(order);

	const docCheck = await checkOrder(order.id);
	if (!order.id || !order.status || !docCheck) return false;

	await firestore()
		.collection('orders')
		.doc(order.id)
		.update({ 'order.status': order.status })
		.catch((e: any) => {
			const err = e as FirebaseError;
			console.error(`Error updating order: ${err.message}`);
			return false;
		});
	return true;
};

export const deleteOrderDoc = async (id: string) => {
	const docCheck = await checkOrder(id);
	if (!docCheck) return false;

	await firestore()
		.collection('orders')
		.doc(id)
		.delete()
		.catch((e: any) => {
			const err = e as FirebaseError;
			//showSnackbar('Error deleting order: ' + err.message);
			console.error(`Error deleting order: ${err.message}`);
			return false;
		});
	return true;
};
