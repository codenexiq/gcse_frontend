"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import styles from "./Button.module.css";

const MotionLink = motion.create(Link);

interface ButtonProps {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "dark" | "soft" | "brand" | "outline";
  /** Optional fixed height/padding: sm 36px, md 44px, lg 48px. */
  size?: "sm" | "md" | "lg";
  /** Stretch to the full width of its container. */
  fullWidth?: boolean;
  /** Lucide elements, e.g. icon={<Plus />} */
  icon?: ReactNode;
  iconRight?: ReactNode;
  /** Renders a link that looks like a button */
  href?: string;
  type?: "button" | "submit";
  disabled?: boolean;
  onClick?: () => void;
}

export default function Button({
  children,
  variant = "primary",
  fullWidth = false,
  size,
  icon,
  iconRight,
  href,
  type = "button",
  disabled,
  onClick,
}: ButtonProps) {
  const className = `${styles.button} ${styles[variant]} ${size ? styles[size] : ""} ${fullWidth ? styles.full : ""}`;
  const motionProps = { whileHover: { scale: 1.03 }, whileTap: { scale: 0.97 } };
  const content = (
    <>
      {icon}
      {children}
      {iconRight}
    </>
  );

  if (href) {
    return (
      <MotionLink href={href} className={className} {...motionProps}>
        {content}
      </MotionLink>
    );
  }
  return (
    <motion.button
      type={type}
      className={className}
      disabled={disabled}
      onClick={onClick}
      {...motionProps}
    >
      {content}
    </motion.button>
  );
}
