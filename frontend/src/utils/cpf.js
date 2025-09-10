// Padrão canônico do CPF com pontuação
export const CPF_REGEX = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;

// Converte uma entrada para o formato 000.000.000-00 (retorna null se incompleto)
export function toFormattedCpf(input) {
  if (!input) return null;
  const d = String(input).replace(/\D/g, '').slice(0, 11);
  if (d.length !== 11) return null;
  return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6,9)}-${d.slice(9)}`;
}

// Normaliza um CPF: se já estiver no padrão, mantém; senão tenta formatar
export function normalizeCpf(input) {
  if (!input) return null;
  const s = String(input);
  if (CPF_REGEX.test(s)) return s;
  return toFormattedCpf(s);
}

// Máscara progressiva enquanto digita
export function maskCpf(value) {
  const digits = String(value || '').replace(/\D/g, '').slice(0, 11);
  const len = digits.length;
  if (len <= 3) return digits;
  if (len <= 6) return `${digits.slice(0,3)}.${digits.slice(3)}`;
  if (len <= 9) return `${digits.slice(0,3)}.${digits.slice(3,6)}.${digits.slice(6)}`;
  return `${digits.slice(0,3)}.${digits.slice(3,6)}.${digits.slice(6,9)}-${digits.slice(9)}`;
}
