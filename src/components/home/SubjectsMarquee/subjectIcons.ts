import { Atom, BookOpen, Calculator, Code, Dna, FlaskConical, Globe, Landmark, PenLine, type LucideIcon } from "lucide-react";

// Which icon to show for each subject (matched by the subject's slug).
const icons: Record<string, LucideIcon> = {
  maths: Calculator,
  "english-language": PenLine,
  "english-literature": BookOpen,
  biology: Dna,
  chemistry: FlaskConical,
  physics: Atom,
  "computer-science": Code,
  history: Landmark,
  geography: Globe,
};

export const subjectIcon = (slug: string): LucideIcon => icons[slug] ?? BookOpen;
