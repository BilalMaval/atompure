export function generateSku(name: string): string {
  const words = name
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 4)
    .map((w) => w.slice(0, 4));
  return words.length ? "AP-" + words.join("-") : "";
}

export function generateVariantSku(productSku: string, variantName: string): string {
  const suffix = variantName
    .toUpperCase()
    .replace(/[^A-Z0-9\s/\-]/g, " ")
    .trim()
    .split(/[\s/\-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w.slice(0, 4))
    .join("-");
  return suffix ? (productSku ? `${productSku}-${suffix}` : suffix) : productSku;
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
