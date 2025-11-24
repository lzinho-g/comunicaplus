import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useProblems } from "../state/useProblems";
import { theme } from "../theme/theme";

export default function FeedScreen() {
  const { problems, vote } = useProblems();
  const navigation = useNavigation<any>();
  const [orderBy, setOrderBy] = useState<"recent" | "votes">("recent");

  const items = useMemo(() => {
    const arr = [...problems];
    if (orderBy === "recent") {
      arr.sort((a, b) => b.createdAt - a.createdAt);
    } else {
      arr.sort((a, b) => b.votes - a.votes);
    }
    return arr;
  }, [problems, orderBy]);

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
    // 👇 o nome da rota é "Mapa", igual no RootNavigator
    navigation.navigate("Mapa", { focusId: id });
  }

  return (
    <View style={{ flex: 1, padding: 12, backgroundColor: theme.colors.bg }}>
      {/* Chips de ordenação */}
      <View style={styles.row}>
        <Pressable
          onPress={() => setOrderBy("recent")}
          style={[
            styles.chip,
            orderBy === "recent" && styles.chipActive,
          ]}
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
          style={[
            styles.chip,
            orderBy === "votes" && styles.chipActive,
          ]}
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
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.meta}>
              {item.city} • {item.status} •{" "}
              {new Date(item.createdAt).toLocaleString()}
            </Text>

            {item.image ? (
              <Image source={{ uri: item.image }} style={styles.img} />
            ) : null}

            {item.description ? (
              <Text numberOfLines={3} style={styles.meta}>
                {item.description}
              </Text>
            ) : null}

            <View style={styles.rowBetween}>
              <Text style={styles.coords}>
                {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}
              </Text>

              {/* Botões lado a lado: Mapa (esquerda) e Votar (direita) */}
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
        )}
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
  img: {
    width: "100%",
    height: 180,
    borderRadius: 8,
    marginTop: 8,
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
