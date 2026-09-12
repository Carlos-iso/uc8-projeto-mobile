export interface Rentals {
  id: string; // Identificador único do aluguel
  customer_id: string; // Referência ao cliente que realizou o aluguel
  game_id: string; // Referência ao jogo alugado
  pickup_date: Date; // Data em que o cliente retirou o jogo
  expected_return_date: Date; // Data prevista para devolução do jogo
  total_price: string; // Valor total do aluguel — pg retorna NUMERIC como string
}
