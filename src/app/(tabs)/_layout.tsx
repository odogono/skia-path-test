import React from 'react';

import { Tabs } from 'expo-router';

import { IconSymbol } from '@components/example/ui/IconSymbol';

export const TabLayout = () => {
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
        name='path'
        options={{
          title: 'Path',
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
        name='draw'
        options={{
          title: 'Draw',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name='hand.draw' color={color} />
          )
        }}
      />
    </Tabs>
  );
};

export default TabLayout;
