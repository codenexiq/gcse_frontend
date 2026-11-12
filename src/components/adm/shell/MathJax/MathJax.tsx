import { headers } from "next/headers";
import MathJaxLoader from "./MathJaxLoader";

// Draws maths written between dollar signs ($x^2$). It comes from a CDN, which the Content-Security-Policy
// (see src/proxy.ts) allows because the script that adds it carries this page's nonce.
export default async function MathJax() {
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  return <MathJaxLoader nonce={nonce} />;
}
