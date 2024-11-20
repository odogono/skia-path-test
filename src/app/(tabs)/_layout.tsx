import React from 'react';

import { Tabs } from 'expo-router';

import { IconSymbol } from '@components/example/ui/IconSymbol';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: 'lightblue',
        tabBarInactiveTintColor: 'lightgray',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#161e27'
        }
      }}
    >
      <Tabs.Screen
        name='index'
        options={{
          title: 'Paths',
          tabBarIcon: ({ color }) => (
            <IconSymbol
              size={28}
              name='point.3.connected.trianglepath.dotted'
              color={color}
            />
          )
        }}
      />
      <Tabs.Screen
        name='explore'
        options={{
          title: 'Draw',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name='hand.draw' color={color} />
          )
        }}
      />
    </Tabs>
  );
}
