import React, { useEffect } from "react";
import { NavigationContainer, DefaultTheme, Theme } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import RootNavigator from "./src/navigation/RootNavigator";
import { useProblems } from "./src/state/useProblems";
import { StatusBar, View } from "react-native";
import { theme } from "./src/theme/theme";

const navDark: Theme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    background: theme.colors.bg,
    card: theme.colors.surface,
    text: theme.colors.text,
    border: theme.colors.border,
    primary: theme.colors.primary,
    notification: theme.colors.primary,
  },
};

export default function App() {
  const load = useProblems((s: any) => s.load);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
        <StatusBar barStyle="light-content" />
        <NavigationContainer theme={navDark}>
          <RootNavigator />
        </NavigationContainer>
      </View>
    </SafeAreaProvider>
  );
}
