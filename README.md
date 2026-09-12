# uc8-projeto-mobile

Aplicativo mobile da UC8, por Carlos Siqueira. Recorte do sistema Ludora, da UC5.

## Recorte — Entidades

### Customers (Clientes)
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | `string` | Identificador do cliente |
| `name` | `string` | Nome do cliente |
| `cpf` | `string` | CPF do cliente |
| `phone` | `string` | Telefone do cliente |

### Games (Jogos)
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | `string` | Identificador do jogo |
| `name` | `string` | Nome do jogo |
| `category` | `string` | Categoria do jogo |
| `daily_rate` | `string` | Valor da diária (NUMERIC retornado como string pelo pg) |
| `available` | `boolean` | Disponibilidade para locação |

### Rentals (Aluguéis)
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | `string` | Identificador do aluguel |
| `customer_id` | `string` | Referência ao cliente |
| `game_id` | `string` | Referência ao jogo |
| `pickup_date` | `Date` | Data de retirada |
| `expected_return_date` | `Date` | Data prevista de devolução |
| `total_price` | `string` | Valor total (NUMERIC retornado como string pelo pg) |

## Recorte — Telas

> [!NOTE]
> A ser adicionado nas próximas versões

## Versionamento

| Versão | Descrição |
|--------|-----------|
| `0.0.0` | Initial commit |
| `0.0.1` | Add README |
| `0.0.2` | Add types do recorte |
| `0.0.3+` | Telas (cada tela = uma versão) |

## Stack

- React Native + Expo
- TypeScript