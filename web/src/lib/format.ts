const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

export function formatPrice(value: number | null): string {
  if (value === null) return "Price to be confirmed";
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    throw new Error("Price must be null or a finite, non-negative number");
  }
  return inrFormatter.format(value);
}
