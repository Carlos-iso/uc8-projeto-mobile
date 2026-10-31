import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { RentalWithDetails } from "@/Services/api";

type Props = {
  rental: RentalWithDetails;
  onReturn: (rental: RentalWithDetails) => void;
};

function formatDate(dateStr?: string): string {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export default function CardRental({ rental, onReturn }: Props) {
  const totalPriceNum = Number(rental.valor_total) || 0;
  const formattedTotal = totalPriceNum.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.gameInfo}>
          <Text style={styles.gameName} numberOfLines={1}>
            {rental.jogo_nome || "Jogo sem identificação"}
          </Text>
          {rental.jogo_categoria && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{rental.jogo_categoria}</Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={styles.btnReturn}
          onPress={() => onReturn(rental)}
          activeOpacity={0.7}
          accessibilityLabel="Devolver ou encerrar locação"
        >
          <Feather name="check-circle" size={16} color="#22c55e" />
          <Text style={styles.btnReturnText}>Devolver</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      <View style={styles.customerRow}>
        <Feather name="user" size={15} color="#7965DB" />
        <Text style={styles.customerName} numberOfLines={1}>
          {rental.cliente_nome || "Cliente sem nome"}
        </Text>
        {rental.cliente_cpf && (
          <Text style={styles.customerCpf}>• {rental.cliente_cpf}</Text>
        )}
      </View>

      <View style={styles.datesGrid}>
        <View style={styles.dateBlock}>
          <Text style={styles.dateLabel}>Retirada</Text>
          <View style={styles.dateValueWrap}>
            <Feather name="calendar" size={12} color="#8a8f98" />
            <Text style={styles.dateValue}>{formatDate(rental.data_retirada)}</Text>
          </View>
        </View>

        <View style={styles.dateBlock}>
          <Text style={styles.dateLabel}>Devolução Prevista</Text>
          <View style={styles.dateValueWrap}>
            <Feather name="clock" size={12} color="#f59e0b" />
            <Text style={[styles.dateValue, styles.dateReturn]}>
              {formatDate(rental.data_devolucao_prevista)}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.footerRow}>
        <Text style={styles.totalLabel}>Valor Total</Text>
        <Text style={styles.totalValue}>{formattedTotal}</Text>
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
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  gameInfo: {
    flex: 1,
    marginRight: 10,
  },
  gameName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 4,
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "#7965DB20",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  badgeText: {
    color: "#a594f9",
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  btnReturn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#22c55e15",
    borderWidth: 1,
    borderColor: "#22c55e40",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  btnReturnText: {
    color: "#4ade80",
    fontSize: 12,
    fontWeight: "700",
  },
  divider: {
    height: 1,
    backgroundColor: "#252936",
    marginVertical: 12,
  },
  customerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  customerName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#e2e8f0",
  },
  customerCpf: {
    fontSize: 12,
    color: "#8a8f98",
  },
  datesGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#0f1115",
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  dateBlock: {
    gap: 3,
  },
  dateLabel: {
    fontSize: 10,
    color: "#6b7280",
    textTransform: "uppercase",
    fontWeight: "600",
  },
  dateValueWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  dateValue: {
    fontSize: 12,
    color: "#cbd5e1",
    fontWeight: "600",
  },
  dateReturn: {
    color: "#fbbf24",
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 12,
    color: "#8a8f98",
  },
  totalValue: {
    fontSize: 17,
    fontWeight: "800",
    color: "#7965DB",
  },
});
