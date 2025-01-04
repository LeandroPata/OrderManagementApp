import React from 'react';
import { Stack } from 'expo-router';
import { useTheme } from 'react-native-paper';

const ShowLayout = () => {
  const theme = useTheme();
  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen name='showHome' options={{ headerShown: false }} />
      <Stack.Screen name='showClientOrder' options={{ headerShown: false }} />
      <Stack.Screen name='showProductOrder' options={{ headerShown: false }} />
    </Stack>
  );
};

export default ShowLayout;
