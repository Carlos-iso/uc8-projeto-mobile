import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { GameApi } from "@/Services/api";

type Props = {
  game: GameApi;
  onEdit: (game: GameApi) => void;
  onDelete: (game: GameApi) => void;
};

export default function CardGame({ game, onEdit, onDelete }: Props) {
  const dailyRateNumber = Number(game.valor_diaria) || 0;
  const formattedRate = dailyRateNumber.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.badgesRow}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText} numberOfLines={1}>
              {game.categoria || "Geral"}
            </Text>
          </View>

          <View
            style={[
              styles.statusBadge,
              game.disponivel ? styles.statusAvailable : styles.statusUnavailable,
            ]}
          >
            <View
              style={[
                styles.statusDot,
                game.disponivel ? styles.dotAvailable : styles.dotUnavailable,
              ]}
            />
            <Text
              style={[
                styles.statusText,
                game.disponivel ? styles.textAvailable : styles.textUnavailable,
              ]}
            >
              {game.disponivel ? "Disponível" : "Alugado / Ocupado"}
            </Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.editBtn]}
            onPress={() => onEdit(game)}
            activeOpacity={0.7}
            accessibilityLabel="Editar jogo"
          >
            <Feather name="edit-2" size={16} color="#7965DB" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.deleteBtn]}
            onPress={() => onDelete(game)}
            activeOpacity={0.7}
            accessibilityLabel="Excluir jogo"
          >
            <Feather name="trash-2" size={16} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.gameTitle}>{game.nome}</Text>

      <View style={styles.divider} />

      <View style={styles.bottomRow}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Valor da diária</Text>
          <Text style={styles.priceValue}>{formattedRate}</Text>
        </View>

        <View style={styles.idContainer}>
          <Text style={styles.idLabel}>ID</Text>
          <Text style={styles.idValue} numberOfLines={1}>
            {game.id.substring(0, 8)}...
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#161922",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#252936",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  badgesRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
    flex: 1,
    marginRight: 8,
  },
  categoryBadge: {
    backgroundColor: "#7965DB20",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#7965DB40",
  },
  categoryBadgeText: {
    color: "#a594f9",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusAvailable: {
    backgroundColor: "#22c55e15",
    borderColor: "#22c55e35",
  },
  dotAvailable: {
    backgroundColor: "#22c55e",
  },
  textAvailable: {
    color: "#4ade80",
  },
  statusUnavailable: {
    backgroundColor: "#f59e0b15",
    borderColor: "#f59e0b35",
  },
  dotUnavailable: {
    backgroundColor: "#f59e0b",
  },
  textUnavailable: {
    color: "#fbbf24",
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actionBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  editBtn: {
    backgroundColor: "#7965DB15",
    borderColor: "#7965DB44",
  },
  deleteBtn: {
    backgroundColor: "#ef444415",
    borderColor: "#ef444444",
  },
  gameTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#ffffff",
    marginTop: 2,
    marginBottom: 4,
  },
  divider: {
    height: 1,
    backgroundColor: "#252936",
    marginVertical: 12,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  priceContainer: {
    gap: 2,
  },
  priceLabel: {
    fontSize: 11,
    color: "#8a8f98",
    fontWeight: "500",
  },
  priceValue: {
    fontSize: 16,
    fontWeight: "800",
    color: "#e2e8f0",
  },
  idContainer: {
    alignItems: "flex-end",
    gap: 2,
  },
  idLabel: {
    fontSize: 10,
    color: "#6b7280",
  },
  idValue: {
    fontSize: 11,
    color: "#6b7280",
    fontFamily: "monospace",
  },
});
