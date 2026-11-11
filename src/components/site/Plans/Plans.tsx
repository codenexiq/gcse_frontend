import Link from "next/link";
import { PLANS } from "@/lib/siteContent";
import SiteIcon from "@/components/site/SiteIcon";

/** The three plans. Prices are agreed at the free consultation. */
export default function Plans() {
  return (
    <div className="plans">
      {PLANS.map((p) => (
        <div key={p.name} className={`plan${p.popular ? " pop" : ""}`}>
          {p.popular && <span className="ribbon">Most popular</span>}
          <div>
            <h3>{p.name}</h3>
            <p className="small muted">{p.text}</p>
          </div>
          <span className="price">Price on consultation</span>
          <ul>
            {p.features.map((f) => (
              <li key={f}>
                <SiteIcon name="check" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
          <Link className={`btn${p.popular ? " solid" : ""}`} href="/#contact">Book a free consultation</Link>
        </div>
      ))}
    </div>
  );
}
