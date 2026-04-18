// ─────────────────────────────────────────────
// HELPER — resolveVariantImages()
//
//  Returns variant-specific images if they exist,
//  otherwise falls back to the parent product images.
//  Use this in your Express route / service layer.
// ─────────────────────────────────────────────

type ImageRow = {
  id: number;
  url: string;
  altText: string | null;
  isPrimary: boolean;
  sortOrder: number;
}

export function resolveVariantImages(
  variantImage: ImageRow[],
  productImages: ImageRow[]
): { images: ImageRow[], source: "variant" | "product" } {
  const sorted = (imgs: ImageRow[]) => [...imgs].sort((a, b) => a.sortOrder - b.sortOrder)

  if (variantImage.length > 0) {
    return {
      images: sorted(variantImage),
      source: "variant"
    }
  }

  return {
    images: sorted(productImages),
    source: "product"
  }
}