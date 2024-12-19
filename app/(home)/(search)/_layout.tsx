import React from 'react';
import { Stack } from 'expo-router';
import { useTheme } from 'react-native-paper';

const SearchLayout = () => {
  const theme = useTheme();
  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen name='searchHome' options={{ headerShown: false }} />
      <Stack.Screen name='searchClient' options={{ headerShown: false }} />
      <Stack.Screen name='searchProduct' options={{ headerShown: false }} />
    </Stack>
  );
};

export default SearchLayout;
