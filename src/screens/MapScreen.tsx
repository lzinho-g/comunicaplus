import React, { useEffect, useMemo, useRef } from "react";
import { View, StyleSheet } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { useProblems } from "../state/useProblems";
import type { Problem } from "../state/useProblems";
import { theme } from "../theme/theme";

export default function MapScreen() {
  const { problems } = useProblems();
  const mapRef = useRef<MapView>(null);

  // Região inicial (cai no primeiro problema, se existir)
  const initialRegion = useMemo(() => {
    if (problems.length > 0) {
      const p = problems[0];
      return {
        latitude: p.latitude,
        longitude: p.longitude,
        latitudeDelta: 0.08,
        longitudeDelta: 0.08,
      };
    }
    return {
      latitude: -27.5969,
      longitude: -48.5495,
      latitudeDelta: 0.12,
      longitudeDelta: 0.12,
    };
  }, [problems]);

  // Ajusta o mapa para caber todos os pinos
  useEffect(() => {
    if (!mapRef.current || problems.length === 0) return;

    const coords = problems.map((p: Problem) => ({
      latitude: p.latitude,
      longitude: p.longitude,
    }));

    mapRef.current.fitToCoordinates(coords, {
      edgePadding: { top: 60, right: 60, bottom: 80, left: 60 },
      animated: true,
    });
  }, [problems]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialRegion={initialRegion}
        provider={PROVIDER_GOOGLE} // força balão nativo do Google no Android
      >
        {problems.map((p: Problem) => (
          <Marker
            key={p.id}
            coordinate={{ latitude: p.latitude, longitude: p.longitude }}
            pinColor={theme.colors.primary}
            // Balão nativo: título + descrição
            title={p.title}
            description={
              `${p.city} • ${p.status} • Votos: ${p.votes}\n` +
              (p.description || "")
            }
            // Importante: não usar Callout custom; apenas o nativo
          />
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  // mantido para caso queira customização futura
});
