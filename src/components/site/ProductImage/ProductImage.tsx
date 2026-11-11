import type { SiteProduct } from "@/types";

/** A pack's first picture, or (until its pictures are added) a plain coloured card with its name. */
export default function ProductImage({ product }: { product: SiteProduct }) {
  const first = product.images[0];
  if (first) return <img src={first.url} alt={first.alt} />;
  return (
    <div className="no-pic" role="img" aria-label={product.title}>
      <span>{product.title}</span>
    </div>
  );
}
