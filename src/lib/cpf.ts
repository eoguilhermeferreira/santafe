/**
 * Validação real de CPF (dígitos verificadores), não só contagem de 11
 * dígitos — pra não deixar passar número inventado tipo "11111111111".
 */
export function isValidCpf(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  if (digits.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(digits)) return false;

  for (const length of [9, 10]) {
    let sum = 0;
    for (let i = 0; i < length; i++) {
      sum += Number(digits[i]) * (length + 1 - i);
    }
    const checkDigit = ((sum * 10) % 11) % 10;
    if (checkDigit !== Number(digits[length])) return false;
  }

  return true;
}
