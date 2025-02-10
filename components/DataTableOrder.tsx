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
		if (item.status === 'Incomplete')
			setDialogText(t('dataTableOrder.orderReady'));
		else if (item.status === 'Ready')
			setDialogText(t('dataTableOrder.orderDelivered'));
		else if (item.status === 'Delivered')
			setDialogText(t('dataTableOrder.orderDelete'));
		setDialogConfirmationVisible(true);
	};

	const translateStatus = (orderStatus: string) => {
		switch (orderStatus) {
			case 'Incomplete':
				return t('dataTableOrder.incomplete');
			case 'Ready':
				return t('dataTableOrder.ready');
			case 'Delivered':
				return t('dataTableOrder.delivered');
			default:
				return orderStatus;
		}
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
								{t('dataTableOrder.product')}
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
								{t('dataTableOrder.quantity')}
							</DataTable.Title>
							<DataTable.Title
								style={{
									justifyContent: 'center',
								}}
								textStyle={{ fontWeight: 'bold' }}
							>
								{t('dataTableOrder.weight')}
							</DataTable.Title>
							<DataTable.Title
								style={{
									justifyContent: 'center',
									flex: 2,
								}}
								textStyle={{ fontWeight: 'bold' }}
							>
								{t('dataTableOrder.weightTotal')}
							</DataTable.Title>
							<DataTable.Title
								style={{
									justifyContent: 'center',
								}}
								textStyle={{ fontWeight: 'bold' }}
							>
								{t('dataTableOrder.price')}
							</DataTable.Title>
							<DataTable.Title
								style={{
									justifyContent: 'center',
								}}
								textStyle={{ fontWeight: 'bold' }}
							>
								{t('dataTableOrder.notes')}
							</DataTable.Title>
						</DataTable.Header>

						{data.slice(from, to).map((item) => (
							<DataTable.Row
								key={item.id}
								onLongPress={() => {
									itemStatusChange(item);
								}}
								onPress={() => {
									console.log(item);
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
							label={`${from + 1}-${to} ${t('dataTableOrder.of')} ${
								data.length
							}`}
							numberOfItemsPerPage={itemsPerPage}
							numberOfItemsPerPageList={numberOfItemsPerPageList}
							onItemsPerPageChange={onItemsPerPageChange}
							//showFastPaginationControls
							selectPageDropdownLabel={t('dataTableOrder.rowsPerPage')}
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
								{t('dataTableOrder.product')}
							</DataTable.Title>
							<DataTable.Title
								style={{ justifyContent: 'center' }}
								textStyle={{ fontWeight: 'bold' }}
								sortDirection={
									sortedColumn === 'quantity' ? sortDirection : undefined
								}
								onPress={() => handleSort('quantity', data, true)}
							>
								{t('dataTableOrder.quantity')}
							</DataTable.Title>
							<DataTable.Title
								style={{ justifyContent: 'center' }}
								textStyle={{ fontWeight: 'bold' }}
								sortDirection={
									sortedColumn === 'weight' ? sortDirection : undefined
								}
								onPress={() => handleSort('weight', data, true)}
							>
								{t('dataTableOrder.weight')}
							</DataTable.Title>
							<DataTable.Title
								style={{ justifyContent: 'center' }}
								textStyle={{ fontWeight: 'bold' }}
								sortDirection={
									sortedColumn === 'price' ? sortDirection : undefined
								}
								onPress={() => handleSort('price', data, true)}
							>
								{t('dataTableOrder.price')}
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
								{t('dataTableOrder.delivery')}
							</DataTable.Title>
							<DataTable.Title
								style={{ justifyContent: 'center' }}
								textStyle={{ fontWeight: 'bold' }}
							>
								{t('dataTableOrder.status')}
							</DataTable.Title>
						</DataTable.Header>
						{data.slice(from, to).map((item) => (
							<DataTable.Row
								key={item.id}
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
									{translateStatus(item.status)}
								</DataTable.Cell>
							</DataTable.Row>
						))}
						<DataTable.Pagination
							page={page}
							numberOfPages={Math.ceil(data.length / itemsPerPage)}
							onPageChange={(page) => setPage(page)}
							label={`${from + 1}-${to} ${t('dataTableOrder.of')} ${
								data.length
							}`}
							numberOfItemsPerPage={itemsPerPage}
							numberOfItemsPerPageList={numberOfItemsPerPageList}
							onItemsPerPageChange={onItemsPerPageChange}
							//showFastPaginationControls
							selectPageDropdownLabel={t('dataTableOrder.rowsPerPage')}
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
								{t('dataTableOrder.client')}
							</DataTable.Title>
							<DataTable.Title
								style={{ justifyContent: 'center' }}
								textStyle={{ fontWeight: 'bold' }}
								sortDirection={
									sortedColumn === 'quantity' ? sortDirection : undefined
								}
								onPress={() => handleSort('quantity', data, true)}
							>
								{t('dataTableOrder.quantity')}
							</DataTable.Title>
							<DataTable.Title
								style={{ justifyContent: 'center' }}
								textStyle={{ fontWeight: 'bold' }}
								sortDirection={
									sortedColumn === 'weight' ? sortDirection : undefined
								}
								onPress={() => handleSort('weight', data, true)}
							>
								{t('dataTableOrder.weight')}
							</DataTable.Title>
							<DataTable.Title
								style={{ justifyContent: 'center' }}
								textStyle={{ fontWeight: 'bold' }}
								sortDirection={
									sortedColumn === 'price' ? sortDirection : undefined
								}
								onPress={() => handleSort('price', data, true)}
							>
								{t('dataTableOrder.price')}
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
								{t('dataTableOrder.delivery')}
							</DataTable.Title>
							<DataTable.Title
								style={{ justifyContent: 'center' }}
								textStyle={{ fontWeight: 'bold' }}
							>
								{t('dataTableOrder.status')}
							</DataTable.Title>
						</DataTable.Header>
						{data.slice(from, to).map((item) => (
							<DataTable.Row
								key={item.id}
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
									{translateStatus(item.status)}
								</DataTable.Cell>
							</DataTable.Row>
						))}
						<DataTable.Pagination
							page={page}
							numberOfPages={Math.ceil(data.length / itemsPerPage)}
							onPageChange={(page) => setPage(page)}
							label={`${from + 1}-${to} ${t('dataTableOrder.of')} ${
								data.length
							}`}
							numberOfItemsPerPage={itemsPerPage}
							numberOfItemsPerPageList={numberOfItemsPerPageList}
							onItemsPerPageChange={onItemsPerPageChange}
							//showFastPaginationControls
							selectPageDropdownLabel={t('dataTableOrder.rowsPerPage')}
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
								{t('dataTableOrder.product')}
							</DataTable.Title>
							<DataTable.Title
								style={{ justifyContent: 'center' }}
								textStyle={{ fontWeight: 'bold' }}
								sortDirection={
									sortedColumn === 'quantity' ? sortDirection : undefined
								}
								onPress={() => handleSort('quantity', data, true)}
							>
								{t('dataTableOrder.quantity')}
							</DataTable.Title>
							<DataTable.Title
								style={{ justifyContent: 'center' }}
								textStyle={{ fontWeight: 'bold' }}
								sortDirection={
									sortedColumn === 'weight' ? sortDirection : undefined
								}
								onPress={() => handleSort('weight', data, true)}
							>
								{t('dataTableOrder.weight')}
							</DataTable.Title>
							<DataTable.Title
								style={{ justifyContent: 'center' }}
								textStyle={{ fontWeight: 'bold' }}
								sortDirection={
									sortedColumn === 'weightTotal' ? sortDirection : undefined
								}
								onPress={() => handleSort('weightTotal', data, true)}
							>
								{t('dataTableOrder.weightTotal')}
							</DataTable.Title>
							<DataTable.Title
								style={{ justifyContent: 'center' }}
								textStyle={{ fontWeight: 'bold' }}
								sortDirection={
									sortedColumn === 'status' ? sortDirection : undefined
								}
								onPress={() => handleSort('status', data, true)}
							>
								{t('dataTableOrder.status')}
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
									{translateStatus(item.status)}
								</DataTable.Cell>
							</DataTable.Row>
						))}
						<DataTable.Pagination
							page={page}
							numberOfPages={Math.ceil(data.length / itemsPerPage)}
							onPageChange={(page) => setPage(page)}
							label={`${from + 1}-${to} ${t('dataTableOrder.of')} ${
								data.length
							}`}
							numberOfItemsPerPage={itemsPerPage}
							numberOfItemsPerPageList={numberOfItemsPerPageList}
							onItemsPerPageChange={onItemsPerPageChange}
							//showFastPaginationControls
							selectPageDropdownLabel={t('dataTableOrder.rowsPerPage')}
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
								<Text style={styles.title}>{t('dataTableOrder.name')}:</Text>
								<Text style={styles.item}>{item.product.name}</Text>
								<Divider
									bold={true}
									style={{
										flexBasis: '100%',
										backgroundColor: theme.colors.outline,
									}}
								/>
								<Text style={styles.title}>
									{t('dataTableOrder.quantity')}:
								</Text>
								<Text style={styles.item}>{item.quantity}</Text>
								<Divider
									bold={true}
									style={{
										flexBasis: '100%',
										backgroundColor: theme.colors.outline,
									}}
								/>
								<Text style={styles.title}>{t('dataTableOrder.weight')}:</Text>
								<Text style={styles.item}>{item.weight.toFixed(3)} kg</Text>
								<Divider
									bold={true}
									style={{
										flexBasis: '100%',
										backgroundColor: theme.colors.outline,
									}}
								/>
								<Text style={styles.title}>
									{t('dataTableOrder.weightTotal')}:
								</Text>
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
								<Text style={styles.title}>{t('dataTableOrder.price')}:</Text>
								<Text style={styles.item}>{item.price.toFixed(2)}</Text>
								<Divider
									bold={true}
									style={{
										flexBasis: '100%',
										backgroundColor: theme.colors.outline,
									}}
								/>
								<Text style={styles.title}>{t('dataTableOrder.status')}:</Text>
								<Text style={styles.item}>{translateStatus(item.status)}</Text>
								<Divider
									bold={true}
									style={{
										flexBasis: '100%',
										backgroundColor: theme.colors.outline,
									}}
								/>
								<Text style={styles.title}>{t('dataTableOrder.notes')}:</Text>
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
								<Text style={styles.title}>{t('dataTableOrder.name')}:</Text>
								<Text style={styles.item}>{item.product.name}</Text>
								<Divider
									bold={true}
									style={{
										flexBasis: '100%',
										backgroundColor: theme.colors.outline,
									}}
								/>
								<Text style={styles.title}>
									{t('dataTableOrder.quantity')}:
								</Text>
								<Text style={styles.item}>{item.quantity}</Text>
								<Divider
									bold={true}
									style={{
										flexBasis: '100%',
										backgroundColor: theme.colors.outline,
									}}
								/>
								<Text style={styles.title}>{t('dataTableOrder.weight')}:</Text>
								<Text style={styles.item}>{item.weight.toFixed(3)} kg</Text>
								<Divider
									bold={true}
									style={{
										flexBasis: '100%',
										backgroundColor: theme.colors.outline,
									}}
								/>
								<Text style={styles.title}>
									{t('dataTableOrder.weightTotal')}:
								</Text>
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
								<Text style={styles.title}>{t('dataTableOrder.price')}:</Text>
								<Text style={styles.item}>{item.price.toFixed(2)}</Text>
								<Divider
									bold={true}
									style={{
										flexBasis: '100%',
										backgroundColor: theme.colors.outline,
									}}
								/>
								<Text style={styles.title}>
									{t('dataTableOrder.deliveryDate')}:
								</Text>
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
								<Text style={styles.title}>{t('dataTableOrder.status')}:</Text>
								<Text style={styles.item}>{translateStatus(item.status)}</Text>
								<Divider
									bold={true}
									style={{
										flexBasis: '100%',
										backgroundColor: theme.colors.outline,
									}}
								/>
								<Text style={styles.title}>{t('dataTableOrder.notes')}:</Text>
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
								<Text style={styles.title}>{t('dataTableOrder.name')}:</Text>
								<Text style={styles.item}>{item.client.name}</Text>
								<Divider
									bold={true}
									style={{
										flexBasis: '100%',
										backgroundColor: theme.colors.outline,
									}}
								/>
								<Text style={styles.title}>
									{t('dataTableOrder.quantity')}:
								</Text>
								<Text style={styles.item}>{item.quantity}</Text>
								<Divider
									bold={true}
									style={{
										flexBasis: '100%',
										backgroundColor: theme.colors.outline,
									}}
								/>
								<Text style={styles.title}>{t('dataTableOrder.weight')}:</Text>
								<Text style={styles.item}>{item.weight.toFixed(3)} kg</Text>
								<Divider
									bold={true}
									style={{
										flexBasis: '100%',
										backgroundColor: theme.colors.outline,
									}}
								/>
								<Text style={styles.title}>
									{t('dataTableOrder.weightTotal')}:
								</Text>
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
								<Text style={styles.title}>{t('dataTableOrder.price')}:</Text>
								<Text style={styles.item}>{item.price.toFixed(2)}</Text>
								<Divider
									bold={true}
									style={{
										flexBasis: '100%',
										backgroundColor: theme.colors.outline,
									}}
								/>
								<Text style={styles.title}>
									{t('dataTableOrder.deliveryDate')}:
								</Text>
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
								<Text style={styles.title}>{t('dataTableOrder.status')}:</Text>
								<Text style={styles.item}>{translateStatus(item.status)}</Text>
								<Divider
									bold={true}
									style={{
										flexBasis: '100%',
										backgroundColor: theme.colors.outline,
									}}
								/>
								<Text style={styles.title}>{t('dataTableOrder.notes')}:</Text>
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
								<Text style={styles.title}>{t('dataTableOrder.name')}:</Text>
								<Text style={styles.item}>{item.name}</Text>
								<Divider
									bold={true}
									style={{
										flexBasis: '100%',
										backgroundColor: theme.colors.outline,
									}}
								/>
								<Text style={styles.title}>
									{t('dataTableOrder.quantity')}:
								</Text>
								<Text style={styles.item}>{item.quantity}</Text>
								<Divider
									bold={true}
									style={{
										flexBasis: '100%',
										backgroundColor: theme.colors.outline,
									}}
								/>
								<Text style={styles.title}>{t('dataTableOrder.weight')}:</Text>
								<Text style={styles.item}>{item.weight.toFixed(3)} kg</Text>
								<Divider
									bold={true}
									style={{
										flexBasis: '100%',
										backgroundColor: theme.colors.outline,
									}}
								/>
								<Text style={styles.title}>
									{t('dataTableOrder.weightTotal')}:
								</Text>
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
								<Text style={styles.title}>{t('dataTableOrder.status')}:</Text>
								<Text style={styles.item}>{translateStatus(item.status)}</Text>
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
