// Configuração e chamadas de API para o backend Ludora

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL?.replace(/\/+$/, '') ||
  'https://uc5-projeto-desktop-api.onrender.com';

export interface CustomerApi {
  id: string;
  nome: string;
  cpf: string;
  telefone: string;
}

export interface GameApi {
  id: string;
  nome: string;
  categoria: string;
  valor_diaria: string;
  disponivel: boolean;
}

export interface RentalApi {
  id: string;
  id_cliente: string;
  id_jogo: string;
  data_retirada: string;
  data_devolucao_prevista: string;
  valor_total: string;
}

export interface RentalWithDetails extends RentalApi {
  cliente_nome?: string;
  cliente_cpf?: string;
  jogo_nome?: string;
  jogo_categoria?: string;
}

export interface CreateCustomerDto {
  nome: string;
  cpf: string;
  telefone: string;
}

export interface UpdateCustomerDto {
  nome?: string;
  cpf?: string;
  telefone?: string;
}

export interface CreateGameDto {
  nome: string;
  categoria: string;
  valor_diaria: string;
  disponivel?: boolean;
}

export interface UpdateGameDto {
  nome?: string;
  categoria?: string;
  valor_diaria?: string;
  disponivel?: boolean;
}

export interface CreateRentalDto {
  id_cliente: string;
  id_jogo: string;
  data_retirada: string;
  data_devolucao_prevista: string;
  valor_total: string;
}

export interface UpdateRentalDto {
  id_cliente?: string;
  id_jogo?: string;
  data_retirada?: string;
  data_devolucao_prevista?: string;
  valor_total?: string;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  timeoutMs = 15000
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      ...options,
      signal: options.signal || controller.signal,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    clearTimeout(timeoutId);

    if (res.status === 204) {
      return undefined as T;
    }

    if (!res.ok) {
      let errorMsg = `Erro ${res.status}`;
      try {
        const errorData = await res.json();
        errorMsg = errorData.message || errorData.error || errorMsg;
      } catch {
        const text = await res.text().catch(() => '');
        if (text) errorMsg = text;
      }
      throw new Error(errorMsg);
    }

    return (await res.json()) as T;
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    if (err instanceof Error) {
      if (err.name === 'AbortError') {
        throw new Error('Tempo de requisição esgotado (timeout). A API pode estar acordando.');
      }
      throw err;
    }
    throw new Error(String(err));
  }
}

export const ApiService = {
  /**
   * Health check para validar se o backend está acordado e respondendo
   */
  async checkHealth(timeoutMs = 8000): Promise<boolean> {
    try {
      const data = await request<{ status: string }>('/health', { method: 'GET' }, timeoutMs);
      return data?.status === 'ok';
    } catch {
      return false;
    }
  },

  // ── Clientes ─────────────────────────────────────────────────────────────
  async getCustomers(): Promise<CustomerApi[]> {
    return request<CustomerApi[]>('/customers');
  },

  async createCustomer(data: CreateCustomerDto): Promise<CustomerApi> {
    return request<CustomerApi[]>('/customers', {
      method: 'POST',
      body: JSON.stringify(data),
    }) as unknown as Promise<CustomerApi>;
  },

  async updateCustomer(id: string, data: UpdateCustomerDto): Promise<CustomerApi> {
    return request<CustomerApi>(`/customers/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async deleteCustomer(id: string): Promise<void> {
    return request<void>(`/customers/${id}`, {
      method: 'DELETE',
    });
  },

  // ── Jogos ────────────────────────────────────────────────────────────────
  async getGames(): Promise<GameApi[]> {
    return request<GameApi[]>('/games');
  },

  async createGame(data: CreateGameDto): Promise<GameApi> {
    return request<GameApi>('/games', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateGame(id: string, data: UpdateGameDto): Promise<GameApi> {
    return request<GameApi>(`/games/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async deleteGame(id: string): Promise<void> {
    return request<void>(`/games/${id}`, {
      method: 'DELETE',
    });
  },

  // ── Locações ─────────────────────────────────────────────────────────────
  async getRentals(): Promise<RentalApi[]> {
    return request<RentalApi[]>('/rentals');
  },

  /**
   * Busca rentals e junta os dados com clientes e jogos (equivalente ao LEFT JOIN do Desktop)
   */
  async getRentalsJoined(): Promise<RentalWithDetails[]> {
    const [rentals, customers, games] = await Promise.all([
      this.getRentals().catch(() => []),
      this.getCustomers().catch(() => []),
      this.getGames().catch(() => []),
    ]);

    const customerMap = new Map(customers.map((c) => [c.id, c]));
    const gameMap = new Map(games.map((g) => [g.id, g]));

    return rentals.map((r) => {
      const c = customerMap.get(r.id_cliente);
      const g = gameMap.get(r.id_jogo);
      return {
        ...r,
        cliente_nome: c?.nome,
        cliente_cpf: c?.cpf,
        jogo_nome: g?.nome,
        jogo_categoria: g?.categoria,
      };
    });
  },

  async createRental(data: CreateRentalDto): Promise<RentalApi> {
    return request<RentalApi>('/rentals', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateRental(id: string, data: UpdateRentalDto): Promise<RentalApi> {
    return request<RentalApi>(`/rentals/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async deleteRental(id: string): Promise<void> {
    return request<void>(`/rentals/${id}`, {
      method: 'DELETE',
    });
  },
};
