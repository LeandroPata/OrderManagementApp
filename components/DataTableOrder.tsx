import React, { useEffect, useState } from 'react';
import { DataTable, Text } from 'react-native-paper';

type DataTableOrderProps = {
  data: ArrayLike<any> | null | undefined;
  dataType: 'order' | 'other';
};

const DataTableOrder = (props: DataTableOrderProps) => {
  const [page, setPage] = useState<number>(0);
  const [numberOfItemsPerPageList] = useState([2, 3, 4]);
  const [itemsPerPage, onItemsPerPageChange] = useState(
    numberOfItemsPerPageList[0]
  );

  const [data, setData] = useState(props.data);

  const from = page * itemsPerPage;
  const to = Math.min((page + 1) * itemsPerPage, data.length);

  useEffect(() => {
    setPage(0);
  }, [itemsPerPage]);

  const renderDataTable = () => {
    switch (props.dataType) {
      case 'order':
        return (
          <DataTable>
            <DataTable.Header>
              <DataTable.Title textStyle={{ fontWeight: 'bold' }}>
                Product
              </DataTable.Title>
              <DataTable.Title textStyle={{ fontWeight: 'bold' }}>
                Quantity
              </DataTable.Title>
              <DataTable.Title textStyle={{ fontWeight: 'bold' }}>
                Weight(kg)
              </DataTable.Title>
              <DataTable.Title textStyle={{ fontWeight: 'bold' }}>
                Price
              </DataTable.Title>
              <DataTable.Title textStyle={{ fontWeight: 'bold' }}>
                Notes
              </DataTable.Title>
            </DataTable.Header>
            {data.slice(from, to).map((item) => (
              <DataTable.Row key={item.key}>
                <DataTable.Cell>{item.product.name}</DataTable.Cell>
                <DataTable.Cell>{item.quantity}</DataTable.Cell>
                <DataTable.Cell>{item.weight.toFixed(3)}</DataTable.Cell>
                <DataTable.Cell>{item.price.toFixed(2)}</DataTable.Cell>
                <DataTable.Cell>{item.notes}</DataTable.Cell>
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
      case 'other':
        return <Text>Goodbye</Text>;
      default:
        return <Text>Default</Text>;
    }
  };

  return <>{renderDataTable()}</>;
};

export default DataTableOrder;
