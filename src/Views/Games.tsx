import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { ApiService, GameApi } from "@/Services/api";
import CardGame from "@/Components/CardGame";

export default function Games() {
  const [games, setGames] = useState<GameApi[]>([]);
  const [filteredGames, setFilteredGames] = useState<GameApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filterMode, setFilterMode] = useState<"ALL" | "AVAILABLE" | "UNAVAILABLE">("ALL");

  // Estado do Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [editingGame, setEditingGame] = useState<GameApi | null>(null);
  const [formNome, setFormNome] = useState("");
  const [formCategoria, setFormCategoria] = useState("");
  const [formValorDiaria, setFormValorDiaria] = useState("");
  const [formDisponivel, setFormDisponivel] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchGames = useCallback(async () => {
    try {
      const data = await ApiService.getGames();
      setGames(data);
      applyFilter(searchText, filterMode, data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao carregar jogos";
      Alert.alert("Erro", message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchText, filterMode]);

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchGames();
  };

  const applyFilter = (
    text = searchText,
    mode = filterMode,
    list = games
  ) => {
    let result = list;

    if (mode === "AVAILABLE") {
      result = result.filter((g) => g.disponivel);
    } else if (mode === "UNAVAILABLE") {
      result = result.filter((g) => !g.disponivel);
    }

    if (text.trim()) {
      const query = text.toLowerCase().trim();
      result = result.filter(
        (g) =>
          g.nome.toLowerCase().includes(query) ||
          g.categoria.toLowerCase().includes(query)
      );
    }

    setFilteredGames(result);
  };

  const handleSearchChange = (text: string) => {
    setSearchText(text);
    applyFilter(text, filterMode, games);
  };

  const handleModeChange = (mode: "ALL" | "AVAILABLE" | "UNAVAILABLE") => {
    setFilterMode(mode);
    applyFilter(searchText, mode, games);
  };

  const handleOpenAddModal = () => {
    setEditingGame(null);
    setFormNome("");
    setFormCategoria("");
    setFormValorDiaria("");
    setFormDisponivel(true);
    setModalVisible(true);
  };

  const handleOpenEditModal = (game: GameApi) => {
    setEditingGame(game);
    setFormNome(game.nome);
    setFormCategoria(game.categoria);
    setFormValorDiaria(String(game.valor_diaria));
    setFormDisponivel(game.disponivel);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setEditingGame(null);
  };

  const handleSaveGame = async () => {
    const nome = formNome.trim();
    const categoria = formCategoria.trim();
    const valorNum = parseFloat(formValorDiaria.replace(",", "."));

    if (!nome || !categoria) {
      Alert.alert("Atenção", "Preencha o nome e a categoria do jogo.");
      return;
    }

    if (isNaN(valorNum) || valorNum <= 0) {
      Alert.alert("Atenção", "Informe um valor de diária válido e maior que zero.");
      return;
    }

    setSubmitting(true);
    try {
      if (editingGame) {
        await ApiService.updateGame(editingGame.id, {
          nome,
          categoria,
          valor_diaria: valorNum.toFixed(2),
          disponivel: formDisponivel,
        });
        Alert.alert("Sucesso", "Jogo atualizado com sucesso!");
      } else {
        await ApiService.createGame({
          nome,
          categoria,
          valor_diaria: valorNum.toFixed(2),
          disponivel: formDisponivel,
        });
        Alert.alert("Sucesso", "Jogo cadastrado com sucesso!");
      }
      handleCloseModal();
      fetchGames();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao salvar jogo";
      Alert.alert("Erro", message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteGame = (game: GameApi) => {
    Alert.alert(
      "Confirmar exclusão",
      `Deseja realmente excluir o jogo "${game.nome}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              await ApiService.deleteGame(game.id);
              fetchGames();
            } catch (err: unknown) {
              const msg = err instanceof Error ? err.message : String(err);
              if (/foreign key|violates|constraint/i.test(msg)) {
                Alert.alert(
                  "Não é possível excluir",
                  "Este jogo possui locações registradas no sistema."
                );
              } else {
                Alert.alert("Erro ao excluir", msg);
              }
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Barra do Topo com Busca */}
      <View style={styles.topBar}>
        <View style={styles.searchWrap}>
          <Feather name="search" size={18} color="#8a8f98" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nome ou categoria..."
            placeholderTextColor="#6b7280"
            value={searchText}
            onChangeText={handleSearchChange}
            clearButtonMode="while-editing"
          />
        </View>

        <TouchableOpacity
          style={styles.btnAdd}
          onPress={handleOpenAddModal}
          activeOpacity={0.8}
        >
          <Feather name="plus" size={18} color="#ffffff" />
          <Text style={styles.btnAddText}>Novo</Text>
        </TouchableOpacity>
      </View>

      {/* Filtros de Status */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterChip, filterMode === "ALL" && styles.filterChipActive]}
          onPress={() => handleModeChange("ALL")}
        >
          <Text
            style={[
              styles.filterChipText,
              filterMode === "ALL" && styles.filterChipTextActive,
            ]}
          >
            Todos ({games.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterChip,
            filterMode === "AVAILABLE" && styles.filterChipActive,
          ]}
          onPress={() => handleModeChange("AVAILABLE")}
        >
          <Text
            style={[
              styles.filterChipText,
              filterMode === "AVAILABLE" && styles.filterChipTextActive,
            ]}
          >
            Disponíveis
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterChip,
            filterMode === "UNAVAILABLE" && styles.filterChipActive,
          ]}
          onPress={() => handleModeChange("UNAVAILABLE")}
        >
          <Text
            style={[
              styles.filterChipText,
              filterMode === "UNAVAILABLE" && styles.filterChipTextActive,
            ]}
          >
            Alugados
          </Text>
        </TouchableOpacity>
      </View>

      {/* Lista ou Loading */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#7965DB" />
          <Text style={styles.loadingText}>Carregando jogos...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredGames}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <CardGame
              game={item}
              onEdit={handleOpenEditModal}
              onDelete={handleDeleteGame}
            />
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
              <Feather name="box" size={48} color="#353b4b" />
              <Text style={styles.emptyTitle}>Nenhum jogo encontrado</Text>
              <Text style={styles.emptySubtitle}>
                {searchText
                  ? "Tente buscar com outros termos."
                  : "Toque em '+ Novo' para cadastrar seu primeiro jogo no acervo."}
              </Text>
            </View>
          }
        />
      )}

      {/* Modal de Cadastro / Edição */}
      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingGame ? "Editar Jogo" : "Novo Jogo"}
              </Text>
              <TouchableOpacity onPress={handleCloseModal} activeOpacity={0.7}>
                <Feather name="x" size={22} color="#8a8f98" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.label}>Nome do Jogo *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Catan, Dixit, Ticket to Ride"
                placeholderTextColor="#525866"
                value={formNome}
                onChangeText={setFormNome}
              />

              <Text style={styles.label}>Categoria *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Estratégia, Party, RPG, Cartas"
                placeholderTextColor="#525866"
                value={formCategoria}
                onChangeText={setFormCategoria}
              />

              <Text style={styles.label}>Valor da Diária (R$) *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: 25.00"
                placeholderTextColor="#525866"
                keyboardType="numeric"
                value={formValorDiaria}
                onChangeText={setFormValorDiaria}
              />

              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Disponível para locação</Text>
                <Switch
                  value={formDisponivel}
                  onValueChange={setFormDisponivel}
                  trackColor={{ false: "#353b4b", true: "#7965DB" }}
                  thumbColor={formDisponivel ? "#ffffff" : "#8a8f98"}
                />
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnCancel]}
                onPress={handleCloseModal}
                disabled={submitting}
              >
                <Text style={styles.modalBtnCancelText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnSave]}
                onPress={handleSaveGame}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.modalBtnSaveText}>
                    {editingGame ? "Atualizar" : "Cadastrar"}
                  </Text>
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
  filterRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    backgroundColor: "#0f1115",
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#161922",
    borderWidth: 1,
    borderColor: "#252936",
  },
  filterChipActive: {
    backgroundColor: "#7965DB25",
    borderColor: "#7965DB",
  },
  filterChipText: {
    color: "#8a8f98",
    fontSize: 12,
    fontWeight: "600",
  },
  filterChipTextActive: {
    color: "#a594f9",
    fontWeight: "700",
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
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#cbd5e1",
    marginTop: 8,
    marginBottom: 4,
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
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingVertical: 4,
  },
  switchLabel: {
    fontSize: 14,
    color: "#cbd5e1",
    fontWeight: "600",
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
  modalBtnSaveText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 13,
  },
});
