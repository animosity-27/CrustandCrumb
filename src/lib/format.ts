export function formatPeso(amount: number): string {
  return '₱' + amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function formatPesoShort(amount: number): string {
  return '₱' + Math.round(amount).toLocaleString('en-PH');
}
