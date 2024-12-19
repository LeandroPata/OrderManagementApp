import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Keyboard } from 'react-native';
import { Button, TextInput, HelperText } from 'react-native-paper';
import { FirebaseError } from 'firebase/app';
import firestore, { Timestamp } from '@react-native-firebase/firestore';
import { useTranslation } from 'react-i18next';
import SnackbarInfo from '@/components/SnackbarInfo';

export default function AddProduct() {
  const { t } = useTranslation();

  const [loading, setLoading] = useState(false);

  const [nameError, setNameError] = useState(false);

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');

  // All the logic to implement the snackbar
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarText, setSnackbarText] = useState('');

  const showSnackbar = (text: string) => {
    setSnackbarText(text);
    setSnackbarVisible(true);
  };
  const onDismissSnackbar = () => setSnackbarVisible(false);

  const checkProduct = async () => {
    let productExists = false;
    await firestore()
      .collection('products')
      .orderBy('name', 'asc')
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          if (name.trim() == doc.data().name) productExists = true;
        });
      });
    console.log('Product exists: ' + productExists);
    return productExists;
  };

  const addProduct = async () => {
    setLoading(true);
    Keyboard.dismiss();

    if (!name.trim() || Boolean(await checkProduct())) {
      showSnackbar(t('add.product.nameError'));
      setNameError(true);
      setLoading(false);
      return;
    }

    const docRef = firestore().collection('products').doc();

    try {
      docRef
        .set({
          name: name.trim(),
          price: Number(price.trim()),
        })
        .then(() => {
          console.log('Added');
          showSnackbar(t('add.product.added'));
          setName('');
          setPrice('');
        });
    } catch (e: any) {
      const err = e as FirebaseError;
      console.log('Adding member failed: ' + err.message);
      //showSnackbar('Adding member failed: ' + err.message);
      setLoading(false);
    } finally {
      setLoading(false);
      setNameError(false);
    }
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
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            onEndEditing={() => {
              if (!name.trim()) {
                setNameError(true);
              } else setNameError(false);
              setName(name.trim());
            }}
            error={nameError}
            autoCapitalize='words'
            keyboardType='default'
            label={t('add.product.name')}
          />
          {nameError ? (
            <HelperText
              type='error'
              visible={nameError}
              style={styles.errorHelper}
            >
              Name is invalid!
            </HelperText>
          ) : null}

          <TextInput
            style={styles.input}
            value={price}
            onChangeText={(input) => {
              setPrice(input.replace(/[^0-9.,]/g, ''));
            }}
            onEndEditing={() => {
              setPrice(price.replace(',', '.').trim());
            }}
            autoCapitalize='none'
            inputMode='decimal'
            keyboardType='decimal-pad'
            label={t('add.product.price')}
          />
        </KeyboardAvoidingView>

        <View style={styles.buttonContainer}>
          <Button
            style={styles.button}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonText}
            icon='account-plus'
            mode='elevated'
            loading={loading}
            onPress={addProduct}
          >
            {t('add.product.add')}
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
