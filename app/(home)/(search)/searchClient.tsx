import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View, StyleSheet, KeyboardAvoidingView, Keyboard } from 'react-native';
import { Divider, Text, TouchableRipple, useTheme } from 'react-native-paper';
import SnackbarInfo from '@/components/SnackbarInfo';
import firestore, { Timestamp } from '@react-native-firebase/firestore';
import { FirebaseError } from 'firebase/app';
import SearchList from '@/components/SearchList';
import Fuse from 'fuse.js';
import DataTableOrder from '@/components/DataTableOrder';

export default function SearchClient() {
  const theme = useTheme();
  const { t } = useTranslation();

  const [clientList, setClientList] = useState([]);
  const [hintClientList, setHintClientList] = useState([]);

  const [name, setName] = useState('');
  const [client, setClient] = useState([]);
  const [clientOrders, setClientOrders] = useState([]);

  // All the logic to implement the snackbar
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarText, setSnackbarText] = useState('');

  const showSnackbar = (text: string) => {
    setSnackbarText(text);
    setSnackbarVisible(true);
  };
  const onDismissSnackbar = () => setSnackbarVisible(false);

  useFocusEffect(
    useCallback(() => {
      // Screen focused
      //console.log("Hello, I'm focused!");
      getClientList();

      // Screen unfocused in return
      return () => {
        //console.log('This route is now unfocused.');
        //setProfile(null);
        setName('');
        setClient([]);
        setClientOrders([]);
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

  const getClient = (clientName: string) => {
    if (client) return;
    const currentClient = [];
    clientList.forEach((doc) => {
      if (doc.name == clientName.trim()) {
        currentClient.push({ key: doc.key, name: doc.name });
      }
    });
    if (currentClient.length == 1) {
      setClient(currentClient[0]);
      getClientOrders(currentClient[0].key);
    }
    return currentClient[0];
  };

  const getClientOrders = async (clientKey: string) => {
    //console.log(clientKey);
    await firestore()
      .collection('orders')
      .orderBy('client.name', 'asc')
      .get()
      .then((snapshot) => {
        const orders = [];
        let i = 0;
        snapshot.forEach((doc) => {
          //console.log(doc.data());
          if (doc.data().client.key == clientKey) {
            doc.data().order.forEach((order) => {
              //console.log(order);
              orders.push({
                key: i,
                product: order.product,
                quantity: order.quantity,
                weight: order.weight,
                price: order.price,
                notes: order.notes,
                deliveryDateTime: new Date(
                  doc.data().deliveryDateTime.toDate()
                ),
              });
              i++;
            });
          }
        });
        setClientOrders(orders);
        console.log(orders);
      });
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
            setClient(currentClient[0]);
            getClientOrders(currentClient[0].key);
            setHintClientList([]);
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
              if (!client) {
                getClient(name);
              }
            }}
            renderItem={renderClientHint}
            onClearIconPress={() => {
              setName('');
              setClient([]);
              setHintClientList([]);
              setClientOrders([]);
            }}
          />
        </KeyboardAvoidingView>
        <View style={{ position: 'relative' }}>
          <DataTableOrder
            data={clientOrders}
            dataType='clientOrder'
            numberofItemsPerPageList={[6, 7, 8]}
          />
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
  },
  dateText: {
    fontWeight: 'bold',
    fontSize: 20,
    marginVertical: 6,
  },
  errorHelper: {
    fontWeight: 'bold',
    fontSize: 15,
  },
});
