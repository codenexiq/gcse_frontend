"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import SiteIcon from "@/components/site/SiteIcon";
import type { SiteProduct } from "@/types";

function Ticks({ items, icon = "check" }: { items: string[]; icon?: string }) {
  return (
    <ul className="ticks">
      {items.map((t) => (
        <li key={t}>
          <SiteIcon name={icon} />
          <span>{t}</span>
        </li>
      ))}
    </ul>
  );
}

/** One revision pack: a picture carousel (swipe, arrows or thumbnails) and everything about the pack. */
export default function ProductSection({ product: p, alt }: { product: SiteProduct; alt: boolean }) {
  const [at, setAt] = useState(0);
  const [note, setNote] = useState(false);
  const touchX = useRef<number | null>(null);
  const n = p.images.length;
  const go = (k: number) => setAt((((k % n) + n) % n));

  return (
    <section className={`band${alt ? " sky" : ""}`} id={`p-${p.slug}`}>
      <div className="in">
        <div className="product">
          <div
            className="carousel"
            tabIndex={0}
            aria-roledescription="carousel"
            aria-label={`${p.title} images`}
            onKeyDown={(e) => {
              if (n < 2) return;
              if (e.key === "ArrowRight") go(at + 1);
              if (e.key === "ArrowLeft") go(at - 1);
            }}
          >
            <div
              className="slides"
              onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
              onTouchEnd={(e) => {
                if (touchX.current === null || n < 2) return;
                const dx = e.changedTouches[0].clientX - touchX.current;
                touchX.current = null;
                if (Math.abs(dx) > 40) go(at + (dx < 0 ? 1 : -1));
              }}
            >
              {n === 0 ? (
                <div className="no-pic" role="img" aria-label={p.title}><span>{p.title}</span></div>
              ) : (
                <>
                  <span className="count-tag">{at + 1} / {n}</span>
                  {p.images.map((img, j) => (
                    <img key={img.url} src={img.url} alt={img.alt} className={j === at ? "on" : ""} aria-hidden={j === at ? undefined : true} />
                  ))}
                  {n > 1 && (
                    <>
                      <button type="button" className="snav prev" aria-label="Previous image" onClick={() => go(at - 1)}><SiteIcon name="arrow" /></button>
                      <button type="button" className="snav next" aria-label="Next image" onClick={() => go(at + 1)}><SiteIcon name="arrow" /></button>
                    </>
                  )}
                </>
              )}
            </div>
            {n > 1 && (
              <div className="thumbs" style={{ gridTemplateColumns: `repeat(${n},minmax(0,84px))` }}>
                {p.images.map((img, j) => (
                  <button key={img.url} type="button" aria-current={j === at} aria-label={`Show image ${j + 1}`} onClick={() => go(j)}>
                    <img src={img.url} alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="pinfo">
            <div className="stack" style={{ gap: 10 }}>
              <span className="eyebrow">{p.eyebrow}</span>
              <h2>{p.title}</h2>
              <p className="lead">{p.lead}</p>
            </div>
            <div className="price-row">
              <span className="price-big">{p.price}</span>
              <span className="badge-y">Whole bundle</span>
              <span className="small muted">Instant digital access</span>
            </div>
            <div className="row">
              <button type="button" className="btn solid" onClick={() => setNote(true)}>Buy the bundle · {p.price}</button>
              <Link className="link" href="/#contact">Questions? Get in touch</Link>
            </div>
            {note && <p className="buy-note">Online checkout is not switched on yet. Please get in touch and we will send you the bundle.</p>}
            <div className="stack" style={{ gap: 10 }}>
              <b>{p.tagsTitle}</b>
              <div className="topics8">
                {p.tags.map((t) => <span key={t}>{t}</span>)}
              </div>
            </div>
            <div className="stack" style={{ gap: 10 }}>
              <h3>What’s included</h3>
              <Ticks items={p.included} />
            </div>
            <div className="pcols">
              <div className="pbox a"><b>Perfect for</b><Ticks items={p.perfect} /></div>
              <div className="pbox b"><b>Why students love it</b><Ticks items={p.why} icon="star" /></div>
            </div>
            <p className="small muted">{p.note}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
