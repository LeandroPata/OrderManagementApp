import { deleteOrderDoc, updateSingleOrderStatus } from '@/utils/Firebase';

type OrderStatus = 'Ready' | 'Delivered' | 'Deleted';

export function isEmpty(obj: object) {
	for (const prop in obj) {
		if (Object.hasOwn(obj, prop)) {
			return false;
		}
	}

	return true;
}

export const handleOrderStatus = async (
	order: object
): Promise<OrderStatus | false> => {
	//console.log(order);

	try {
		switch (order.status) {
			case 'Incomplete':
				order.status = 'Ready';
				break;
			case 'Ready':
				order.status = 'Delivered';
				break;
			case 'Delivered': {
				const deleted = await deleteOrderDoc(order.id);
				if (deleted) {
					//showSnackbar(t('show.clientOrder.DeletedOrder'));
					//getClientOrders(clientId);
					return 'Deleted';
				}
				return false;
			}
			default:
				return false;
		}
		// Update in Firestore
		const updated = await updateSingleOrderStatus(order);
		console.log(updated);

		if (updated) return order.status;
		return false;
	} catch (e: any) {
		console.log(`Error updating order status: ${e.message}`);
		return false;
	}
};

export const countProduct = (productId: string, productsQuantity: object[]) => {
	//console.log(productId);
	const filteredCount = [];

	for (const count of productsQuantity) {
		if (count.id === productId) {
			filteredCount.push(count);
		}
	}

	//console.log(filteredCount);
	return filteredCount;
};
