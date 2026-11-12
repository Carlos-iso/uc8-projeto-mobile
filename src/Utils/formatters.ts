/**
 * Funções utilitárias de formatação e máscaras para inputs e exibição de dados.
 */

/**
 * Remove todos os caracteres não numéricos.
 */
export function stripNonDigits(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * Formata um CPF no padrão: 000.000.000-00
 * Limita a 11 dígitos numéricos.
 */
export function formatCpf(value: string): string {
  const digits = stripNonDigits(value).slice(0, 11);

  if (digits.length <= 3) return digits;
  if (digits.length <= 6) {
    return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  }
  if (digits.length <= 9) {
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  }
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
}

/**
 * Formata um telefone no padrão brasileiro:
 * - Fixo: (XX) XXXX-XXXX (10 dígitos)
 * - Celular: (XX) XXXXX-XXXX (11 dígitos)
 * Limita a 11 dígitos numéricos.
 */
export function formatPhone(value: string): string {
  const digits = stripNonDigits(value).slice(0, 11);

  if (!digits) return "";
  if (digits.length <= 2) {
    return `(${digits}`;
  }
  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }
  if (digits.length <= 10) {
    // Formato telefone fixo: (XX) XXXX-XXXX
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  // Formato celular: (XX) XXXXX-XXXX
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}

/**
 * Formata um input monetário em tempo real (estilo caixa eletrônico).
 * Cada dígito inserido entra como centavo.
 * Exemplo: "1" -> "0,01" | "150" -> "1,50" | "1500" -> "15,00"
 */
export function formatCurrencyInput(value: string): string {
  const digits = stripNonDigits(value);
  if (!digits) return "";

  const num = parseInt(digits, 10) / 100;
  return num.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Converte um valor monetário de input formatado ("15,00") para number (15).
 */
export function parseCurrencyInput(value: string): number {
  const digits = stripNonDigits(value);
  if (!digits) return 0;
  return parseInt(digits, 10) / 100;
}

/**
 * Converte um número ou string vindo do banco/API ("15.00" ou 15)
 * para a representação do input formatado ("15,00").
 */
export function formatNumberToCurrencyInput(val: number | string | undefined | null): string {
  if (val === undefined || val === null || val === "") return "";
  const num = typeof val === "number" ? val : parseFloat(String(val).replace(",", "."));
  if (isNaN(num)) return "";
  return num.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

