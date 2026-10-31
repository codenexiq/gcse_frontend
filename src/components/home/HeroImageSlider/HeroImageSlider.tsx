"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type FocusEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { heroSlides } from "./heroSlides";
import styles from "./HeroImageSlider.module.css";

const ROTATION_INTERVAL = 6_500;

/**
 * An accessible carousel: it rotates by itself, pauses on hover/focus, can be paused with a
 * button, and does not rotate at all for visitors who prefer reduced motion.
 */
export default function HeroImageSlider() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const rotationButtonRef = useRef<HTMLButtonElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const activeSlide = heroSlides[activeIndex];

  // Using the keyboard on any control (except play/pause) stops the automatic rotation.
  function pauseWhenNavigating(event: FocusEvent<HTMLDivElement>) {
    if ((event.target as EventTarget) !== rotationButtonRef.current) setAutoRotate(false);
  }

  useEffect(() => {
    if (!autoRotate || isHovered || prefersReducedMotion || heroSlides.length < 2) return;

    const intervalId = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        setActiveIndex((current) => (current + 1) % heroSlides.length);
      }
    }, ROTATION_INTERVAL);

    return () => window.clearInterval(intervalId);
  }, [autoRotate, isHovered, prefersReducedMotion]);

  function selectSlide(index: number) {
    setAutoRotate(false);
    setActiveIndex((index + heroSlides.length) % heroSlides.length);
  }

  if (!activeSlide) return null;

  const reduceMotion = Boolean(prefersReducedMotion);

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="GCSE study stories"
      className={styles.wrap}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocusCapture={pauseWhenNavigating}
    >
      <div className={styles.card}>
        <div className={styles.media}>
          <AnimatePresence initial={false} mode="wait">
            <motion.div
              key={activeSlide.id}
              initial={{ opacity: 0, x: reduceMotion ? 0 : 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: reduceMotion ? 0 : -12 }}
              transition={{ duration: reduceMotion ? 0.12 : 0.3, ease: "easeOut" }}
              className={styles.slide}
              role="group"
              aria-roledescription="slide"
              aria-label={`${activeIndex + 1} of ${heroSlides.length}: ${activeSlide.title}`}
              aria-live={autoRotate && !reduceMotion ? "off" : "polite"}
              aria-atomic="true"
            >
              <Image
                src={activeSlide.image}
                alt={activeSlide.alt}
                fill
                priority={activeIndex === 0}
                sizes="(max-width: 1024px) 100vw, 48vw"
                className={styles.image}
              />
              <span className={styles.kicker}>{activeSlide.kicker}</span>
              <span className={styles.counter}>
                {String(activeIndex + 1).padStart(2, "0")} / {String(heroSlides.length).padStart(2, "0")}
              </span>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className={styles.info}>
          <div className={styles.text}>
            <h2 className={styles.title}>{activeSlide.title}</h2>
            <p className={styles.description}>{activeSlide.description}</p>
          </div>
          <div className={styles.controls}>
            <div className={styles.dots} aria-label="Choose a slide">
              {heroSlides.map((slide, index) => (
                <button
                  key={slide.id}
                  type="button"
                  aria-label={`Show slide ${index + 1}: ${slide.title}`}
                  aria-current={index === activeIndex ? "true" : undefined}
                  onClick={() => selectSlide(index)}
                  className={styles.dotButton}
                >
                  <span className={`${styles.dot} ${index === activeIndex ? styles.dotActive : ""}`} />
                </button>
              ))}
            </div>

            {!reduceMotion && (
              <button
                ref={rotationButtonRef}
                type="button"
                aria-label={autoRotate ? "Pause automatic slide rotation" : "Resume automatic slide rotation"}
                aria-pressed={autoRotate}
                onClick={() => setAutoRotate((playing) => !playing)}
                className={styles.roundButton}
              >
                {autoRotate ? <Pause size={16} aria-hidden="true" /> : <Play size={16} aria-hidden="true" />}
              </button>
            )}
            <button
              type="button"
              aria-label="Previous slide"
              onClick={() => selectSlide(activeIndex - 1)}
              className={styles.roundButton}
            >
              <ChevronLeft size={16} aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label="Next slide"
              onClick={() => selectSlide(activeIndex + 1)}
              className={styles.roundButton}
            >
              <ChevronRight size={16} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
