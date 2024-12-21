import React, { useCallback, useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Keyboard,
  ScrollView,
} from 'react-native';
import { Button, Divider, TouchableRipple, Text } from 'react-native-paper';
import { FirebaseError } from 'firebase/app';
import firestore, { Timestamp } from '@react-native-firebase/firestore';
import { useTranslation } from 'react-i18next';
import SnackbarInfo from '@/components/SnackbarInfo';
import { useFocusEffect } from 'expo-router';
import SearchList from '@/components/SearchList';
import Fuse from 'fuse.js';

export default function AddOrder() {
  const { t } = useTranslation();

  const [loading, setLoading] = useState(false);

  const [nameError, setNameError] = useState(false);

  const [clientList, setClientList] = useState([]);
  const [hintClientList, setHintClientList] = useState([]);
  const [productList, setProductList] = useState([]);

  const [name, setName] = useState('');
  const [order, setOrder] = useState([]);

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
    //console.log(filteredList);
  };
  const getProductList = async () => {};

  const checkClient = async () => {
    let clientExists = false;
    clientList.forEach((client) => {
      //console.log(client.name + ' : ' + name + ' : ' + (client.name == name));
      if (client.name == name) clientExists = true;
    });

    console.log(clientExists);
    return clientExists;
  };

  const addOrder = async () => {
    setLoading(true);
    Keyboard.dismiss();

    if (!name.trim() || !Boolean(await checkClient())) {
      showSnackbar(t('add.order.clientNameError'));
      setNameError(true);
      setLoading(false);
      return;
    }

    const docRef = firestore().collection('orders').doc();

    try {
      docRef
        .set({
          name: name.trim(),
          order: order,
        })
        .then(() => {
          console.log('Added');
          showSnackbar(t('add.order.added'));
          setName('');
          setOrder([]);
          setHintClientList([]);
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

  const renderItem = ({ item }) => {
    //console.log(item.item.name + ' : ' + item.score);
    return (
      <>
        <Divider bold={true} />
        <TouchableRipple
          onPress={() => {
            Keyboard.dismiss();
            setName(item.item.name);
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
            icon='account'
            value={name}
            placeholder='Search Client'
            data={hintClientList}
            onChangeText={(input) => {
              setName(input);
              if (input.trim()) filterClientList(input);
            }}
            renderItem={renderItem}
          />
        </KeyboardAvoidingView>
        <ScrollView></ScrollView>

        <View style={styles.buttonContainer}>
          <Button
            style={styles.button}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonText}
            icon='account-plus'
            mode='elevated'
            loading={loading}
            onPress={addOrder}
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
    justifyContent: 'center',
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
