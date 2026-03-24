import { Tabs, Redirect } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, useColorScheme, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { isLiquidGlassAvailable } from 'expo-glass-effect';
import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';
import { SymbolView } from 'expo-symbols';
import { Feather, MaterialIcons } from '@expo/vector-icons';

import { HapticTab } from '@/components/haptic-tab';
import { useAuth } from '@/context/auth';

const BG       = '#060d1a';
const TEAL     = '#00d4c8';
const INACTIVE = 'rgba(255,255,255,0.3)';

function NativeTabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Icon sf={{ default: 'house', selected: 'house.fill' }} />
        <Label>Ana Səhifə</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="certificates">
        <Icon sf={{ default: 'rosette', selected: 'rosette' }} />
        <Label>Sertifikatlar</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="trainings">
        <Icon sf={{ default: 'book', selected: 'book.fill' }} />
        <Label>Təlimlər</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="services">
        <Icon sf={{ default: 'briefcase', selected: 'briefcase.fill' }} />
        <Label>Xidmətlər</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <Icon sf={{ default: 'person', selected: 'person.fill' }} />
        <Label>Profil</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

function ClassicTabLayout() {
  const isIOS = Platform.OS === 'ios';
  const isWeb = Platform.OS === 'web';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarActiveTintColor: TEAL,
        tabBarInactiveTintColor: INACTIVE,
        tabBarStyle: {
          backgroundColor: isIOS ? 'transparent' : BG,
          borderTopColor: 'rgba(0,212,200,0.15)',
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          ...(isWeb ? { height: 84 } : {}),
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView intensity={100} tint="dark" style={StyleSheet.absoluteFill} />
          ) : isWeb ? (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: BG }]} />
          ) : null,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Ana Səhifə',
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="house.fill" tintColor={color} size={24} />
            ) : (
              <Feather name="home" size={22} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="certificates"
        options={{
          title: 'Sertifikatlar',
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="rosette" tintColor={color} size={24} />
            ) : (
              <MaterialIcons name="workspace-premium" size={22} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="trainings"
        options={{
          title: 'Təlimlər',
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="book.fill" tintColor={color} size={24} />
            ) : (
              <MaterialIcons name="menu-book" size={22} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="services"
        options={{
          title: 'Xidmətlər',
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="briefcase.fill" tintColor={color} size={24} />
            ) : (
              <MaterialIcons name="work" size={22} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="person.fill" tintColor={color} size={24} />
            ) : (
              <Feather name="user" size={22} color={color} />
            ),
        }}
      />
    </Tabs>
  );
}

export default function TabLayout() {
  const { session } = useAuth();

  if (!session) {
    return <Redirect href="/login" />;
  }

  if (isLiquidGlassAvailable()) {
    return <NativeTabLayout />;
  }
  return <ClassicTabLayout />;
}
