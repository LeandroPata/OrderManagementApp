import firestore from '@react-native-firebase/firestore';
import type { FirebaseError } from 'firebase/app';

export const getClients = async () => {
	const clientsAll: object[] = [];

	await firestore()
		.collection('clients')
		.orderBy('name', 'asc')
		.get()
		.then((querySnapshot) => {
			querySnapshot.forEach((doc) => {
				clientsAll.push({
					key: doc.id,
					name: doc.data().name,
					contact: doc.data().contact,
				});
			});
		})
		.catch((e: any) => {
			const err = e as FirebaseError;
			//showSnackbar('Error getting all clients list: ' + err.message);
			console.error(`Error getting all clients list: ${err.message}`);
		});

	return clientsAll.length ? clientsAll : false;
};

export const getSingleClient = async (id: string) => {
	id = id.trim();
	if (!id) return false;

	await firestore()
		.collection('clients')
		.doc(id)
		.get()
		.then((docSnapshot) => {
			//console.log(docSnapshot.data());
			//console.log(docSnapshot.exists);
			return docSnapshot.exists ? docSnapshot.data() : false;
		})
		.catch((e: any) => {
			const err = e as FirebaseError;
			//showSnackbar('Getting client failed: ' + err.message);
			console.error(`Getting client failed: ${err.message}`);
		});
};

export const getSingleClientByName = async (name: string) => {
	name = name.trim();
	if (!name) return false;

	await firestore()
		.collection('clients')
		.where('name', '==', name)
		.limit(1)
		.get()
		.then((querySnapshot) => {
			if (!querySnapshot.empty) return querySnapshot.docs[0].data();
			else return false;
		})
		.catch((e: any) => {
			const err = e as FirebaseError;
			//showSnackbar('Error getting client: ' + err.message);
			console.error(`Error getting client: ${err.message}`);
		});
};

export const getSingleClientID = async (name: string) => {
	name = name.trim();
	if (!name) return false;

	await firestore()
		.collection('clients')
		.where('name', '==', name)
		.limit(1)
		.get()
		.then((querySnapshot) => {
			if (!querySnapshot.empty) return querySnapshot.docs[0].id.trim();
			else return false;
		})
		.catch((e: any) => {
			const err = e as FirebaseError;
			//showSnackbar('Error getting client ID: ' + err.message);
			console.error(`Error getting client ID: ${err.message}`);
		});
};

export const getClientNames = async () => {
	const clientNames: object[] = [];

	await firestore()
		.collection('clients')
		.orderBy('name', 'asc')
		.get()
		.then((querySnapshot) => {
			querySnapshot.forEach((doc) => {
				if (!clientNames.includes(doc.data().name))
					clientNames.push({ id: doc.id, name: doc.data().name });
			});
		})
		.catch((e: any) => {
			const err = e as FirebaseError;
			//showSnackbar('Error getting client names: ' + err.message);
			console.error(`Error getting client names: ${err.message}`);
		});

	//console.log(clientNames);
	return clientNames.length ? clientNames : false;
};

export const getSingleClientOrders = async (id: string) => {
	id = id.trim();
	if (!id) return false;

	const orders: object[] = [];

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
	id = id.trim();
	if (!id) return false;

	await firestore()
		.collection('clients')
		.doc(id)
		.get()
		.then((doc) => {
			return doc.exists;
		})
		.catch((e: any) => {
			const err = e as FirebaseError;
			//showSnackbar('Checking client failed: ' + err.message);
			console.error(`Checking client failed: ${err.message}`);
			return false;
		});
};

export const checkClientByName = async (name: string) => {
	name = name.trim();
	if (!name) return false;

	await firestore()
		.collection('clients')
		.where('name', '==', name)
		.limit(1)
		.get()
		.then((querySnapshot) => {
			return !querySnapshot.empty;
		})
		.catch((e: any) => {
			const err = e as FirebaseError;
			//showSnackbar(`Checking client name failed: ${err.message}`);
			console.error(`Checking client name failed: ${err.message}`);
			return false;
		});
};

export const deleteClientDoc = async (id: string) => {
	id = id.trim();
	if (!id) return false;

	const docCheck = await checkClient(id);
	if (!docCheck) return false;

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
	const clientsAll: object[] = [];

	await firestore()
		.collection('products')
		.orderBy('name', 'asc')
		.get()
		.then((querySnapshot) => {
			querySnapshot.forEach((doc) => {
				clientsAll.push({
					key: doc.id,
					name: doc.data().name,
					price: doc.data().price,
					priceByWeight: doc.data().priceByWeight,
				});
			});
		})
		.catch((e: any) => {
			const err = e as FirebaseError;
			//showSnackbar('Error getting all products list: ' + err.message);
			console.error(`Error getting all products list: ${err.message}`);
		});

	return clientsAll.length ? clientsAll : false;
};

export const getSingleProduct = async (id: string) => {
	id = id.trim();
	if (!id) return false;

	await firestore()
		.collection('products')
		.doc(id)
		.get()
		.then((docSnapshot) => {
			//console.log(docSnapshot.data());
			//console.log(docSnapshot.exists);
			return docSnapshot.exists ? docSnapshot.data() : false;
		})
		.catch((e: any) => {
			const err = e as FirebaseError;
			//showSnackbar('Getting product failed: ' + err.message);
			console.error(`Getting product failed: ${err.message}`);
		});
};

export const getSingleProductByName = async (name: string) => {
	name = name.trim();
	if (!name) return false;

	await firestore()
		.collection('products')
		.where('name', '==', name)
		.limit(1)
		.get()
		.then((querySnapshot) => {
			if (!querySnapshot.empty) return querySnapshot.docs[0].data();
			else return false;
		})
		.catch((e: any) => {
			const err = e as FirebaseError;
			//showSnackbar('Getting product failed: ' + err.message);
			console.error(`Getting product failed: ${err.message}`);
		});
};

export const getSingleProductID = async (name: string) => {
	name = name.trim();
	if (!name) return false;

	await firestore()
		.collection('products')
		.where('name', '==', name)
		.limit(1)
		.get()
		.then((querySnapshot) => {
			if (!querySnapshot.empty) return querySnapshot.docs[0].id.trim();
			else return false;
		})
		.catch((e: any) => {
			const err = e as FirebaseError;
			//showSnackbar('Error getting product ID: ' + err.message);
			console.error(`Error getting product ID: ${err.message}`);
		});
};

export const getProductNames = async () => {
	const productNames: object[] = [];

	await firestore()
		.collection('products')
		.orderBy('name', 'asc')
		.get()
		.then((querySnapshot) => {
			querySnapshot.forEach((doc) => {
				if (!productNames.includes(doc.data().name))
					productNames.push({ id: doc.id, name: doc.data().name });
			});
		})
		.catch((e: any) => {
			const err = e as FirebaseError;
			//showSnackbar('Error getting product names: ' + err.message);
			console.error(`Error getting product names: ${err.message}`);
		});

	//console.log(productNames);
	return productNames.length ? productNames : false;
};

export const getSingleProductOrders = async (id: string) => {
	id = id.trim();
	if (!id) return false;

	const orders: object[] = [];

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
	const currentCount: object[] = [];

	await firestore()
		.collection('orders')
		.orderBy('order.product.name', 'asc')
		.get()
		.then((querySnapshot) => {
			const productQuantity: object = {};
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
	const currentCount: object[] = [];

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
					(product: object) =>
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
	id = id.trim();
	if (!id) return false;

	await firestore()
		.collection('products')
		.doc(id)
		.get()
		.then((doc) => {
			//console.log(doc.data());
			//console.log(doc.exists);
			return doc.exists;
		})
		.catch((e: any) => {
			const err = e as FirebaseError;
			//showSnackbar('Checking product failed: ' + err.message);
			console.error(`Checking product failed: ${err.message}`);
			return false;
		});
};

export const checkProductByName = async (name: string) => {
	name = name.trim();
	if (!name) return false;

	await firestore()
		.collection('products')
		.where('name', '==', name)
		.limit(1)
		.get()
		.then((querySnapshot) => {
			return !querySnapshot.empty;
		})
		.catch((e: any) => {
			const err = e as FirebaseError;
			console.error(`Checking product name failed: ${err.message}`);
			return false;
		});
};

export const deleteProductDoc = async (id: string) => {
	id = id.trim();
	if (!id) return false;

	const docCheck = await checkProduct(id);
	if (!docCheck) return false;

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
	id = id.trim();
	if (!id) return false;

	await firestore()
		.collection('orders')
		.doc(id)
		.get()
		.then((doc) => {
			//console.log(doc.data());
			//console.log(doc.exists);
			return doc.exists;
		})
		.catch((e: any) => {
			const err = e as FirebaseError;
			//showSnackbar('Checking product failed: ' + err.message);
			console.error(`Checking product failed: ${err.message}`);
			return false;
		});
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
	id = id.trim();
	if (!id) return false;

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
