import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import {
  ApiService,
  CustomerApi,
  GameApi,
  RentalWithDetails,
} from "@/Services/api";
import CardRental from "@/Components/CardRental";

export default function Rentals() {
  const [rentals, setRentals] = useState<RentalWithDetails[]>([]);
  const [filteredRentals, setFilteredRentals] = useState<RentalWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState("");

  // Dados auxiliares para o modal de cadastro
  const [customers, setCustomers] = useState<CustomerApi[]>([]);
  const [games, setGames] = useState<GameApi[]>([]);

  // Estado do Modal de Nova Locação
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [selectedGameId, setSelectedGameId] = useState("");
  const [rentalDays, setRentalDays] = useState("3");
  const [submitting, setSubmitting] = useState(false);

  const fetchRentals = useCallback(async () => {
    try {
      const data = await ApiService.getRentalsJoined();
      setRentals(data);
      applyFilter(searchText, data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao carregar locações";
      Alert.alert("Erro", message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchText]);

  useEffect(() => {
    fetchRentals();
  }, [fetchRentals]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchRentals();
  };

  const applyFilter = (text = searchText, list = rentals) => {
    setSearchText(text);
    if (!text.trim()) {
      setFilteredRentals(list);
      return;
    }
    const query = text.toLowerCase().trim();
    const filtered = list.filter(
      (r) =>
        (r.cliente_nome && r.cliente_nome.toLowerCase().includes(query)) ||
        (r.jogo_nome && r.jogo_nome.toLowerCase().includes(query)) ||
        (r.cliente_cpf && r.cliente_cpf.includes(query))
    );
    setFilteredRentals(filtered);
  };

  const handleOpenAddModal = async () => {
    try {
      const [cList, gList] = await Promise.all([
        ApiService.getCustomers(),
        ApiService.getGames(),
      ]);
      setCustomers(cList);
      setGames(gList);

      const availableGame = gList.find((g) => g.disponivel);
      if (availableGame) setSelectedGameId(availableGame.id);
      if (cList.length > 0) setSelectedCustomerId(cList[0].id);

      setRentalDays("3");
      setModalVisible(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao abrir formulário";
      Alert.alert("Erro", message);
    }
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedCustomerId("");
    setSelectedGameId("");
    setRentalDays("3");
  };

  // Cálculo prévio do valor total
  const selectedGame = games.find((g) => g.id === selectedGameId);
  const daysNum = parseInt(rentalDays, 10) || 1;
  const calculatedTotal = selectedGame
    ? (Number(selectedGame.valor_diaria) || 0) * daysNum
    : 0;

  const handleCreateRental = async () => {
    if (!selectedCustomerId) {
      Alert.alert("Atenção", "Selecione um cliente.");
      return;
    }

    if (!selectedGameId) {
      Alert.alert("Atenção", "Selecione um jogo disponível.");
      return;
    }

    if (daysNum <= 0) {
      Alert.alert("Atenção", "Informe uma quantidade válida de dias de locação.");
      return;
    }

    setSubmitting(true);
    try {
      const now = new Date();
      const returnDate = new Date();
      returnDate.setDate(now.getDate() + daysNum);

      const pickupStr = now.toISOString().split("T")[0];
      const returnStr = returnDate.toISOString().split("T")[0];

      await ApiService.createRental({
        id_cliente: selectedCustomerId,
        id_jogo: selectedGameId,
        data_retirada: pickupStr,
        data_devolucao_prevista: returnStr,
        valor_total: calculatedTotal.toFixed(2),
      });

      // Atualiza o jogo para indisponível
      await ApiService.updateGame(selectedGameId, { disponivel: false }).catch(() => {});

      Alert.alert("Sucesso", "Locação registrada com sucesso!");
      handleCloseModal();
      fetchRentals();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao registrar locação";
      Alert.alert("Erro", message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReturnRental = (rental: RentalWithDetails) => {
    Alert.alert(
      "Confirmar devolução",
      `Registrar a devolução do jogo "${rental.jogo_nome || "selecionado"}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Confirmar Devolução",
          style: "default",
          onPress: async () => {
            try {
              await ApiService.deleteRental(rental.id);
              // Devolve o jogo como disponível no acervo
              if (rental.id_jogo) {
                await ApiService.updateGame(rental.id_jogo, {
                  disponivel: true,
                }).catch(() => {});
              }
              Alert.alert("Devolvido", "Jogo devolvido e liberado no acervo com sucesso!");
              fetchRentals();
            } catch (err: unknown) {
              const msg = err instanceof Error ? err.message : String(err);
              Alert.alert("Erro ao devolver", msg);
            }
          },
        },
      ]
    );
  };

  const availableGames = games.filter((g) => g.disponivel);

  return (
    <View style={styles.container}>
      {/* Topo com Busca */}
      <View style={styles.topBar}>
        <View style={styles.searchWrap}>
          <Feather name="search" size={18} color="#8a8f98" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por cliente ou jogo..."
            placeholderTextColor="#6b7280"
            value={searchText}
            onChangeText={applyFilter}
            clearButtonMode="while-editing"
          />
        </View>

        <TouchableOpacity
          style={styles.btnAdd}
          onPress={handleOpenAddModal}
          activeOpacity={0.8}
        >
          <Feather name="plus" size={18} color="#ffffff" />
          <Text style={styles.btnAddText}>Alugar</Text>
        </TouchableOpacity>
      </View>

      {/* Lista ou Loading */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#7965DB" />
          <Text style={styles.loadingText}>Carregando locações...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredRentals}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <CardRental rental={item} onReturn={handleReturnRental} />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#7965DB"
              colors={["#7965DB"]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Feather name="shopping-bag" size={48} color="#353b4b" />
              <Text style={styles.emptyTitle}>Nenhuma locação ativa</Text>
              <Text style={styles.emptySubtitle}>
                {searchText
                  ? "Nenhum resultado para a busca atual."
                  : "Toque em '+ Alugar' para registrar uma nova locação de jogo."}
              </Text>
            </View>
          }
        />
      )}

      {/* Modal de Nova Locação */}
      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nova Locação</Text>
              <TouchableOpacity onPress={handleCloseModal} activeOpacity={0.7}>
                <Feather name="x" size={22} color="#8a8f98" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* Seleção do Cliente */}
              <Text style={styles.label}>Cliente *</Text>
              {customers.length === 0 ? (
                <Text style={styles.warningText}>Nenhum cliente cadastrado.</Text>
              ) : (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.pickerRow}
                >
                  {customers.map((c) => {
                    const isSelected = c.id === selectedCustomerId;
                    return (
                      <TouchableOpacity
                        key={c.id}
                        style={[
                          styles.pickerChip,
                          isSelected && styles.pickerChipSelected,
                        ]}
                        onPress={() => setSelectedCustomerId(c.id)}
                      >
                        <Text
                          style={[
                            styles.pickerChipText,
                            isSelected && styles.pickerChipTextSelected,
                          ]}
                          numberOfLines={1}
                        >
                          {c.nome}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              )}

              {/* Seleção do Jogo */}
              <Text style={styles.label}>Jogo Disponível *</Text>
              {availableGames.length === 0 ? (
                <Text style={styles.warningText}>
                  Não há jogos disponíveis no momento.
                </Text>
              ) : (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.pickerRow}
                >
                  {availableGames.map((g) => {
                    const isSelected = g.id === selectedGameId;
                    const price = Number(g.valor_diaria) || 0;
                    return (
                      <TouchableOpacity
                        key={g.id}
                        style={[
                          styles.pickerChip,
                          isSelected && styles.pickerChipSelected,
                        ]}
                        onPress={() => setSelectedGameId(g.id)}
                      >
                        <Text
                          style={[
                            styles.pickerChipText,
                            isSelected && styles.pickerChipTextSelected,
                          ]}
                          numberOfLines={1}
                        >
                          {g.nome} (R$ {price.toFixed(2)})
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              )}

              {/* Dias de Aluguel */}
              <Text style={styles.label}>Quantidade de Dias *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: 3"
                placeholderTextColor="#525866"
                keyboardType="numeric"
                value={rentalDays}
                onChangeText={setRentalDays}
              />

              {/* Resumo do Total */}
              <View style={styles.summaryCard}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Diária do jogo:</Text>
                  <Text style={styles.summaryValue}>
                    R$ {(Number(selectedGame?.valor_diaria) || 0).toFixed(2)}
                  </Text>
                </View>

                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Período:</Text>
                  <Text style={styles.summaryValue}>{daysNum} dia(s)</Text>
                </View>

                <View style={styles.summaryDivider} />

                <View style={styles.summaryRow}>
                  <Text style={styles.totalBigLabel}>Valor Total:</Text>
                  <Text style={styles.totalBigValue}>
                    {calculatedTotal.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </Text>
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnCancel]}
                onPress={handleCloseModal}
                disabled={submitting}
              >
                <Text style={styles.modalBtnCancelText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalBtn,
                  styles.modalBtnSave,
                  (!selectedCustomerId || !selectedGameId) && styles.modalBtnDisabled,
                ]}
                onPress={handleCreateRental}
                disabled={submitting || !selectedCustomerId || !selectedGameId}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.modalBtnSaveText}>Confirmar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0b0c10",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    backgroundColor: "#0f1115",
    borderBottomWidth: 1,
    borderBottomColor: "#1d212c",
  },
  searchWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#161922",
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 42,
    borderWidth: 1,
    borderColor: "#252936",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: "#ffffff",
    fontSize: 14,
  },
  btnAdd: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#7965DB",
    height: 42,
    paddingHorizontal: 14,
    borderRadius: 8,
    justifyContent: "center",
  },
  btnAddText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 14,
  },
  listContent: {
    padding: 16,
    paddingBottom: 24,
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: {
    color: "#8a8f98",
    fontSize: 14,
  },
  emptyWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#e2e8f0",
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#6b7280",
    textAlign: "center",
    paddingHorizontal: 32,
  },
  // Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    width: "100%",
    maxWidth: 420,
    maxHeight: "85%",
    backgroundColor: "#161922",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#252936",
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#252936",
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#ffffff",
  },
  modalBody: {
    padding: 18,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#cbd5e1",
    marginTop: 10,
    marginBottom: 6,
  },
  warningText: {
    color: "#f59e0b",
    fontSize: 12,
    fontStyle: "italic",
    marginBottom: 8,
  },
  pickerRow: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 4,
    marginBottom: 8,
  },
  pickerChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#0b0c10",
    borderWidth: 1,
    borderColor: "#252936",
  },
  pickerChipSelected: {
    backgroundColor: "#7965DB25",
    borderColor: "#7965DB",
  },
  pickerChipText: {
    color: "#cbd5e1",
    fontSize: 12,
    fontWeight: "600",
  },
  pickerChipTextSelected: {
    color: "#a594f9",
    fontWeight: "700",
  },
  input: {
    backgroundColor: "#0b0c10",
    borderWidth: 1,
    borderColor: "#252936",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    color: "#ffffff",
    fontSize: 14,
    marginBottom: 12,
  },
  summaryCard: {
    backgroundColor: "#0f1115",
    borderRadius: 10,
    padding: 14,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#252936",
    gap: 6,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 12,
    color: "#8a8f98",
  },
  summaryValue: {
    fontSize: 12,
    color: "#e2e8f0",
    fontWeight: "600",
  },
  summaryDivider: {
    height: 1,
    backgroundColor: "#252936",
    marginVertical: 4,
  },
  totalBigLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#ffffff",
  },
  totalBigValue: {
    fontSize: 16,
    fontWeight: "800",
    color: "#7965DB",
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    padding: 18,
    borderTopWidth: 1,
    borderTopColor: "#252936",
  },
  modalBtn: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    minWidth: 90,
    alignItems: "center",
    justifyContent: "center",
  },
  modalBtnCancel: {
    backgroundColor: "#252936",
  },
  modalBtnCancelText: {
    color: "#cbd5e1",
    fontWeight: "600",
    fontSize: 13,
  },
  modalBtnSave: {
    backgroundColor: "#7965DB",
  },
  modalBtnDisabled: {
    opacity: 0.5,
  },
  modalBtnSaveText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 13,
  },
});
