import React, { useMemo, useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import * as Location from "expo-location";
import { useProblems } from "../state/useProblems";
import { theme } from "../theme/theme";

export default function FeedScreen() {
  const { problems, vote } = useProblems();
  const navigation = useNavigation<any>();

  const [orderBy, setOrderBy] = useState<"recent" | "votes">("recent");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [aspectRatios, setAspectRatios] = useState<Record<string, number>>({});
  const [addresses, setAddresses] = useState<Record<string, string>>({});

  const items = useMemo(() => {
    const arr = [...problems];
    if (orderBy === "recent") {
      arr.sort((a, b) => b.createdAt - a.createdAt);
    } else {
      arr.sort((a, b) => b.votes - a.votes);
    }
    return arr;
  }, [problems, orderBy]);

  // Carregar aspectRatio das imagens
  useEffect(() => {
    problems.forEach((p) => {
      if (p.image && !aspectRatios[p.id]) {
        Image.getSize(
          p.image,
          (w, h) => {
            if (w && h) {
              setAspectRatios((prev) => ({
                ...prev,
                [p.id]: w / h,
              }));
            }
          },
          () => {}
        );
      }
    });
  }, [problems, aspectRatios]);

  // Buscar endereço a partir das coordenadas (reverse geocode)
  useEffect(() => {
    (async () => {
      for (const p of problems) {
        if (addresses[p.id]) continue; // já tem

        try {
          const results = await Location.reverseGeocodeAsync({
            latitude: p.latitude,
            longitude: p.longitude,
          });

          if (results && results.length > 0) {
            const r = results[0];

            // Monta um endereço amigável
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
          // se der erro, simplesmente não salva nada e usa o fallback (bairro/cidade)
        }
      }
    })();
  }, [problems, addresses]);

  if (!items.length) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>
          Nenhum problema ainda. Envie na aba “Novo”.
        </Text>
      </View>
    );
  }

  function handleGoToMap(id: string) {
    navigation.navigate("Mapa", { focusId: id });
  }

  return (
    <View style={{ flex: 1, padding: 12, backgroundColor: theme.colors.bg }}>
      {/* Chips de ordenação */}
      <View style={styles.row}>
        <Pressable
          onPress={() => setOrderBy("recent")}
          style={[styles.chip, orderBy === "recent" && styles.chipActive]}
        >
          <Text
            style={[
              styles.chipText,
              orderBy === "recent" && styles.chipTextActive,
            ]}
          >
            Mais recentes
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setOrderBy("votes")}
          style={[styles.chip, orderBy === "votes" && styles.chipActive]}
        >
          <Text
            style={[
              styles.chipText,
              orderBy === "votes" && styles.chipTextActive,
            ]}
          >
            Mais votados
          </Text>
        </Pressable>
      </View>

      {/* Lista */}
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 24 }}
        renderItem={({ item }) => {
          const ratio = aspectRatios[item.id];
          const isVertical = ratio && ratio < 1;

          // endereço vindo do mapa, se existir; senão, usa bairro + cidade
          const addressFromMap = addresses[item.id];
          const fallbackAddress = item.neighborhood
            ? `${item.neighborhood}, ${item.city}`
            : item.city;
          const addressToShow = addressFromMap || fallbackAddress;

          const desc = item.description ?? "";
          const hasLongDescription = desc.length > 90;

          return (
            <View style={styles.card}>
              <Text style={styles.title}>{item.title}</Text>

              {/* Endereço completo */}
              <Text style={styles.meta}>
                <Text style={{ fontWeight: "700" }}>Endereço: </Text>
                {addressToShow}
              </Text>

              {/* Status + data */}
              <Text style={styles.meta}>
                {item.status} • {new Date(item.createdAt).toLocaleString()}
              </Text>

              {/* Imagem com aspectRatio correto + verticais centralizadas */}
              {item.image && (
                <View style={styles.imageWrapper}>
                  <Image
                    source={{ uri: item.image }}
                    style={[
                      isVertical ? styles.imgVertical : styles.imgHorizontal,
                      ratio ? { aspectRatio: ratio } : {},
                    ]}
                    resizeMode={isVertical ? "contain" : "cover"}
                  />
                </View>
              )}

              {/* Descrição: se pequena mostra tudo, se grande mostra botão */}
              {desc.length > 0 && (
                <>
                  <Text
                    numberOfLines={
                      hasLongDescription && expandedId !== item.id ? 3 : 0
                    }
                    style={styles.description}
                  >
                    {desc}
                  </Text>

                  {hasLongDescription && (
                    <Pressable
                      style={styles.moreBtn}
                      onPress={() =>
                        setExpandedId((prev) =>
                          prev === item.id ? null : item.id
                        )
                      }
                    >
                      <Text style={styles.moreText}>
                        {expandedId === item.id
                          ? "Ver menos"
                          : "Ver detalhes do registro"}
                      </Text>
                    </Pressable>
                  )}
                </>
              )}

              <View style={styles.rowBetween}>
                <Text style={styles.coords}>
                  {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}
                </Text>

                <View style={styles.actionsRow}>
                  <Pressable
                    style={styles.voteBtn}
                    onPress={() => handleGoToMap(item.id)}
                  >
                    <Text style={styles.voteText}>Mapa</Text>
                  </Pressable>

                  <Pressable
                    style={styles.voteBtn}
                    onPress={() => vote(item.id)}
                  >
                    <Text style={styles.voteText}>
                      Votar {item.votes}
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: theme.colors.bg,
  },
  emptyText: { color: "#666" },

  row: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
  },

  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.radius,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.chip,
  },
  chipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  chipText: { color: theme.colors.text, fontWeight: "700" },
  chipTextActive: { color: "#fff" },

  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  title: { fontSize: 16, fontWeight: "800", color: theme.colors.text },
  meta: { color: theme.colors.textMuted, marginTop: 4 },

  imageWrapper: {
    width: "100%",
    borderRadius: 10,
    overflow: "hidden",
    marginTop: 8,
    marginBottom: 6,
    alignItems: "center",
  },

  imgHorizontal: {
    width: "100%",
    maxHeight: 260,
  },

  imgVertical: {
    width: "70%",
    maxHeight: 260,
  },

  description: {
    marginTop: 2,
    fontSize: 13,
    color: theme.colors.text,
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

  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
  },
  coords: { color: theme.colors.textMuted, fontWeight: "700" },

  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  voteBtn: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  voteText: { color: theme.colors.text, fontWeight: "900" },
});
