import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';
import { DataTable, Modal, Portal, Text, useTheme } from 'react-native-paper';

type DataTableOrderProps = {
	data: ArrayLike<any> | null | undefined;
	dataType: 'newOrder' | 'clientOrder' | 'productOrder' | 'productQuantity';
	defaultSort: 'product.name' | 'client.name' | 'name';
	numberofItemsPerPageList: Array<number>;
};

const DataTableOrder = (props: DataTableOrderProps) => {
	const theme = useTheme();
	const { t } = useTranslation();

	const [page, setPage] = useState<number>(0);
	const [numberOfItemsPerPageList] = useState(props.numberofItemsPerPageList);

	const [itemModal, setItemModal] = useState('');
	const [itemModalVisible, setItemModalVisible] = useState(false);

	const [itemsPerPage, onItemsPerPageChange] = useState(
		numberOfItemsPerPageList[0]
	);

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
	}, [props.data]);

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
							<DataTable.Row key={item.key}>
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
								Note
							</DataTable.Title>
						</DataTable.Header>
						{data.slice(from, to).map((item) => (
							<DataTable.Row key={item.key}>
								<DataTable.Cell
									style={{ justifyContent: 'center', flex: 2 }}
									onPress={() => {
										setItemModal(item.product.name);
										setItemModalVisible(true);
									}}
								>
									{item.product.name}
								</DataTable.Cell>
								<DataTable.Cell
									style={{ justifyContent: 'center' }}
									onPress={() => {
										setItemModal(item.quantity);
										setItemModalVisible(true);
									}}
								>
									{item.quantity}
								</DataTable.Cell>
								<DataTable.Cell
									style={{ justifyContent: 'center' }}
									onPress={() => {
										setItemModal(item.weight.toFixed(2));
										setItemModalVisible(true);
									}}
								>
									{item.weight.toFixed(2)}
								</DataTable.Cell>
								<DataTable.Cell
									style={{ justifyContent: 'center' }}
									onPress={() => {
										setItemModal(item.price.toFixed(2));
										setItemModalVisible(true);
									}}
								>
									{item.price.toFixed(2)}
								</DataTable.Cell>
								<DataTable.Cell
									style={{ justifyContent: 'center', flex: 2 }}
									onPress={() => {
										setItemModalVisible(true);
										setItemModal(item.deliveryDateTime.toLocaleString('pt-pt'));
									}}
								>
									{item.deliveryDateTime.toLocaleString('pt-pt')}
								</DataTable.Cell>
								<DataTable.Cell
									style={{ justifyContent: 'center' }}
									onPress={() => {
										setItemModalVisible(true);
										setItemModal(item.notes);
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
								Note
							</DataTable.Title>
						</DataTable.Header>
						{data.slice(from, to).map((item) => (
							<DataTable.Row key={item.key}>
								<DataTable.Cell
									style={{ justifyContent: 'center', flex: 2 }}
									onPress={() => {
										setItemModal(item.client.name);
										setItemModalVisible(true);
									}}
								>
									{item.client.name}
								</DataTable.Cell>
								<DataTable.Cell
									style={{ justifyContent: 'center' }}
									onPress={() => {
										setItemModal(item.quantity);
										setItemModalVisible(true);
									}}
								>
									{item.quantity}
								</DataTable.Cell>
								<DataTable.Cell
									style={{ justifyContent: 'center' }}
									onPress={() => {
										setItemModal(item.weight.toFixed(2));
										setItemModalVisible(true);
									}}
								>
									{item.weight.toFixed(2)}
								</DataTable.Cell>
								<DataTable.Cell
									style={{ justifyContent: 'center' }}
									onPress={() => {
										setItemModal(item.price.toFixed(2));
										setItemModalVisible(true);
									}}
								>
									{item.price.toFixed(2)}
								</DataTable.Cell>
								<DataTable.Cell
									style={{ justifyContent: 'center', flex: 2 }}
									onPress={() => {
										setItemModalVisible(true);
										setItemModal(item.deliveryDateTime.toLocaleString('pt-pt'));
									}}
								>
									{item.deliveryDateTime.toLocaleString('pt-pt')}
								</DataTable.Cell>
								<DataTable.Cell
									style={{ justifyContent: 'center' }}
									onPress={() => {
										setItemModalVisible(true);
										setItemModal(item.notes);
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
						</DataTable.Header>
						{data.slice(from, to).map((item) => (
							<DataTable.Row key={item.key}>
								<DataTable.Cell
									style={{ justifyContent: 'center' }}
									onPress={() => {
										setItemModal(item.name);
										setItemModalVisible(true);
									}}
								>
									{item.name}
								</DataTable.Cell>
								<DataTable.Cell
									style={{ justifyContent: 'center' }}
									onPress={() => {
										setItemModal(item.quantity);
										setItemModalVisible(true);
									}}
								>
									{item.quantity}
								</DataTable.Cell>
								<DataTable.Cell
									style={{ justifyContent: 'center' }}
									onPress={() => {
										setItemModal(item.weight.toFixed(2));
										setItemModalVisible(true);
									}}
								>
									{item.weight.toFixed(2)}
								</DataTable.Cell>
								<DataTable.Cell
									style={{ justifyContent: 'center' }}
									onPress={() => {
										setItemModal(item.weightTotal.toFixed(2));
										setItemModalVisible(true);
									}}
								>
									{item.weightTotal.toFixed(2)}
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

	return (
		<>
			<Portal>
				<Modal
					visible={itemModalVisible}
					onDismiss={() => {
						setItemModalVisible(false);
					}}
					style={styles.modalContainer}
					contentContainerStyle={[
						styles.modalContentContainer,
						{ backgroundColor: theme.colors.primaryContainer },
					]}
				>
					<Text>{itemModal}</Text>
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
	},
});
