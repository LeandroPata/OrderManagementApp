import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import {
	DataTable,
	Divider,
	Modal,
	Portal,
	Text,
	useTheme,
} from 'react-native-paper';
import DialogConfirmation from './DialogConfirmation';

type DataTableOrderProps = {
	data: ArrayLike<any> | null | undefined;
	dataType: 'newOrder' | 'clientOrder' | 'productOrder' | 'productQuantity';
	defaultSort: 'product.name' | 'client.name' | 'name';
	numberofItemsPerPageList: Array<number>;
	onLongPress: (item: object) => void;
};

const DataTableOrder = (props: DataTableOrderProps) => {
	const theme = useTheme();
	const { t } = useTranslation();

	const [page, setPage] = useState<number>(0);
	const [numberOfItemsPerPageList] = useState(props.numberofItemsPerPageList);

	const [itemModal, setItemModal] = useState({});
	const [itemModalVisible, setItemModalVisible] = useState(false);

	const [itemsPerPage, onItemsPerPageChange] = useState(
		numberOfItemsPerPageList[0]
	);

	// All the logic to implemet DialogConfirmation
	const [dialogConfirmationVisible, setDialogConfirmationVisible] =
		useState(false);
	const [dialogText, setDialogText] = useState('');
	const onDismissDialogConfirmation = () => setDialogConfirmationVisible(false);

	const [data, setData] = useState(props.data);
	//console.log('Props');
	//console.log(props.data);
	//console.log('Data');
	//console.log(data);

	const from = page * itemsPerPage;
	const to = Math.min((page + 1) * itemsPerPage, data.length);

	const [sortDirection, setSortDirection] = useState<
		'ascending' | 'descending'
	>('ascending');
	const [sortedColumn, setSortedColumn] = useState(props.defaultSort);

	const changeSortDirection = (column: string) => {
		const newSortDirection =
			sortedColumn === column && sortDirection === 'ascending'
				? 'descending'
				: 'ascending';
		setSortDirection(newSortDirection);
		return newSortDirection;
	};

	const handleSort = (
		column: string,
		unsortedData: ArrayLike<any> | null | undefined,
		changeSort: boolean
	) => {
		let newSortDirection = sortDirection;
		if (changeSort) {
			newSortDirection = changeSortDirection(column);
			setSortedColumn(column);
		}

		const sortedData = [...unsortedData].sort((a, b) => {
			if (column === 'product.name') {
				if (newSortDirection === 'ascending') {
					return a.product.name > b.product.name ? 1 : -1;
				} else {
					return a.product.name < b.product.name ? 1 : -1;
				}
			} else if (column === 'client.name') {
				if (newSortDirection === 'ascending') {
					return a.client.name > b.client.name ? 1 : -1;
				} else {
					return a.client.name < b.client.name ? 1 : -1;
				}
			} else {
				if (newSortDirection === 'ascending') {
					return a[column] > b[column] ? 1 : -1;
				} else {
					return a[column] < b[column] ? 1 : -1;
				}
			}
		});
		setData(sortedData);
	};

	useEffect(() => {
		setPage(0);
	}, [itemsPerPage]);

	useEffect(() => {
		handleSort(sortedColumn, props.data, false);
	}, [props.data?.length]);

	const showItemModal = (item: object) => {
		setItemModal(item);
		setItemModalVisible(true);
		//console.log(item);
	};

	const itemStatusChange = (item: object) => {
		setItemModal(item);
		if (item.status === 'Incomplete') setDialogText('Order is completed?');
		else if (item.status === 'Complete') setDialogText('Order is delivered?');
		else if (item.status === 'Delivered') setDialogText('Delete order?');
		setDialogConfirmationVisible(true);
	};

	const renderDataTable = () => {
		//console.log(data);
		switch (props.dataType) {
			case 'newOrder': {
				return (
					<DataTable>
						<DataTable.Header>
							<DataTable.Title
								style={{
									justifyContent: 'center',
									flex: 2,
								}}
								textStyle={{ fontWeight: 'bold' }}
								sortDirection={
									sortedColumn === 'product.name' ? sortDirection : undefined
								}
								onPress={() => handleSort('product.name', data, true)}
							>
								Product
							</DataTable.Title>
							<DataTable.Title
								style={{
									justifyContent: 'center',
								}}
								textStyle={{ fontWeight: 'bold' }}
								sortDirection={
									sortedColumn === 'quantity' ? sortDirection : undefined
								}
								onPress={() => handleSort('quantity', data, true)}
							>
								Quantity
							</DataTable.Title>
							<DataTable.Title
								style={{
									justifyContent: 'center',
								}}
								textStyle={{ fontWeight: 'bold' }}
							>
								Weight
							</DataTable.Title>
							<DataTable.Title
								style={{
									justifyContent: 'center',
									flex: 2,
								}}
								textStyle={{ fontWeight: 'bold' }}
							>
								Total Weight
							</DataTable.Title>
							<DataTable.Title
								style={{
									justifyContent: 'center',
								}}
								textStyle={{ fontWeight: 'bold' }}
							>
								Price
							</DataTable.Title>
							<DataTable.Title
								style={{
									justifyContent: 'center',
								}}
								textStyle={{ fontWeight: 'bold' }}
							>
								Notes
							</DataTable.Title>
						</DataTable.Header>

						{data.slice(from, to).map((item) => (
							<DataTable.Row
								key={item.key}
								onLongPress={() => {
									itemStatusChange(item);
								}}
								onPress={() => {
									showItemModal(item);
								}}
							>
								<DataTable.Cell style={{ justifyContent: 'center', flex: 2 }}>
									{item.product.name}
								</DataTable.Cell>
								<DataTable.Cell
									style={{
										justifyContent: 'center',
									}}
								>
									{item.quantity}
								</DataTable.Cell>
								<DataTable.Cell
									style={{
										justifyContent: 'center',
									}}
								>
									{item.weight.toFixed(2)}
								</DataTable.Cell>
								<DataTable.Cell
									style={{
										justifyContent: 'center',
										flex: 2,
									}}
								>
									{(item.weight * item.quantity).toFixed(2)}
								</DataTable.Cell>
								<DataTable.Cell
									style={{
										justifyContent: 'center',
									}}
								>
									{item.price.toFixed(2)}
								</DataTable.Cell>
								<DataTable.Cell
									style={{
										justifyContent: 'center',
									}}
								>
									{item.notes}
								</DataTable.Cell>
							</DataTable.Row>
						))}
						<DataTable.Pagination
							page={page}
							numberOfPages={Math.ceil(data.length / itemsPerPage)}
							onPageChange={(page) => setPage(page)}
							label={`${from + 1}-${to} of ${data.length}`}
							numberOfItemsPerPage={itemsPerPage}
							numberOfItemsPerPageList={numberOfItemsPerPageList}
							onItemsPerPageChange={onItemsPerPageChange}
							//showFastPaginationControls
							selectPageDropdownLabel={'Rows per page'}
						/>
					</DataTable>
				);
			}
			case 'clientOrder': {
				return (
					<DataTable>
						<DataTable.Header>
							<DataTable.Title
								style={{
									justifyContent: 'center',
									flex: 2,
								}}
								textStyle={{ fontWeight: 'bold' }}
								sortDirection={
									sortedColumn === 'product.name' ? sortDirection : undefined
								}
								onPress={() => handleSort('product.name', data, true)}
							>
								Product
							</DataTable.Title>
							<DataTable.Title
								style={{ justifyContent: 'center' }}
								textStyle={{ fontWeight: 'bold' }}
								sortDirection={
									sortedColumn === 'quantity' ? sortDirection : undefined
								}
								onPress={() => handleSort('quantity', data, true)}
							>
								Quantity
							</DataTable.Title>
							<DataTable.Title
								style={{ justifyContent: 'center' }}
								textStyle={{ fontWeight: 'bold' }}
								sortDirection={
									sortedColumn === 'weight' ? sortDirection : undefined
								}
								onPress={() => handleSort('weight', data, true)}
							>
								Weight
							</DataTable.Title>
							<DataTable.Title
								style={{ justifyContent: 'center' }}
								textStyle={{ fontWeight: 'bold' }}
								sortDirection={
									sortedColumn === 'price' ? sortDirection : undefined
								}
								onPress={() => handleSort('price', data, true)}
							>
								Price
							</DataTable.Title>
							<DataTable.Title
								style={{
									justifyContent: 'center',
									flex: 2,
								}}
								textStyle={{ fontWeight: 'bold' }}
								sortDirection={
									sortedColumn === 'deliveryDateTime'
										? sortDirection
										: undefined
								}
								onPress={() => handleSort('deliveryDateTime', data, true)}
							>
								Delivery
							</DataTable.Title>
							<DataTable.Title
								style={{ justifyContent: 'center' }}
								textStyle={{ fontWeight: 'bold' }}
							>
								Status
							</DataTable.Title>
						</DataTable.Header>
						{data.slice(from, to).map((item) => (
							<DataTable.Row
								key={item.key}
								onLongPress={() => {
									itemStatusChange(item);
								}}
								onPress={() => {
									showItemModal(item);
								}}
							>
								<DataTable.Cell style={{ justifyContent: 'center', flex: 2 }}>
									{item.product.name}
								</DataTable.Cell>
								<DataTable.Cell style={{ justifyContent: 'center' }}>
									{item.quantity}
								</DataTable.Cell>
								<DataTable.Cell style={{ justifyContent: 'center' }}>
									{item.weight.toFixed(2)}
								</DataTable.Cell>
								<DataTable.Cell style={{ justifyContent: 'center' }}>
									{item.price.toFixed(2)}
								</DataTable.Cell>
								<DataTable.Cell style={{ justifyContent: 'center', flex: 2 }}>
									{item.deliveryDateTime.toLocaleString('pt-pt')}
								</DataTable.Cell>
								<DataTable.Cell style={{ justifyContent: 'center' }}>
									{item.status}
								</DataTable.Cell>
							</DataTable.Row>
						))}
						<DataTable.Pagination
							page={page}
							numberOfPages={Math.ceil(data.length / itemsPerPage)}
							onPageChange={(page) => setPage(page)}
							label={`${from + 1}-${to} of ${data.length}`}
							numberOfItemsPerPage={itemsPerPage}
							numberOfItemsPerPageList={numberOfItemsPerPageList}
							onItemsPerPageChange={onItemsPerPageChange}
							//showFastPaginationControls
							selectPageDropdownLabel={'Rows per page'}
						/>
					</DataTable>
				);
			}
			case 'productOrder': {
				return (
					<DataTable>
						<DataTable.Header>
							<DataTable.Title
								style={{
									justifyContent: 'center',
									flex: 2,
								}}
								textStyle={{ fontWeight: 'bold' }}
								sortDirection={
									sortedColumn === 'client.name' ? sortDirection : undefined
								}
								onPress={() => handleSort('client.name', data, true)}
							>
								Client
							</DataTable.Title>
							<DataTable.Title
								style={{ justifyContent: 'center' }}
								textStyle={{ fontWeight: 'bold' }}
								sortDirection={
									sortedColumn === 'quantity' ? sortDirection : undefined
								}
								onPress={() => handleSort('quantity', data, true)}
							>
								Quantity
							</DataTable.Title>
							<DataTable.Title
								style={{ justifyContent: 'center' }}
								textStyle={{ fontWeight: 'bold' }}
								sortDirection={
									sortedColumn === 'weight' ? sortDirection : undefined
								}
								onPress={() => handleSort('weight', data, true)}
							>
								Weight
							</DataTable.Title>
							<DataTable.Title
								style={{ justifyContent: 'center' }}
								textStyle={{ fontWeight: 'bold' }}
								sortDirection={
									sortedColumn === 'price' ? sortDirection : undefined
								}
								onPress={() => handleSort('price', data, true)}
							>
								Price
							</DataTable.Title>
							<DataTable.Title
								style={{
									justifyContent: 'center',
									flex: 2,
								}}
								textStyle={{ fontWeight: 'bold' }}
								sortDirection={
									sortedColumn === 'deliveryDateTime'
										? sortDirection
										: undefined
								}
								onPress={() => handleSort('deliveryDateTime', data, true)}
							>
								Delivery
							</DataTable.Title>
							<DataTable.Title
								style={{ justifyContent: 'center' }}
								textStyle={{ fontWeight: 'bold' }}
							>
								Status
							</DataTable.Title>
						</DataTable.Header>
						{data.slice(from, to).map((item) => (
							<DataTable.Row
								key={item.key}
								onLongPress={() => {
									itemStatusChange(item);
								}}
								onPress={() => {
									showItemModal(item);
								}}
							>
								<DataTable.Cell style={{ justifyContent: 'center', flex: 2 }}>
									{item.client.name}
								</DataTable.Cell>
								<DataTable.Cell style={{ justifyContent: 'center' }}>
									{item.quantity}
								</DataTable.Cell>
								<DataTable.Cell style={{ justifyContent: 'center' }}>
									{item.weight.toFixed(2)}
								</DataTable.Cell>
								<DataTable.Cell style={{ justifyContent: 'center' }}>
									{item.price.toFixed(2)}
								</DataTable.Cell>
								<DataTable.Cell style={{ justifyContent: 'center', flex: 2 }}>
									{item.deliveryDateTime.toLocaleString('pt-pt')}
								</DataTable.Cell>
								<DataTable.Cell style={{ justifyContent: 'center' }}>
									{item.status}
								</DataTable.Cell>
							</DataTable.Row>
						))}
						<DataTable.Pagination
							page={page}
							numberOfPages={Math.ceil(data.length / itemsPerPage)}
							onPageChange={(page) => setPage(page)}
							label={`${from + 1}-${to} of ${data.length}`}
							numberOfItemsPerPage={itemsPerPage}
							numberOfItemsPerPageList={numberOfItemsPerPageList}
							onItemsPerPageChange={onItemsPerPageChange}
							//showFastPaginationControls
							selectPageDropdownLabel={'Rows per page'}
						/>
					</DataTable>
				);
			}
			case 'productQuantity': {
				return (
					<DataTable>
						<DataTable.Header>
							<DataTable.Title
								style={{
									justifyContent: 'center',
								}}
								textStyle={{ fontWeight: 'bold' }}
								sortDirection={
									sortedColumn === 'name' ? sortDirection : undefined
								}
								onPress={() => handleSort('name', data, true)}
							>
								Product
							</DataTable.Title>
							<DataTable.Title
								style={{ justifyContent: 'center' }}
								textStyle={{ fontWeight: 'bold' }}
								sortDirection={
									sortedColumn === 'quantity' ? sortDirection : undefined
								}
								onPress={() => handleSort('quantity', data, true)}
							>
								Quantity
							</DataTable.Title>
							<DataTable.Title
								style={{ justifyContent: 'center' }}
								textStyle={{ fontWeight: 'bold' }}
								sortDirection={
									sortedColumn === 'weight' ? sortDirection : undefined
								}
								onPress={() => handleSort('weight', data, true)}
							>
								Weight
							</DataTable.Title>
							<DataTable.Title
								style={{ justifyContent: 'center' }}
								textStyle={{ fontWeight: 'bold' }}
								sortDirection={
									sortedColumn === 'weightTotal' ? sortDirection : undefined
								}
								onPress={() => handleSort('weightTotal', data, true)}
							>
								Total Weight
							</DataTable.Title>
							<DataTable.Title
								style={{ justifyContent: 'center' }}
								textStyle={{ fontWeight: 'bold' }}
								sortDirection={
									sortedColumn === 'status' ? sortDirection : undefined
								}
								onPress={() => handleSort('status', data, true)}
							>
								Status
							</DataTable.Title>
						</DataTable.Header>
						{data.slice(from, to).map((item) => (
							<DataTable.Row
								key={item.key}
								onPress={() => {
									showItemModal(item);
								}}
							>
								<DataTable.Cell style={{ justifyContent: 'center' }}>
									{item.name}
								</DataTable.Cell>
								<DataTable.Cell style={{ justifyContent: 'center' }}>
									{item.quantity}
								</DataTable.Cell>
								<DataTable.Cell style={{ justifyContent: 'center' }}>
									{item.weight.toFixed(2)}
								</DataTable.Cell>
								<DataTable.Cell style={{ justifyContent: 'center' }}>
									{item.weightTotal.toFixed(2)}
								</DataTable.Cell>
								<DataTable.Cell style={{ justifyContent: 'center' }}>
									{item.status}
								</DataTable.Cell>
							</DataTable.Row>
						))}
						<DataTable.Pagination
							page={page}
							numberOfPages={Math.ceil(data.length / itemsPerPage)}
							onPageChange={(page) => setPage(page)}
							label={`${from + 1}-${to} of ${data.length}`}
							numberOfItemsPerPage={itemsPerPage}
							numberOfItemsPerPageList={numberOfItemsPerPageList}
							onItemsPerPageChange={onItemsPerPageChange}
							//showFastPaginationControls
							selectPageDropdownLabel={'Rows per page'}
						/>
					</DataTable>
				);
			}
			default:
				return <Text>Default</Text>;
		}
	};

	const renderRow = (item: object) => {
		switch (props.dataType) {
			case 'newOrder': {
				//console.log(item);
				return (
					<>
						{Object.keys(item).length !== 0 ? (
							<View style={styles.itemContainer}>
								<Text style={styles.title}>Name:</Text>
								<Text style={styles.item}>{item.product.name}</Text>
								<Divider
									bold={true}
									style={{
										flexBasis: '100%',
										backgroundColor: theme.colors.outline,
									}}
								/>
								<Text style={styles.title}>Quantity:</Text>
								<Text style={styles.item}>{item.quantity}</Text>
								<Divider
									bold={true}
									style={{
										flexBasis: '100%',
										backgroundColor: theme.colors.outline,
									}}
								/>
								<Text style={styles.title}>Weight:</Text>
								<Text style={styles.item}>{item.weight.toFixed(3)} kg</Text>
								<Divider
									bold={true}
									style={{
										flexBasis: '100%',
										backgroundColor: theme.colors.outline,
									}}
								/>
								<Text style={styles.title}>Total weight:</Text>
								<Text style={styles.item}>
									{(item.weight * item.quantity).toFixed(3)} kg
								</Text>
								<Divider
									bold={true}
									style={{
										flexBasis: '100%',
										backgroundColor: theme.colors.outline,
									}}
								/>
								<Text style={styles.title}>Price:</Text>
								<Text style={styles.item}>{item.price.toFixed(2)}</Text>
								<Divider
									bold={true}
									style={{
										flexBasis: '100%',
										backgroundColor: theme.colors.outline,
									}}
								/>
								<Text style={styles.title}>Status:</Text>
								<Text style={styles.item}>{item.status}</Text>
								<Divider
									bold={true}
									style={{
										flexBasis: '100%',
										backgroundColor: theme.colors.outline,
									}}
								/>
								<Text style={styles.title}>Notes:</Text>
								<Text style={styles.item}>{item.notes}</Text>
							</View>
						) : null}
					</>
				);
			}
			case 'clientOrder': {
				//console.log(item);
				return (
					<>
						{Object.keys(item).length !== 0 ? (
							<View style={styles.itemContainer}>
								<Text style={styles.title}>Name:</Text>
								<Text style={styles.item}>{item.product.name}</Text>
								<Divider
									bold={true}
									style={{
										flexBasis: '100%',
										backgroundColor: theme.colors.outline,
									}}
								/>
								<Text style={styles.title}>Quantity:</Text>
								<Text style={styles.item}>{item.quantity}</Text>
								<Divider
									bold={true}
									style={{
										flexBasis: '100%',
										backgroundColor: theme.colors.outline,
									}}
								/>
								<Text style={styles.title}>Weight:</Text>
								<Text style={styles.item}>{item.weight.toFixed(3)} kg</Text>
								<Divider
									bold={true}
									style={{
										flexBasis: '100%',
										backgroundColor: theme.colors.outline,
									}}
								/>
								<Text style={styles.title}>Total weight:</Text>
								<Text style={styles.item}>
									{(item.weight * item.quantity).toFixed(3)} kg
								</Text>
								<Divider
									bold={true}
									style={{
										flexBasis: '100%',
										backgroundColor: theme.colors.outline,
									}}
								/>
								<Text style={styles.title}>Price:</Text>
								<Text style={styles.item}>{item.price.toFixed(2)}</Text>
								<Divider
									bold={true}
									style={{
										flexBasis: '100%',
										backgroundColor: theme.colors.outline,
									}}
								/>
								<Text style={styles.title}>Delivery Date:</Text>
								<Text style={styles.item}>
									{item.deliveryDateTime.toLocaleString('pt-pt')}
								</Text>
								<Divider
									bold={true}
									style={{
										flexBasis: '100%',
										backgroundColor: theme.colors.outline,
									}}
								/>
								<Text style={styles.title}>Status:</Text>
								<Text style={styles.item}>{item.status}</Text>
								<Divider
									bold={true}
									style={{
										flexBasis: '100%',
										backgroundColor: theme.colors.outline,
									}}
								/>
								<Text style={styles.title}>Notes:</Text>
								<Text style={styles.item}>{item.notes}</Text>
							</View>
						) : null}
					</>
				);
			}
			case 'productOrder': {
				//console.log(item);
				return (
					<>
						{Object.keys(item).length !== 0 ? (
							<View style={styles.itemContainer}>
								<Text style={styles.title}>Name:</Text>
								<Text style={styles.item}>{item.client.name}</Text>
								<Divider
									bold={true}
									style={{
										flexBasis: '100%',
										backgroundColor: theme.colors.outline,
									}}
								/>
								<Text style={styles.title}>Quantity:</Text>
								<Text style={styles.item}>{item.quantity}</Text>
								<Divider
									bold={true}
									style={{
										flexBasis: '100%',
										backgroundColor: theme.colors.outline,
									}}
								/>
								<Text style={styles.title}>Weight:</Text>
								<Text style={styles.item}>{item.weight.toFixed(3)} kg</Text>
								<Divider
									bold={true}
									style={{
										flexBasis: '100%',
										backgroundColor: theme.colors.outline,
									}}
								/>
								<Text style={styles.title}>Total weight:</Text>
								<Text style={styles.item}>
									{(item.weight * item.quantity).toFixed(3)} kg
								</Text>
								<Divider
									bold={true}
									style={{
										flexBasis: '100%',
										backgroundColor: theme.colors.outline,
									}}
								/>
								<Text style={styles.title}>Price:</Text>
								<Text style={styles.item}>{item.price.toFixed(2)}</Text>
								<Divider
									bold={true}
									style={{
										flexBasis: '100%',
										backgroundColor: theme.colors.outline,
									}}
								/>
								<Text style={styles.title}>Delivery Date:</Text>
								<Text style={styles.item}>
									{item.deliveryDateTime.toLocaleString('pt-pt')}
								</Text>
								<Divider
									bold={true}
									style={{
										flexBasis: '100%',
										backgroundColor: theme.colors.outline,
									}}
								/>
								<Text style={styles.title}>Status:</Text>
								<Text style={styles.item}>{item.status}</Text>
								<Divider
									bold={true}
									style={{
										flexBasis: '100%',
										backgroundColor: theme.colors.outline,
									}}
								/>
								<Text style={styles.title}>Notes:</Text>
								<Text style={styles.item}>{item.notes}</Text>
							</View>
						) : null}
					</>
				);
			}
			case 'productQuantity': {
				//console.log(item);
				return (
					<>
						{Object.keys(item).length !== 0 ? (
							<View style={styles.itemContainer}>
								<Text style={styles.title}>Name:</Text>
								<Text style={styles.item}>{item.name}</Text>
								<Divider
									bold={true}
									style={{
										flexBasis: '100%',
										backgroundColor: theme.colors.outline,
									}}
								/>
								<Text style={styles.title}>Quantity:</Text>
								<Text style={styles.item}>{item.quantity}</Text>
								<Divider
									bold={true}
									style={{
										flexBasis: '100%',
										backgroundColor: theme.colors.outline,
									}}
								/>
								<Text style={styles.title}>Weight:</Text>
								<Text style={styles.item}>{item.weight.toFixed(3)} kg</Text>
								<Divider
									bold={true}
									style={{
										flexBasis: '100%',
										backgroundColor: theme.colors.outline,
									}}
								/>
								<Text style={styles.title}>Total weight:</Text>
								<Text style={styles.item}>
									{item.weightTotal.toFixed(3)} kg
								</Text>
								<Divider
									bold={true}
									style={{
										flexBasis: '100%',
										backgroundColor: theme.colors.outline,
									}}
								/>
								<Text style={styles.title}>Status:</Text>
								<Text style={styles.item}>{item.status}</Text>
							</View>
						) : null}
					</>
				);
			}
			default:
				return <Text>Default</Text>;
		}
	};

	return (
		<>
			<DialogConfirmation
				text={dialogText}
				visible={dialogConfirmationVisible}
				onDismiss={onDismissDialogConfirmation}
				onConfirmation={() => {
					props.onLongPress(itemModal);
					setDialogConfirmationVisible(false);
				}}
			/>

			<Portal>
				<Modal
					visible={itemModalVisible}
					onDismiss={() => {
						setItemModalVisible(false);
					}}
					style={styles.modalContainer}
					contentContainerStyle={[
						styles.modalContentContainer,
						{
							backgroundColor: theme.colors.primaryContainer,
							borderColor: theme.colors.outline,
						},
					]}
				>
					{renderRow(itemModal)}
				</Modal>
			</Portal>
			{renderDataTable()}
		</>
	);
};

export default DataTableOrder;

const styles = StyleSheet.create({
	modalContainer: {
		marginHorizontal: 30,
		alignItems: 'center',
	},
	modalContentContainer: {
		paddingVertical: 10,
		paddingHorizontal: 15,
		borderRadius: 20,
		borderWidth: 2,
	},
	itemContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		flexWrap: 'wrap',
		maxWidth: '90%',
	},
	title: {
		textAlign: 'center',
		textAlignVertical: 'center',
		fontWeight: 'bold',
		fontSize: 18,
	},
	item: { textAlign: 'center', textAlignVertical: 'center', fontSize: 15 },
});
