"use client";

import ProductImage from "@/components/site/ProductImage";
import type { SiteProduct } from "@/types";

/** The row of packs at the top of the shop: choosing one scrolls down to it. */
export default function ShopPicker({ products }: { products: SiteProduct[] }) {
  return (
    <div className="shop-pick">
      {products.map((p) => (
        <button key={p.id} type="button" className="pick-card" onClick={() => document.getElementById(`p-${p.slug}`)?.scrollIntoView({ behavior: "smooth" })}>
          <span className="pick-pic"><ProductImage product={p} /></span>
          <span>
            <b>{p.title}</b>
            <span className="small muted">{p.eyebrow.split(" · ")[1] ?? p.eyebrow}</span>
          </span>
          <span className="pc-price">{p.price}</span>
        </button>
      ))}
    </div>
  );
}
