import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import MapScreen from "../screens/MapScreen";
import FeedScreen from "../screens/FeedScreen";
import NewProblemScreen from "../screens/NewProblemScreen";
import ProfileScreen from "../screens/ProfileScreen";
import { theme } from "../theme/theme";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import AppHeader from "../components/AppHeader";

const Tab = createBottomTabNavigator();

export default function RootNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        // Header custom (Comunica+ + GPS)
        header: () => <AppHeader />,

        // Tab bar inteira, alta e longe dos botões do Android
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          borderTopWidth: 1,
          height: 84,
          paddingBottom: 20,
          paddingTop: 6,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarLabelStyle: { fontWeight: "700", marginBottom: 6 },
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tab.Screen
        name="Mapa"
        component={MapScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Icon name="map-marker" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Feed"
        component={FeedScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Icon name="format-list-bulleted" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Novo"
        component={NewProblemScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Icon name="plus-circle" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Perfil"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Icon name="account-circle" color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
}
