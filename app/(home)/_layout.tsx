import React from 'react';
import { Keyboard, TouchableOpacity, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Drawer } from 'expo-router/drawer';
import { Ionicons } from '@expo/vector-icons';
import CustomDrawerContent from '@/components/CustomDrawerContent';
import { useTranslation } from 'react-i18next';

const HomeLayout = () => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.background,
        },
        headerTitleStyle: { color: theme.colors.onBackground },
        headerShadowVisible: false,
        header: ({ navigation }) => (
          <View
            style={{
              paddingTop: insets.top,
              paddingHorizontal: 5,
            }}
          >
            <TouchableOpacity
              onPress={() => {
                Keyboard.dismiss();
                navigation.toggleDrawer();
              }}
              style={{ maxWidth: 36 }}
            >
              <Ionicons
                name='menu'
                size={45}
                color={theme.colors.onBackground}
                style={{ alignSelf: 'center' }}
              />
            </TouchableOpacity>
          </View>
        ),
        sceneStyle: {
          backgroundColor: theme.colors.background,
        },
        drawerStyle: { backgroundColor: theme.colors.background },
        drawerLabelStyle: { fontSize: 15, fontWeight: 'bold' },
        drawerActiveTintColor: theme.colors.primary,
        drawerInactiveTintColor: theme.colors.onBackground,
        drawerInactiveBackgroundColor: 'transparent',
      }}
    >
      <Drawer.Screen
        name='home'
        options={{
          drawerLabel: t('drawer.home'),
          title: t('drawer.home'),
          drawerIcon: ({ focused, size, color }) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Drawer.Screen
        name='(add)'
        options={{
          drawerLabel: t('drawer.add'),
          title: t('drawer.add'),
          drawerIcon: ({ focused, size, color }) => (
            <Ionicons
              name={focused ? 'person-add' : 'person-add-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Drawer.Screen
        name='(show)'
        options={{
          drawerLabel: t('drawer.show'),
          title: t('drawer.show'),
          drawerIcon: ({ focused, size, color }) => (
            <Ionicons
              name={focused ? 'search' : 'search-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Drawer.Screen
        name='importExport'
        options={{
          drawerLabel: t('drawer.importExport'),
          title: t('drawer.importExport'),
          drawerIcon: ({ focused, size, color }) => (
            <Ionicons
              name={focused ? 'server' : 'server-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Drawer>
  );
};

export default HomeLayout;
