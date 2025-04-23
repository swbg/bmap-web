export function formatPrice(price: number) {
  return `${Math.floor(price / 100)},${("00" + (price % 100)).slice(-2)}€`;
}
