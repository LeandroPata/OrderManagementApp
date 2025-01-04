import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

export default function Home() {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        <Button
          style={styles.button}
          contentStyle={styles.buttonContent}
          labelStyle={styles.buttonText}
          icon='account-plus'
          mode='elevated'
          //loading={loginLoading}
          onPress={() => router.push('/(home)/(add)/addHome')}
        >
          {t('home.add')}
        </Button>
        <Button
          style={styles.button}
          contentStyle={styles.buttonContent}
          labelStyle={styles.buttonText}
          icon='account-search'
          mode='elevated'
          //loading={loginLoading}
          onPress={() => router.push('/(home)/(show)/showHome')}
        >
          {t('home.show')}
        </Button>
        <Button
          style={styles.button}
          contentStyle={styles.buttonContent}
          labelStyle={styles.buttonText}
          icon='database'
          mode='elevated'
          //loading={loginLoading}
          onPress={() => router.push('/(home)/importExport')}
        >
          {t('home.importExport')}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  buttonContainer: {
    marginHorizontal: 20,
    alignItems: 'center',
  },
  input: {
    marginVertical: 4,
    height: 50,
    borderWidth: 1,
    borderRadius: 1,
    padding: 5,
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
});
