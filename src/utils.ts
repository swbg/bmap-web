export function formatPrice(price: number) {
  return `${Math.floor(price / 100)},${("00" + (price % 100)).slice(-2)}€`;
}

export function formatPhone(p: string) {
  if (p.slice(0, 3) === "089") {
    return "089 " + p.slice(3);
  }
  if (p.slice(0, 2) === "01") {
    return p.slice(0, 4) + " " + p.slice(4);
  }
  return p;
}
