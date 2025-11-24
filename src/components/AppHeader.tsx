import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, AppState, AppStateStatus } from "react-native";
import * as Location from "expo-location";
import { useIsFocused } from "@react-navigation/native";
import { theme } from "../theme/theme";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AppHeader() {
  const [permStatus, setPermStatus] = useState<"granted" | "denied" | "undetermined">("undetermined");
  const [servicesOn, setServicesOn] = useState<boolean>(false);
  const isFocused = useIsFocused();

  async function checkGps() {
    try {
      const perm = await Location.getForegroundPermissionsAsync();
      const on = await Location.hasServicesEnabledAsync(); // <- GPS físico
      setPermStatus(perm.status);
      setServicesOn(on);
    } catch {
      setPermStatus("undetermined");
      setServicesOn(false);
    }
  }

  // quando a aba ganha foco, revalida
  useEffect(() => {
    if (isFocused) checkGps();
  }, [isFocused]);

  // quando o app volta ao foreground, revalida
  useEffect(() => {
    const sub = AppState.addEventListener("change", (state: AppStateStatus) => {
      if (state === "active") checkGps();
    });
    return () => sub.remove();
  }, []);

  // poll leve (opcional) para refletir mudanças rápidas do usuário
  useEffect(() => {
    const id = setInterval(checkGps, 4000);
    return () => clearInterval(id);
  }, []);

  const gpsAtivo = permStatus === "granted" && servicesOn;

  return (
    <SafeAreaView edges={["top"]} style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.left}>
          <View style={[styles.dot, { backgroundColor: "#34D399" }]} />
          <Text style={styles.brand}>Comunica+</Text>
        </View>

        <View style={[styles.gpsPill, { borderColor: gpsAtivo ? "#34D399" : "#F87171" }]}>
          <Text style={[styles.gpsText, { color: gpsAtivo ? "#34D399" : "#F87171" }]}>
            GPS {gpsAtivo ? "ativo" : "desligado"}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { backgroundColor: theme.colors.surface },
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
  },
  left: { flexDirection: "row", alignItems: "center", gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  brand: { color: theme.colors.text, fontSize: 18, fontWeight: "800" },
  gpsPill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, borderWidth: 1 },
  gpsText: { fontWeight: "700", fontSize: 12 },
});
