import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  Pressable,
  Animated,
  Image,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { useNavigation, useRoute } from "@react-navigation/native";
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

  // id do problema a focar (quando vem do Feed)
  const focusId: string | undefined = route.params?.focusId;

  const [selected, setSelected] = useState<Problem | null>(null);

  // animação do card
  const slideAnim = useRef(new Animated.Value(0)).current;

  // animação de bounce dos pins
  const pinAnimations = useRef<{ [key: string]: Animated.Value }>({}).current;

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
    });
  }

  async function handleVoteAndGoToFeed() {
    if (!selected) return;
    await vote(selected.id);
    navigation.navigate("Feed");
  }

  // Região inicial
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

  // Ajustar mapa para caber todos os pins
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

  // 🔎 Se veio um focusId (clicou em "Mapa" no Feed), foca nesse problema
  useEffect(() => {
    if (!focusId || problems.length === 0) return;

    const p = problems.find((pr) => pr.id === focusId);
    if (!p) return;

    // abre o card, centraliza e faz o pin "pular"
    openCard(p);
    bouncePin(p.id);

    mapRef.current?.animateToRegion(
      {
        latitude: p.latitude,
        longitude: p.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      },
      300
    );
  }, [focusId, problems]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      {/* MAPA */}
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialRegion={initialRegion}
      >
        {problems.map((p: Problem) => {
          const anim = getPinAnim(p.id);
          const isSelected = selected?.id === p.id;

          return (
            <Animated.View
              key={p.id}
              style={{ transform: [{ translateY: anim }] }}
            >
              <Marker
                coordinate={{
                  latitude: p.latitude,
                  longitude: p.longitude,
                }}
                onPress={() => {
                  bouncePin(p.id);
                  openCard(p);

                  // Centralizar no pin selecionado
                  mapRef.current?.animateToRegion(
                    {
                      latitude: p.latitude,
                      longitude: p.longitude,
                      latitudeDelta: 0.01,
                      longitudeDelta: 0.01,
                    },
                    250
                  );
                }}
              >
                {/* PIN GRANDE PERSONALIZADO */}
                <Image
                  source={isSelected ? pinRed : pinBlue}
                  style={{ width: 48, height: 48 }}
                  resizeMode="contain"
                />
              </Marker>
            </Animated.View>
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

          <Text style={styles.cardInfo}>
            {selected.city} • {selected.status}
          </Text>

          {selected.description ? (
            <Text style={styles.cardDesc} numberOfLines={3}>
              {selected.description}
            </Text>
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
    marginBottom: 8,
  },
  cardDesc: {
    fontSize: 13,
    color: theme.colors.text,
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
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
