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

/**
 * Formata uma data no padrão brasileiro (ex.: 30/07/2026).
 *
 * Datas "YYYY-MM-DD" são tratadas como data local para não deslocar o dia:
 * `new Date("2026-07-05")` é meia-noite UTC e, em fusos negativos (Brasil),
 * cairia no dia anterior. Strings com hora (ISO completo) usam o fuso local.
 */
export function formatDateBR(iso: string) {
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  const date = dateOnly
    ? new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]))
    : new Date(iso);

  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
