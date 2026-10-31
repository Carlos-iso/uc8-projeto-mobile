import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { CustomerApi } from "@/Services/api";

type Props = {
  customer: CustomerApi;
  onEdit: (customer: CustomerApi) => void;
  onDelete: (customer: CustomerApi) => void;
};

export default function CardCustomer({ customer, onEdit, onDelete }: Props) {
  const initial = customer.nome ? customer.nome.charAt(0).toUpperCase() : "?";

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>

        <View style={styles.headerInfo}>
          <Text style={styles.name} numberOfLines={1}>
            {customer.nome}
          </Text>
          <Text style={styles.idText} numberOfLines={1}>
            ID: {customer.id.substring(0, 8)}...
          </Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.editBtn]}
            onPress={() => onEdit(customer)}
            activeOpacity={0.7}
            accessibilityLabel="Editar cliente"
          >
            <Feather name="edit-2" size={16} color="#7965DB" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.deleteBtn]}
            onPress={() => onDelete(customer)}
            activeOpacity={0.7}
            accessibilityLabel="Excluir cliente"
          >
            <Feather name="trash-2" size={16} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.infoGrid}>
        <View style={styles.infoItem}>
          <Feather name="user-check" size={14} color="#8a8f98" />
          <Text style={styles.infoLabel}>CPF:</Text>
          <Text style={styles.infoValue}>{customer.cpf}</Text>
        </View>

        <View style={styles.infoItem}>
          <Feather name="phone" size={14} color="#8a8f98" />
          <Text style={styles.infoLabel}>Tel:</Text>
          <Text style={styles.infoValue}>{customer.telefone}</Text>
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
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#7965DB22",
    borderWidth: 1.5,
    borderColor: "#7965DB",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: {
    color: "#7965DB",
    fontSize: 18,
    fontWeight: "700",
  },
  headerInfo: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 2,
  },
  idText: {
    fontSize: 11,
    color: "#6b7280",
    fontFamily: "monospace",
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
  divider: {
    height: 1,
    backgroundColor: "#252936",
    marginVertical: 12,
  },
  infoGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 8,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  infoLabel: {
    fontSize: 12,
    color: "#8a8f98",
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 13,
    color: "#e2e8f0",
    fontWeight: "600",
  },
});
