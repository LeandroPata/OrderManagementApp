import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Keyboard } from 'react-native';
import {
  Button,
  Divider,
  TouchableRipple,
  Text,
  TextInput,
  useTheme,
  DataTable,
} from 'react-native-paper';
import { FirebaseError } from 'firebase/app';
import firestore, { Timestamp } from '@react-native-firebase/firestore';
import { useTranslation } from 'react-i18next';
import SnackbarInfo from '@/components/SnackbarInfo';
import { useFocusEffect } from 'expo-router';
import SearchList from '@/components/SearchList';
import Fuse from 'fuse.js';

export default function AddOrder() {
  const theme = useTheme();
  const { t } = useTranslation();

  const [loading, setLoading] = useState(false);

  const [clientList, setClientList] = useState([]);
  const [hintClientList, setHintClientList] = useState([]);
  const [productList, setProductList] = useState([]);
  const [hintProductList, setHintProductList] = useState([]);

  const [name, setName] = useState('');
  const [productName, setProductName] = useState('');
  const [productQuantity, setProductQuantity] = useState('1');
  const [productWeight, setProductWeight] = useState('0.000');
  const [notes, setNotes] = useState('');

  const [client, setClient] = useState([]);
  const [product, setProduct] = useState([]);
  const [productOrderKey, setProductOrderKey] = useState<number>(1);
  const [order, setOrder] = useState([]);

  // All the logic to implement the snackbar
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarText, setSnackbarText] = useState('');

  const showSnackbar = (text: string) => {
    setSnackbarText(text);
    setSnackbarVisible(true);
  };
  const onDismissSnackbar = () => setSnackbarVisible(false);

  // DataTable logic
  const [page, setPage] = useState<number>(0);
  const [numberOfItemsPerPageList] = useState([2, 3, 4]);
  const [itemsPerPage, onItemsPerPageChange] = useState(
    numberOfItemsPerPageList[0]
  );
  const from = page * itemsPerPage;
  const to = Math.min((page + 1) * itemsPerPage, order.length);

  useEffect(() => {
    setPage(0);
  }, [itemsPerPage]);

  useEffect(() => {
    setProductOrderKey(1);
  }, [client]);

  useFocusEffect(
    useCallback(() => {
      // Screen focused
      //console.log("Hello, I'm focused!");
      getClientList();
      getProductList();

      // Screen unfocused in return
      return () => {
        //console.log('This route is now unfocused.');
        //setProfile(null);
      };
    }, [])
  );

  const getClientList = async () => {
    await firestore()
      .collection('clients')
      .orderBy('name', 'asc')
      .get()
      .then((querySnapshot) => {
        const clientsName = [];
        querySnapshot.forEach((doc) => {
          clientsName.push({ key: doc.id, name: doc.data().name });
        });
        //console.log(clientsName);
        setClientList(clientsName);
      })
      .catch((e: any) => {
        const err = e as FirebaseError;
        console.log('Error getting client list: ' + err.message);
      });
  };

  const getProductList = async () => {
    await firestore()
      .collection('products')
      .orderBy('name', 'asc')
      .get()
      .then((querySnapshot) => {
        const productsName = [];
        querySnapshot.forEach((doc) => {
          productsName.push({
            key: doc.id,
            name: doc.data().name,
            price: Number(doc.data().price),
          });
        });
        //console.log(productsName);
        setProductList(productsName);
      })
      .catch((e: any) => {
        const err = e as FirebaseError;
        console.log('Error getting product list: ' + err.message);
      });
  };

  const filterClientList = async (input: string) => {
    const fuseOptions = {
      includeScore: true,
      keys: ['name'],
      minMatchCharLength: 2,
      threshold: 0.3,
      limit: 5,
    };
    const fuse = new Fuse(clientList, fuseOptions);

    const results = fuse.search(input);
    setHintClientList(results);
    //console.log(results);
  };

  const filterProductList = async (input: string) => {
    const fuseOptions = {
      includeScore: true,
      keys: ['name'],
      minMatchCharLength: 2,
      threshold: 0.3,
      limit: 5,
    };
    const fuse = new Fuse(productList, fuseOptions);

    const results = fuse.search(input);
    setHintProductList(results);
    //console.log(results);
  };

  const checkClient = () => {
    let clientExists = false;
    clientList.forEach((client) => {
      //console.log(client.name + ' : ' + name + ' : ' + (client.name == name));
      if (client.name == name) clientExists = true;
    });

    //console.log(clientExists);
    return clientExists;
  };

  const getClient = (clientName: string) => {
    if (client.length) return;
    const currentClient = [];
    clientList.forEach((doc) => {
      if (doc.name == clientName.trim()) {
        currentClient.push({ key: doc.key, name: doc.name });
      }
    });
    if (currentClient.length == 1) setClient(currentClient);
    return currentClient;
  };

  const getProduct = (productName: string) => {
    if (product.length) return;
    const currentProduct = [];
    productList.forEach((doc) => {
      if (doc.name == productName.trim()) {
        currentProduct.push({ key: doc.key, name: doc.name, price: doc.price });
      }
    });
    if (currentProduct.length == 1) setProduct(currentProduct);
    return currentProduct;
  };

  const addToOrder = () => {
    Keyboard.dismiss();

    if (!client.length) {
      const currentClient = getClient(name);
      console.log(!currentClient);
      if (!currentClient?.length) {
        console.log('No client error');
        return;
      }
    } else if (!product.length) {
      const currentProduct = getProduct(productName);
      if (!currentProduct?.length) {
        console.log('No product error');
        return;
      }
    }
    //console.log(client);
    //console.log(product);

    const newOrder = order;
    newOrder.push({
      key: productOrderKey,
      product: product[0],
      quantity: Number(productQuantity),
      weight: Number(parseFloat(productWeight).toFixed(3)),
      notes: notes,
    });
    //console.log(newOrder);
    setOrder(newOrder);
    setProductOrderKey(productOrderKey + 1);
    setProductName('');
    setProductQuantity('1');
    setProductWeight('0.000');
    setNotes('');
    setProduct([]);
  };

  const createOrder = async () => {
    setLoading(true);
    Keyboard.dismiss();

    if (!name.trim() || !client.length || !Boolean(await checkClient())) {
      showSnackbar(t('add.order.clientNameError'));
      //setNameError(true);
      setLoading(false);
      return;
    } else if (!order.length) {
      console.log('Order empty');
      return;
    }

    const fullOrder = [];
    fullOrder.push({ client: client, order: order });
    console.log(fullOrder[0]);

    const docRef = firestore().collection('orders').doc();

    try {
      docRef
        .set({
          client: client,
          order: order,
        })
        .then(() => {
          console.log('Added');
          showSnackbar(t('add.order.added'));
          setName('');
          setClient([]);
          setHintClientList([]);
          setProductName('');
          setProduct([]);
          setHintProductList([]);
          setProductQuantity('1');
          setProductWeight('0.000');
          setOrder([]);
        });
    } catch (e: any) {
      const err = e as FirebaseError;
      console.log('Adding member failed: ' + err.message);
      //showSnackbar('Adding member failed: ' + err.message);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const renderClientHint = ({ item }) => {
    //console.log(item.item.name + ' : ' + item.score);
    return (
      <>
        <Divider bold={true} />
        <TouchableRipple
          onPress={() => {
            Keyboard.dismiss();
            const currentClient = [];
            currentClient.push({ key: item.item.key, name: item.item.name });
            setName(item.item.name);
            setClient(currentClient);
            setHintClientList([]);
          }}
        >
          <Text style={{ padding: 5 }}>{item.item.name}</Text>
        </TouchableRipple>
        <Divider bold={true} />
      </>
    );
  };

  const renderProductHint = ({ item }) => {
    //console.log(item.item.name + ' : ' + item.score);
    return (
      <>
        <Divider bold={true} />
        <TouchableRipple
          onPress={() => {
            Keyboard.dismiss();
            const currentProduct = [];
            currentProduct.push({
              key: item.item.key,
              name: item.item.name,
              price: item.item.price,
            });
            setProductName(item.item.name);
            setProduct(currentProduct);
            setHintProductList([]);
          }}
        >
          <Text style={{ padding: 5 }}>{item.item.name}</Text>
        </TouchableRipple>
        <Divider bold={true} />
      </>
    );
  };

  return (
    <>
      <SnackbarInfo
        text={snackbarText}
        visible={snackbarVisible}
        onDismiss={onDismissSnackbar}
      />

      <View style={styles.container}>
        <KeyboardAvoidingView style={{ paddingHorizontal: 10 }}>
          <SearchList
            style={{ marginBottom: 10 }}
            icon='account'
            value={name}
            placeholder='Search Client'
            data={hintClientList}
            onChangeText={(input) => {
              setName(input);
              if (input.trim()) filterClientList(input);
              else setHintClientList([]);
            }}
            onEndEditing={() => {
              setHintClientList([]);
              if (!client.length) {
                getClient(name);
              }
            }}
            renderItem={renderClientHint}
            onClearIconPress={() => {
              setName('');
              setClient([]);
              setOrder([]);
              setHintClientList([]);
            }}
          />
          <SearchList
            icon='cake-variant'
            value={productName}
            placeholder='Search Product'
            data={hintProductList}
            onChangeText={(input) => {
              setProductName(input);
              if (input.trim()) filterProductList(input);
              else setHintProductList([]);
            }}
            onEndEditing={() => {
              setHintProductList([]);
              if (!product.length) {
                getProduct(productName);
              }
            }}
            renderItem={renderProductHint}
            onClearIconPress={() => {
              setProductName('');
              setProduct([]);
              setHintProductList([]);
            }}
          />
          <View
            style={{
              flexDirection: 'row',
              marginVertical: 10,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                width: '50%',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <TouchableRipple
                style={{
                  marginRight: 5,
                  width: '15%',
                  paddingVertical: 5,
                  paddingHorizontal: 10,
                  borderRadius: 15,
                }}
                borderless={true}
                onPress={() => {
                  if (Number(productQuantity) > 1)
                    setProductQuantity(
                      (Number(productQuantity) - 1).toString()
                    );
                }}
              >
                <Text
                  style={{
                    color: theme.colors.primary,
                    fontSize: 20,
                    fontWeight: 'bold',
                    paddingTop: 5,
                    paddingBottom: 5,
                    textAlign: 'center',
                    textAlignVertical: 'center',
                  }}
                >
                  -
                </Text>
              </TouchableRipple>
              <TextInput
                mode='outlined'
                value={productQuantity}
                onChangeText={(input) => {
                  setProductQuantity(input.replace(/[^0-9]/g, ''));
                }}
                onEndEditing={() => {
                  if (!productQuantity.trim()) {
                    setProductQuantity('1');
                  }
                }}
                autoCapitalize='none'
                keyboardType='numeric'
                label='Quantity'
              />
              <TouchableRipple
                style={{
                  marginHorizontal: 5,
                  width: '15%',
                  paddingVertical: 5,
                  paddingHorizontal: 10,
                  borderRadius: 15,
                }}
                borderless={true}
                onPress={() => {
                  setProductQuantity((Number(productQuantity) + 1).toString());
                }}
              >
                <Text
                  style={{
                    color: theme.colors.primary,
                    fontSize: 20,
                    fontWeight: 'bold',
                    paddingTop: 5,
                    paddingBottom: 5,
                    textAlign: 'center',
                    textAlignVertical: 'center',
                  }}
                >
                  +
                </Text>
              </TouchableRipple>
            </View>
            <View
              style={{
                width: '49%',
                //justifyContent: 'center',
                //alignItems: 'center',
              }}
            >
              <TextInput
                //style={{ maxWidth: '50%' }}
                mode='outlined'
                value={productWeight}
                onChangeText={(input) => {
                  setProductWeight(input.replace(/[^0-9.,]/g, ''));
                }}
                onEndEditing={() => {
                  if (!productWeight.trim()) {
                    setProductWeight('0.000');
                  } else
                    setProductWeight(productWeight.replace(',', '.').trim());
                }}
                autoCapitalize='none'
                keyboardType='decimal-pad'
                label='Weight(kg)'
              />
            </View>
          </View>
          <TextInput
            style={styles.input}
            value={notes}
            onChangeText={setNotes}
            autoCapitalize='sentences'
            keyboardType='default'
            label='Notes'
          />
          <Button
            style={styles.button}
            labelStyle={[styles.buttonText, { fontSize: 20, paddingTop: 5 }]}
            onPress={addToOrder}
          >
            Add to Order
          </Button>
        </KeyboardAvoidingView>
        <View
          style={{
            marginHorizontal: 10,
            padding: 10,
            //backgroundColor: theme.colors.elevation.level3,
            borderRadius: 5,
          }}
        >
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
                Notes
              </DataTable.Title>
            </DataTable.Header>
            {order.slice(from, to).map((item) => (
              <DataTable.Row key={item.key}>
                <DataTable.Cell>{item.product.name}</DataTable.Cell>
                <DataTable.Cell>{item.quantity}</DataTable.Cell>
                <DataTable.Cell>{item.weight.toFixed(3)}</DataTable.Cell>
                <DataTable.Cell>{item.notes}</DataTable.Cell>
              </DataTable.Row>
            ))}
            <DataTable.Pagination
              page={page}
              numberOfPages={Math.ceil(order.length / itemsPerPage)}
              onPageChange={(page) => setPage(page)}
              label={`${from + 1}-${to} of ${order.length}`}
              numberOfItemsPerPage={itemsPerPage}
              numberOfItemsPerPageList={numberOfItemsPerPageList}
              onItemsPerPageChange={onItemsPerPageChange}
              //showFastPaginationControls
              selectPageDropdownLabel={'Rows per page'}
            />
          </DataTable>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            style={styles.button}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonText}
            icon='account-plus'
            mode='elevated'
            loading={loading}
            onPress={createOrder}
          >
            {t('add.order.add')}
          </Button>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    //justifyContent: 'center',
  },
  modalContainer: {
    marginHorizontal: 30,
    alignItems: 'center',
  },
  modalContentContainer: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'flex-end',
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
  input: {
    marginVertical: 2,
  },
  pictureButton: {
    padding: 15,
    alignSelf: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 3,
  },
  dateText: {
    fontWeight: 'bold',
    textAlignVertical: 'center',
    fontSize: 20,
  },
  errorHelper: {
    fontWeight: 'bold',
    fontSize: 15,
  },
});
