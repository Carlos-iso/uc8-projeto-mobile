import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { ApiService, CustomerApi } from "@/Services/api";
import CardCustomer from "@/Components/CardCustomer";

export default function Customers() {
  const [customers, setCustomers] = useState<CustomerApi[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<CustomerApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState("");

  // Estado do Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<CustomerApi | null>(null);
  const [formNome, setFormNome] = useState("");
  const [formCpf, setFormCpf] = useState("");
  const [formTelefone, setFormTelefone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchCustomers = useCallback(async () => {
    try {
      const data = await ApiService.getCustomers();
      setCustomers(data);
      applyFilter(searchText, data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao carregar clientes";
      Alert.alert("Erro", message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchText]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchCustomers();
  };

  const applyFilter = (text: string, list = customers) => {
    setSearchText(text);
    if (!text.trim()) {
      setFilteredCustomers(list);
      return;
    }
    const query = text.toLowerCase().trim();
    const filtered = list.filter(
      (c) =>
        c.nome.toLowerCase().includes(query) ||
        c.cpf.toLowerCase().includes(query) ||
        c.telefone.includes(query)
    );
    setFilteredCustomers(filtered);
  };

  const handleOpenAddModal = () => {
    setEditingCustomer(null);
    setFormNome("");
    setFormCpf("");
    setFormTelefone("");
    setModalVisible(true);
  };

  const handleOpenEditModal = (customer: CustomerApi) => {
    setEditingCustomer(customer);
    setFormNome(customer.nome);
    setFormCpf(customer.cpf);
    setFormTelefone(customer.telefone);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setEditingCustomer(null);
  };

  const handleSaveCustomer = async () => {
    const nome = formNome.trim();
    const cpf = formCpf.trim();
    const telefone = formTelefone.trim();

    if (!nome || !cpf || !telefone) {
      Alert.alert("Atenção", "Preencha todos os campos obrigatórios.");
      return;
    }

    setSubmitting(true);
    try {
      if (editingCustomer) {
        await ApiService.updateCustomer(editingCustomer.id, {
          nome,
          cpf,
          telefone,
        });
        Alert.alert("Sucesso", "Cliente atualizado com sucesso!");
      } else {
        await ApiService.createCustomer({
          nome,
          cpf,
          telefone,
        });
        Alert.alert("Sucesso", "Cliente cadastrado com sucesso!");
      }
      handleCloseModal();
      fetchCustomers();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao salvar cliente";
      Alert.alert("Erro", message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCustomer = (customer: CustomerApi) => {
    Alert.alert(
      "Confirmar exclusão",
      `Deseja realmente excluir o cliente "${customer.nome}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              await ApiService.deleteCustomer(customer.id);
              fetchCustomers();
            } catch (err: unknown) {
              const msg = err instanceof Error ? err.message : String(err);
              if (/foreign key|violates|constraint/i.test(msg)) {
                Alert.alert(
                  "Não é possível excluir",
                  "Este cliente possui locações associadas no sistema."
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
      {/* Barra de Ações do Topo */}
      <View style={styles.topBar}>
        <View style={styles.searchWrap}>
          <Feather name="search" size={18} color="#8a8f98" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nome ou CPF..."
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
          <Text style={styles.btnAddText}>Novo</Text>
        </TouchableOpacity>
      </View>

      {/* Lista ou Loading */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#7965DB" />
          <Text style={styles.loadingText}>Carregando clientes...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredCustomers}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <CardCustomer
              customer={item}
              onEdit={handleOpenEditModal}
              onDelete={handleDeleteCustomer}
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
              <Feather name="users" size={48} color="#353b4b" />
              <Text style={styles.emptyTitle}>Nenhum cliente encontrado</Text>
              <Text style={styles.emptySubtitle}>
                {searchText
                  ? "Tente buscar com outros termos."
                  : "Toque em '+ Novo' para cadastrar seu primeiro cliente."}
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
                {editingCustomer ? "Editar Cliente" : "Novo Cliente"}
              </Text>
              <TouchableOpacity onPress={handleCloseModal} activeOpacity={0.7}>
                <Feather name="x" size={22} color="#8a8f98" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.label}>Nome Completo *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: João da Silva"
                placeholderTextColor="#525866"
                value={formNome}
                onChangeText={setFormNome}
              />

              <Text style={styles.label}>CPF *</Text>
              <TextInput
                style={styles.input}
                placeholder="000.000.000-00"
                placeholderTextColor="#525866"
                keyboardType="numeric"
                maxLength={14}
                value={formCpf}
                onChangeText={setFormCpf}
              />

              <Text style={styles.label}>Telefone *</Text>
              <TextInput
                style={styles.input}
                placeholder="(00) 00000-0000"
                placeholderTextColor="#525866"
                keyboardType="phone-pad"
                value={formTelefone}
                onChangeText={setFormTelefone}
              />
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
                onPress={handleSaveCustomer}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.modalBtnSaveText}>
                    {editingCustomer ? "Atualizar" : "Cadastrar"}
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
