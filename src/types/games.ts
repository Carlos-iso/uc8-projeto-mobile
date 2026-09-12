export interface Games {
  id: string; // Identificador único do jogo
  name: string; // Nome do jogo
  category: string; // Categoria do jogo (ex: estratégia, RPG, party)
  daily_rate: string; // Valor da diária de locação — pg retorna NUMERIC como string
  available: boolean; // Indica se o jogo está disponível para locação
}
