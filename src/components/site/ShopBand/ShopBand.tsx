import Link from "next/link";
import SiteIcon from "@/components/site/SiteIcon";
import ProductImage from "@/components/site/ProductImage";
import type { SiteProduct } from "@/types";

/** The home page's "Resources shop" teaser: a card for each revision pack. */
export default function ShopBand({ products }: { products: SiteProduct[] }) {
  if (products.length === 0) return null;
  return (
    <section className="band">
      <div className="in">
        <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32 }}>
          <div className="head" style={{ margin: 0 }}>
            <span className="eyebrow">Resources shop</span>
            <h2>Revision packs made by our tutors</h2>
          </div>
          <Link className="link" href="/shop">
            Visit the shop <SiteIcon name="arrow" size={16} />
          </Link>
        </div>
        <div className="home-shop">
          {products.map((p) => (
            <Link key={p.id} className="hs-card" href="/shop">
              <div className="hs-img"><ProductImage product={p} /></div>
              <div className="stack" style={{ gap: 8, padding: 20, flex: 1 }}>
                <span className="small muted">{p.eyebrow.split(" · ")[1] ?? p.eyebrow}</span>
                <h3>{p.title}</h3>
                <p className="small muted">{p.lead.split(". ")[0]}.</p>
                <div className="row" style={{ justifyContent: "space-between", marginTop: "auto", paddingTop: 6 }}>
                  <span className="pc-price">{p.price}</span>
                  <span className="btn sm solid">View bundle</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
