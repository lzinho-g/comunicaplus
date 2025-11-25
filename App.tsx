import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View, ActivityIndicator, Text } from "react-native";

import RootNavigator from "./src/navigation/RootNavigator";
import { useProblems } from "./src/state/useProblems";
import { useAuth } from "./src/state/useAuth";
import LoginScreen from "./src/screens/LoginScreen";
import RegisterScreen from "./src/screens/RegisterScreen";
import IntroScreen from "./src/screens/IntroScreen";
import { theme } from "./src/theme/theme";

const Stack = createNativeStackNavigator();

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

function LoadingScreen() {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.bg,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <ActivityIndicator size="large" color={theme.colors.primary} />
      <Text
        style={{
          marginTop: 12,
          color: theme.colors.textMuted,
          fontWeight: "600",
        }}
      >
        Carregando dados...
      </Text>
    </View>
  );
}

export default function App() {
  const { load: loadProblems, loaded } = useProblems();
  const { load: loadAuth, initialized, loggedIn, firstLoginCompleted } = useAuth();

  useEffect(() => {
    loadProblems();
    loadAuth();
  }, []);

  if (!loaded || !initialized) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      {!loggedIn ? (
        <AuthStack />
      ) : !firstLoginCompleted ? (
        <IntroScreen />
      ) : (
        <RootNavigator />
      )}
    </NavigationContainer>
  );
}
