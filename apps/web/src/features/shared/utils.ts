export function toDateTimeLocalValue(date: Date = new Date()) {
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

/** Formata um valor numérico como Real brasileiro (ex.: R$ 1.234,56). */
export function formatBRL(value: number) {
  return currencyFormatter.format(value);
}

/** Formata uma data ISO no padrão brasileiro (ex.: 30/07/2026). */
export function formatDateBR(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
