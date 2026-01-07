import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import {
	DataTable,
	Divider,
	Modal,
	Portal,
	Text,
	useTheme,
} from 'react-native-paper';
import { useDialog } from '@/context/DialogContext';
import { globalStyles } from '@/styles/global';
import { isEmpty } from '@/utils/Utils';

type DataTableOrderProps = {
	data: object[];
	dataType: 'newOrder' | 'clientOrder' | 'productOrder' | 'productCount';
	defaultSort: 'product.name' | 'client.name' | 'name' | string;
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

	// All the logic to implement DialogContext
	const { showDialog, hideDialog } = useDialog();

	const [data, setData] = useState(props.data);
	/* console.log('Props');
	console.log(props.data);
	console.log('Data');
	console.log(data); */

	const from = page * itemsPerPage;
	const to = Math.min((page + 1) * itemsPerPage, data?.length);

	const [sortDirection, setSortDirection] = useState<
		'ascending' | 'descending'
	>('ascending');
	const [sortedColumn, setSortedColumn] = useState(props.defaultSort);

	const changeSortDirection = (column: DataTableOrderProps['defaultSort']) => {
		const newSortDirection =
			sortedColumn === column && sortDirection === 'ascending' ?
				'descending'
			:	'ascending';
		setSortDirection(newSortDirection);
		return newSortDirection;
	};

	const handleSort = (
		column: DataTableOrderProps['defaultSort'],
		unsortedData: object[],
		changeSort: boolean
	) => {
		let newSortDirection = sortDirection;
		if (changeSort) {
			newSortDirection = changeSortDirection(column);
			setSortedColumn(column);
		}

		//console.log(unsortedData);

		if (!unsortedData?.length) {
			setData([]);
			return;
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

	const itemDelete = (item: object) => {
		console.log(item);
		setItemModal(item);
		showDialog({
			text: t('dataTableOrder.orderUndo'),
			onConfirmation: () => {
				props.onLongPress(item);
			},
			testID: 'ItemStatusDialog',
		});
	};

	const itemStatusChange = (item: object) => {
		//console.log(item)
		setItemModal(item);
		if (item.status === 'Incomplete')
			showDialog({
				text: t('dataTableOrder.orderReady'),
				onConfirmation: () => {
					props.onLongPress(item);
				},
				testID: 'ItemStatusDialog',
			});
		else if (item.status === 'Ready')
			showDialog({
				text: t('dataTableOrder.orderDelivered'),
				onConfirmation: () => {
					props.onLongPress(item);
				},
				testID: 'ItemStatusDialog',
			});
		else if (item.status === 'Delivered')
			showDialog({
				text: t('dataTableOrder.orderDelete'),
				onConfirmation: () => {
					props.onLongPress(item);
				},
				testID: 'ItemStatusDialog',
			});
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
								textStyle={globalStyles.text.dataTable.title}
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
								textStyle={globalStyles.text.dataTable.title}
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
								textStyle={globalStyles.text.dataTable.title}
							>
								{t('dataTableOrder.weight')}
							</DataTable.Title>
							<DataTable.Title
								style={{
									justifyContent: 'center',
									flex: 2,
								}}
								textStyle={globalStyles.text.dataTable.title}
							>
								{t('dataTableOrder.weightTotal')}
							</DataTable.Title>
							<DataTable.Title
								style={{
									justifyContent: 'center',
								}}
								textStyle={globalStyles.text.dataTable.title}
							>
								{t('dataTableOrder.price')}
							</DataTable.Title>
							<DataTable.Title
								style={{
									justifyContent: 'center',
								}}
								textStyle={globalStyles.text.dataTable.title}
							>
								{t('dataTableOrder.notes')}
							</DataTable.Title>
						</DataTable.Header>

						{!data?.length ?
							<Text>Nothing to show</Text>
						:	data.slice(from, to).map((item) => (
								<DataTable.Row
									key={item.id}
									onLongPress={() => {
										itemDelete(item);
									}}
									onPress={() => {
										//console.log(item);
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
							))
						}

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
								textStyle={globalStyles.text.dataTable.title}
								sortDirection={
									sortedColumn === 'product.name' ? sortDirection : undefined
								}
								onPress={() => handleSort('product.name', data, true)}
							>
								{t('dataTableOrder.product')}
							</DataTable.Title>
							<DataTable.Title
								style={{ justifyContent: 'center' }}
								textStyle={globalStyles.text.dataTable.title}
								sortDirection={
									sortedColumn === 'quantity' ? sortDirection : undefined
								}
								onPress={() => handleSort('quantity', data, true)}
							>
								{t('dataTableOrder.quantity')}
							</DataTable.Title>
							<DataTable.Title
								style={{ justifyContent: 'center' }}
								textStyle={globalStyles.text.dataTable.title}
								sortDirection={
									sortedColumn === 'weight' ? sortDirection : undefined
								}
								onPress={() => handleSort('weight', data, true)}
							>
								{t('dataTableOrder.weight')}
							</DataTable.Title>
							<DataTable.Title
								style={{ justifyContent: 'center' }}
								textStyle={globalStyles.text.dataTable.title}
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
								textStyle={globalStyles.text.dataTable.title}
								sortDirection={
									sortedColumn === 'deliveryDateTime' ? sortDirection : (
										undefined
									)
								}
								onPress={() => handleSort('deliveryDateTime', data, true)}
							>
								{t('dataTableOrder.delivery')}
							</DataTable.Title>
							<DataTable.Title
								style={{ justifyContent: 'center' }}
								textStyle={globalStyles.text.dataTable.title}
								sortDirection={
									sortedColumn === 'status' ? sortDirection : undefined
								}
								onPress={() => handleSort('status', data, true)}
							>
								{t('dataTableOrder.status')}
							</DataTable.Title>
						</DataTable.Header>
						{data?.length ?
							data.slice(from, to).map((item) => (
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
							))
						:	<Text>Nothing to show</Text>}

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
								textStyle={globalStyles.text.dataTable.title}
								sortDirection={
									sortedColumn === 'client.name' ? sortDirection : undefined
								}
								onPress={() => handleSort('client.name', data, true)}
							>
								{t('dataTableOrder.client')}
							</DataTable.Title>
							<DataTable.Title
								style={{ justifyContent: 'center' }}
								textStyle={globalStyles.text.dataTable.title}
								sortDirection={
									sortedColumn === 'quantity' ? sortDirection : undefined
								}
								onPress={() => handleSort('quantity', data, true)}
							>
								{t('dataTableOrder.quantity')}
							</DataTable.Title>
							<DataTable.Title
								style={{ justifyContent: 'center' }}
								textStyle={globalStyles.text.dataTable.title}
								sortDirection={
									sortedColumn === 'weight' ? sortDirection : undefined
								}
								onPress={() => handleSort('weight', data, true)}
							>
								{t('dataTableOrder.weight')}
							</DataTable.Title>
							<DataTable.Title
								style={{ justifyContent: 'center' }}
								textStyle={globalStyles.text.dataTable.title}
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
								textStyle={globalStyles.text.dataTable.title}
								sortDirection={
									sortedColumn === 'deliveryDateTime' ? sortDirection : (
										undefined
									)
								}
								onPress={() => handleSort('deliveryDateTime', data, true)}
							>
								{t('dataTableOrder.delivery')}
							</DataTable.Title>
							<DataTable.Title
								style={{ justifyContent: 'center' }}
								textStyle={globalStyles.text.dataTable.title}
								sortDirection={
									sortedColumn === 'status' ? sortDirection : undefined
								}
								onPress={() => handleSort('status', data, true)}
							>
								{t('dataTableOrder.status')}
							</DataTable.Title>
						</DataTable.Header>
						{data?.length ?
							data.slice(from, to).map((item) => (
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
							))
						:	<Text>Nothing to show</Text>}

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
			case 'productCount': {
				return (
					<DataTable>
						<DataTable.Header>
							<DataTable.Title
								style={{
									justifyContent: 'center',
								}}
								textStyle={globalStyles.text.dataTable.title}
								sortDirection={
									sortedColumn === 'name' ? sortDirection : undefined
								}
								onPress={() => handleSort('name', data, true)}
							>
								{t('dataTableOrder.product')}
							</DataTable.Title>
							<DataTable.Title
								style={{ justifyContent: 'center' }}
								textStyle={globalStyles.text.dataTable.title}
								sortDirection={
									sortedColumn === 'quantity' ? sortDirection : undefined
								}
								onPress={() => handleSort('quantity', data, true)}
							>
								{t('dataTableOrder.quantity')}
							</DataTable.Title>
							<DataTable.Title
								style={{ justifyContent: 'center' }}
								textStyle={globalStyles.text.dataTable.title}
								sortDirection={
									sortedColumn === 'weight' ? sortDirection : undefined
								}
								onPress={() => handleSort('weight', data, true)}
							>
								{t('dataTableOrder.weight')}
							</DataTable.Title>
							<DataTable.Title
								style={{ justifyContent: 'center' }}
								textStyle={globalStyles.text.dataTable.title}
								sortDirection={
									sortedColumn === 'weightTotal' ? sortDirection : undefined
								}
								onPress={() => handleSort('weightTotal', data, true)}
							>
								{t('dataTableOrder.weightTotal')}
							</DataTable.Title>
							<DataTable.Title
								style={{ justifyContent: 'center' }}
								textStyle={globalStyles.text.dataTable.title}
								sortDirection={
									sortedColumn === 'status' ? sortDirection : undefined
								}
								onPress={() => handleSort('status', data, true)}
							>
								{t('dataTableOrder.status')}
							</DataTable.Title>
						</DataTable.Header>
						{data?.length ?
							data.slice(from, to).map((item) => (
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
							))
						:	<Text style={{ fontSize: 12 }}>Nothing to show</Text>}

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
		if (isEmpty(item)) return;

		switch (props.dataType) {
			case 'newOrder': {
				//console.log(item);
				return (
					<>
						{Object.keys(item).length !== 0 ?
							<View style={globalStyles.container.item}>
								<Text style={globalStyles.text.dataTable.row}>
									{t('dataTableOrder.name')}:
								</Text>
								<Text style={globalStyles.item}>{item.product.name}</Text>
								<Divider
									bold={true}
									style={{
										flexBasis: '100%',
										backgroundColor: theme.colors.outline,
									}}
								/>
								<Text style={globalStyles.text.dataTable.row}>
									{t('dataTableOrder.quantity')}:
								</Text>
								<Text style={globalStyles.item}>{item.quantity}</Text>
								<Divider
									bold={true}
									style={{
										flexBasis: '100%',
										backgroundColor: theme.colors.outline,
									}}
								/>
								<Text style={globalStyles.text.dataTable.row}>
									{t('dataTableOrder.weight')}:
								</Text>
								<Text style={globalStyles.item}>
									{item.weight.toFixed(3)} kg
								</Text>
								<Divider
									bold={true}
									style={{
										flexBasis: '100%',
										backgroundColor: theme.colors.outline,
									}}
								/>
								<Text style={globalStyles.text.dataTable.row}>
									{t('dataTableOrder.weightTotal')}:
								</Text>
								<Text style={globalStyles.item}>
									{(item.weight * item.quantity).toFixed(3)} kg
								</Text>
								<Divider
									bold={true}
									style={{
										flexBasis: '100%',
										backgroundColor: theme.colors.outline,
									}}
								/>
								<Text style={globalStyles.text.dataTable.row}>
									{t('dataTableOrder.price')}:
								</Text>
								<Text style={globalStyles.item}>{item.price.toFixed(2)}</Text>
								<Divider
									bold={true}
									style={{
										flexBasis: '100%',
										backgroundColor: theme.colors.outline,
									}}
								/>
								<Text style={globalStyles.text.dataTable.row}>
									{t('dataTableOrder.status')}:
								</Text>
								<Text style={globalStyles.item}>
									{translateStatus(item.status)}
								</Text>
								<Divider
									bold={true}
									style={{
										flexBasis: '100%',
										backgroundColor: theme.colors.outline,
									}}
								/>
								<Text style={globalStyles.text.dataTable.row}>
									{t('dataTableOrder.notes')}:
								</Text>
								<Text style={globalStyles.item}>{item.notes}</Text>
							</View>
						:	null}
					</>
				);
			}
			case 'clientOrder': {
				//console.log(item);
				return (
					<>
						{Object.keys(item).length !== 0 ?
							<View style={globalStyles.container.item}>
								<Text style={globalStyles.text.dataTable.row}>
									{t('dataTableOrder.name')}:
								</Text>
								<Text style={globalStyles.item}>{item.product.name}</Text>
								<Divider
									bold={true}
									style={{
										flexBasis: '100%',
										backgroundColor: theme.colors.outline,
									}}
								/>
								<Text style={globalStyles.text.dataTable.row}>
									{t('dataTableOrder.quantity')}:
								</Text>
								<Text style={globalStyles.item}>{item.quantity}</Text>
								<Divider
									bold={true}
									style={{
										flexBasis: '100%',
										backgroundColor: theme.colors.outline,
									}}
								/>
								<Text style={globalStyles.text.dataTable.row}>
									{t('dataTableOrder.weight')}:
								</Text>
								<Text style={globalStyles.item}>
									{item.weight.toFixed(3)} kg
								</Text>
								<Divider
									bold={true}
									style={{
										flexBasis: '100%',
										backgroundColor: theme.colors.outline,
									}}
								/>
								<Text style={globalStyles.text.dataTable.row}>
									{t('dataTableOrder.weightTotal')}:
								</Text>
								<Text style={globalStyles.item}>
									{(item.weight * item.quantity).toFixed(3)} kg
								</Text>
								<Divider
									bold={true}
									style={{
										flexBasis: '100%',
										backgroundColor: theme.colors.outline,
									}}
								/>
								<Text style={globalStyles.text.dataTable.row}>
									{t('dataTableOrder.price')}:
								</Text>
								<Text style={globalStyles.item}>{item.price.toFixed(2)}</Text>
								<Divider
									bold={true}
									style={{
										flexBasis: '100%',
										backgroundColor: theme.colors.outline,
									}}
								/>
								<Text style={globalStyles.text.dataTable.row}>
									{t('dataTableOrder.deliveryDate')}:
								</Text>
								<Text style={globalStyles.item}>
									{item.deliveryDateTime.toLocaleString('pt-pt')}
								</Text>
								<Divider
									bold={true}
									style={{
										flexBasis: '100%',
										backgroundColor: theme.colors.outline,
									}}
								/>
								<Text style={globalStyles.text.dataTable.row}>
									{t('dataTableOrder.status')}:
								</Text>
								<Text style={globalStyles.item}>
									{translateStatus(item.status)}
								</Text>
								<Divider
									bold={true}
									style={{
										flexBasis: '100%',
										backgroundColor: theme.colors.outline,
									}}
								/>
								<Text style={globalStyles.text.dataTable.row}>
									{t('dataTableOrder.notes')}:
								</Text>
								<Text style={globalStyles.item}>{item.notes}</Text>
							</View>
						:	null}
					</>
				);
			}
			case 'productOrder': {
				//console.log(item);
				return (
					<>
						{Object.keys(item).length !== 0 ?
							<View style={globalStyles.container.item}>
								<Text style={globalStyles.text.dataTable.row}>
									{t('dataTableOrder.name')}:
								</Text>
								<Text style={globalStyles.item}>{item.client.name}</Text>
								<Divider
									bold={true}
									style={{
										flexBasis: '100%',
										backgroundColor: theme.colors.outline,
									}}
								/>
								<Text style={globalStyles.text.dataTable.row}>
									{t('dataTableOrder.quantity')}:
								</Text>
								<Text style={globalStyles.item}>{item.quantity}</Text>
								<Divider
									bold={true}
									style={{
										flexBasis: '100%',
										backgroundColor: theme.colors.outline,
									}}
								/>
								<Text style={globalStyles.text.dataTable.row}>
									{t('dataTableOrder.weight')}:
								</Text>
								<Text style={globalStyles.item}>
									{item.weight.toFixed(3)} kg
								</Text>
								<Divider
									bold={true}
									style={{
										flexBasis: '100%',
										backgroundColor: theme.colors.outline,
									}}
								/>
								<Text style={globalStyles.text.dataTable.row}>
									{t('dataTableOrder.weightTotal')}:
								</Text>
								<Text style={globalStyles.item}>
									{(item.weight * item.quantity).toFixed(3)} kg
								</Text>
								<Divider
									bold={true}
									style={{
										flexBasis: '100%',
										backgroundColor: theme.colors.outline,
									}}
								/>
								<Text style={globalStyles.text.dataTable.row}>
									{t('dataTableOrder.price')}:
								</Text>
								<Text style={globalStyles.item}>{item.price.toFixed(2)}</Text>
								<Divider
									bold={true}
									style={{
										flexBasis: '100%',
										backgroundColor: theme.colors.outline,
									}}
								/>
								<Text style={globalStyles.text.dataTable.row}>
									{t('dataTableOrder.deliveryDate')}:
								</Text>
								<Text style={globalStyles.item}>
									{item.deliveryDateTime.toLocaleString('pt-pt')}
								</Text>
								<Divider
									bold={true}
									style={{
										flexBasis: '100%',
										backgroundColor: theme.colors.outline,
									}}
								/>
								<Text style={globalStyles.text.dataTable.row}>
									{t('dataTableOrder.status')}:
								</Text>
								<Text style={globalStyles.item}>
									{translateStatus(item.status)}
								</Text>
								<Divider
									bold={true}
									style={{
										flexBasis: '100%',
										backgroundColor: theme.colors.outline,
									}}
								/>
								<Text style={globalStyles.text.dataTable.row}>
									{t('dataTableOrder.notes')}:
								</Text>
								<Text style={globalStyles.item}>{item.notes}</Text>
							</View>
						:	null}
					</>
				);
			}
			case 'productCount': {
				//console.log(item);
				return (
					<>
						{Object.keys(item).length !== 0 ?
							<View style={globalStyles.container.item}>
								<Text style={globalStyles.text.dataTable.row}>
									{t('dataTableOrder.name')}:
								</Text>
								<Text style={globalStyles.item}>{item.name}</Text>
								<Divider
									bold={true}
									style={{
										flexBasis: '100%',
										backgroundColor: theme.colors.outline,
									}}
								/>
								<Text style={globalStyles.text.dataTable.row}>
									{t('dataTableOrder.quantity')}:
								</Text>
								<Text style={globalStyles.item}>{item.quantity}</Text>
								<Divider
									bold={true}
									style={{
										flexBasis: '100%',
										backgroundColor: theme.colors.outline,
									}}
								/>
								<Text style={globalStyles.text.dataTable.row}>
									{t('dataTableOrder.weight')}:
								</Text>
								<Text style={globalStyles.item}>
									{item.weight.toFixed(3)} kg
								</Text>
								<Divider
									bold={true}
									style={{
										flexBasis: '100%',
										backgroundColor: theme.colors.outline,
									}}
								/>
								<Text style={globalStyles.text.dataTable.row}>
									{t('dataTableOrder.weightTotal')}:
								</Text>
								<Text style={globalStyles.item}>
									{item.weightTotal.toFixed(3)} kg
								</Text>
								<Divider
									bold={true}
									style={{
										flexBasis: '100%',
										backgroundColor: theme.colors.outline,
									}}
								/>
								<Text style={globalStyles.text.dataTable.row}>
									{t('dataTableOrder.status')}:
								</Text>
								<Text style={globalStyles.item}>
									{translateStatus(item.status)}
								</Text>
							</View>
						:	null}
					</>
				);
			}
			default:
				return <Text>Default</Text>;
		}
	};

	return (
		<>
			<Portal>
				<Modal
					visible={itemModalVisible}
					onDismiss={() => {
						setItemModalVisible(false);
						//setItemModal([]);
					}}
					style={globalStyles.modalContainer.dataTable}
					contentContainerStyle={[
						globalStyles.modalContentContainer.dataTable,
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
