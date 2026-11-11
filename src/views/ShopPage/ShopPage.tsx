import Link from "next/link";
import PageHead from "@/components/site/PageHead";
import ShopPicker from "@/components/site/ShopPicker";
import ProductSection from "@/components/site/ProductSection";
import { getProducts } from "@/services/siteService/siteService.server";
import { orEmpty } from "@/lib/siteData";

export default async function ShopPage() {
  const products = await orEmpty(getProducts(), []);
  return (
    <>
      <PageHead eyebrow="Resources shop" title="Revision resources made by our tutors" lead="The same notes, slides and exam practice we use in lessons, ready to download." />
      {products.length > 0 && (
        <section className="band tight" style={{ paddingBottom: 0 }}>
          <div className="in"><ShopPicker products={products} /></div>
        </section>
      )}
      {products.map((p, i) => (
        <ProductSection key={p.id} product={p} alt={i % 2 === 1} />
      ))}
      <section className="band tight">
        <div className="in">
          <div className="shop-soon" style={{ marginTop: 0 }}>
            <div>
              <b>More packs coming soon</b>
              <p className="small muted">GCSE Chemistry and Biology bundles are in the works.</p>
            </div>
            <Link className="btn" href="/#contact">Tell me when they launch</Link>
          </div>
        </div>
      </section>
    </>
  );
}
