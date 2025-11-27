import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  Pressable,
  Animated,
  Image,
} from "react-native";
import MapView, { Marker, Region } from "react-native-maps";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as Location from "expo-location";
import { useProblems } from "../state/useProblems";
import type { Problem } from "../state/useProblems";
import { theme } from "../theme/theme";

// IMPORTANDO OS PINS PERSONALIZADOS
import pinBlue from "../../assets/pins/pin-blue.png";
import pinRed from "../../assets/pins/pin-red.png";

export default function MapScreen() {
  const { problems, vote } = useProblems();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const mapRef = useRef<MapView>(null);

  // 🔹 Somente problemas com latitude/longitude válidos
  const validProblems = useMemo(
    () =>
      problems.filter(
        (p) =>
          typeof p.latitude === "number" &&
          !Number.isNaN(p.latitude) &&
          typeof p.longitude === "number" &&
          !Number.isNaN(p.longitude)
      ),
    [problems]
  );

  // id do problema a focar (quando vem do Feed)
  const focusId: string | undefined = route.params?.focusId;

  const [selected, setSelected] = useState<Problem | null>(null);

  // animação do card
  const slideAnim = useRef(new Animated.Value(0)).current;

  // animação de bounce dos pins
  const pinAnimations = useRef<{ [key: string]: Animated.Value }>({}).current;

  // endereço resolvido por reverse geocode (mesma ideia do feed)
  const [addresses, setAddresses] = useState<Record<string, string>>({});

  // controla se a descrição está expandida
  const [expanded, setExpanded] = useState(false);

  function getPinAnim(id: string) {
    if (!pinAnimations[id]) {
      pinAnimations[id] = new Animated.Value(0);
    }
    return pinAnimations[id];
  }

  function bouncePin(id: string) {
    const anim = getPinAnim(id);
    Animated.sequence([
      Animated.timing(anim, {
        toValue: -12, // sobe o pin
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(anim, {
        toValue: 0, // volta ao normal
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start();
  }

  function openCard(problem: Problem) {
    setSelected(problem);
    setExpanded(false); // sempre fecha descrição ao trocar de pin
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }

  function closeCard() {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setSelected(null);
      setExpanded(false);
    });
  }

  async function handleVoteAndGoToFeed() {
    if (!selected) return;
    await vote(selected.id);
    navigation.navigate("Feed");
  }

  // Região inicial (usa o primeiro problema válido, se existir)
  const initialRegion = useMemo(() => {
    if (validProblems.length > 0) {
      const p = validProblems[0];
      return {
        latitude: p.latitude,
        longitude: p.longitude,
        latitudeDelta: 0.08,
        longitudeDelta: 0.08,
      };
    }
    // fallback Florianópolis
    return {
      latitude: -27.5969,
      longitude: -48.5495,
      latitudeDelta: 0.12,
      longitudeDelta: 0.12,
    };
  }, [validProblems]);

  // 📍 Ao abrir a tela, tentar centralizar no usuário
  useEffect(() => {
    (async () => {
      try {
        const { status } =
          await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          return;
        }

        const loc = await Location.getCurrentPositionAsync({});
        const region: Region = {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          latitudeDelta: 0.03,
          longitudeDelta: 0.03,
        };

        mapRef.current?.animateToRegion(region, 700);
      } catch (e) {
        console.log("Erro ao obter localização inicial", e);
      }
    })();
  }, []);

  // Ajustar mapa para caber todos os pins válidos
  useEffect(() => {
    if (!mapRef.current || validProblems.length === 0) return;

    const coords = validProblems.map((p: Problem) => ({
      latitude: p.latitude,
      longitude: p.longitude,
    }));

    mapRef.current.fitToCoordinates(coords, {
      edgePadding: { top: 60, right: 60, bottom: 120, left: 60 },
      animated: true,
    });
  }, [validProblems]);

  // 🔎 Se veio um focusId (clicou em "Mapa" no Feed), foca nesse problema válido
  useEffect(() => {
    if (!focusId || validProblems.length === 0) return;

    const p = validProblems.find((pr) => pr.id === focusId);
    if (!p) return;

    openCard(p);
    bouncePin(p.id);

    // ✅ zoom bem mais perto
    mapRef.current?.animateToRegion(
      {
        latitude: p.latitude + 0.0015, // leve deslocamento pra cima
        longitude: p.longitude,
        latitudeDelta: 0.008,
        longitudeDelta: 0.008,
      },
      300
    );
  }, [focusId, validProblems]);

  // 🔁 Buscar endereço por reverse geocode (igual conceito do feed)
  useEffect(() => {
    (async () => {
      for (const p of validProblems) {
        if (addresses[p.id]) continue; // já tem

        try {
          const results = await Location.reverseGeocodeAsync({
            latitude: p.latitude,
            longitude: p.longitude,
          });

          if (results && results.length > 0) {
            const r = results[0];

            const streetPart =
              r.street && r.name
                ? `${r.street}, ${r.name}`
                : r.street || r.name || "";
            const districtPart = r.district || "";
            const cityPart = r.city || r.subregion || "";

            const pieces = [streetPart, districtPart, cityPart].filter(
              (t) => t && t.trim().length > 0
            );

            const formatted = pieces.join(" - ");

            if (formatted) {
              setAddresses((prev) => ({
                ...prev,
                [p.id]: formatted,
              }));
            }
          }
        } catch {
          // se der erro, ignora; o fallback usa bairro/cidade
        }
      }
    })();
  }, [validProblems, addresses]);

  // helper pra deixar o endereço exatamente como queremos (coerente com o feed)
  function getPrettyAddress(p: Problem): string {
    const addrFromMap = addresses[p.id];
    if (addrFromMap && addrFromMap.trim().length > 0) {
      return addrFromMap;
    }
    if ((p as any).neighborhood && (p as any).neighborhood.trim().length > 0) {
      return `${(p as any).neighborhood}, ${p.city}`;
    }
    return p.city;
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      {/* MAPA */}
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialRegion={initialRegion}
      >
        {validProblems.map((p: Problem) => {
          const anim = getPinAnim(p.id);
          const isSelected = selected?.id === p.id;

          return (
            <Marker
              key={p.id}
              coordinate={{
                latitude: p.latitude,
                longitude: p.longitude,
              }}
              onPress={() => {
                bouncePin(p.id);
                openCard(p);

                // ✅ aproxima bastante quando clica no pin
                mapRef.current?.animateToRegion(
                  {
                    latitude: p.latitude + 0.0015,
                    longitude: p.longitude,
                    latitudeDelta: 0.008,
                    longitudeDelta: 0.008,
                  },
                  250
                );
              }}
              zIndex={isSelected ? 999 : 1}
            >
              {/* PIN PERSONALIZADO ANIMADO */}
              <Animated.View style={{ transform: [{ translateY: anim }] }}>
                <Image
                  source={isSelected ? pinRed : pinBlue}
                  style={{ width: 48, height: 48 }}
                  resizeMode="contain"
                />
              </Animated.View>
            </Marker>
          );
        })}
      </MapView>

      {/* CARD FLUTUANTE */}
      {selected && (
        <Animated.View
          style={[
            styles.card,
            {
              transform: [
                {
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [250, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.cardTitle}>
            {selected.title} • {selected.votes} voto
            {selected.votes === 1 ? "" : "s"}
          </Text>

          {/* Endereço igual ao feed (com reverse geocode + fallback bairro/cidade) */}
          <Text style={styles.cardInfo}>
            <Text style={{ fontWeight: "700" }}>Endereço: </Text>
            {getPrettyAddress(selected)}
          </Text>

          {/* Status */}
          <Text style={styles.cardInfo}>{selected.status}</Text>

          {/* Descrição com "Ver detalhes" igual ao feed */}
          {selected.description ? (
            <>
              <Text
                style={styles.cardDesc}
                numberOfLines={expanded ? 0 : 3}
              >
                {selected.description}
              </Text>

              {selected.description.length > 80 && (
                <Pressable
                  style={styles.moreBtn}
                  onPress={() => setExpanded((prev) => !prev)}
                >
                  <Text style={styles.moreText}>
                    {expanded ? "Ver menos" : "Ver detalhes do registro"}
                  </Text>
                </Pressable>
              )}
            </>
          ) : null}

          <View style={styles.row}>
            <Pressable
              style={[styles.button, styles.voteBtn]}
              onPress={handleVoteAndGoToFeed}
            >
              <Text style={styles.buttonText}>Votar</Text>
            </Pressable>

            <Pressable
              style={[styles.button, styles.closeBtn]}
              onPress={closeCard}
            >
              <Text style={styles.buttonText}>Fechar</Text>
            </Pressable>
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    position: "absolute",
    bottom: 70,
    left: 10,
    right: 10,
    backgroundColor: theme.colors.surface,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: 4,
  },
  cardInfo: {
    fontSize: 13,
    color: theme.colors.textMuted,
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 13,
    color: theme.colors.text,
    marginTop: 6,
  },
  moreBtn: {
    marginTop: 4,
    alignSelf: "flex-start",
    paddingVertical: 4,
  },
  moreText: {
    fontSize: 12,
    fontWeight: "800",
    color: theme.colors.primary,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginTop: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  voteBtn: {
    backgroundColor: theme.colors.primary,
  },
  closeBtn: {
    backgroundColor: theme.colors.danger,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
  },
});
