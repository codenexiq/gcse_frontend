// The wording of the public website that does not change often (courses, plans, how it works...).
// The blog posts, shop packs, tutors and reviews come from the database instead.

export const CONTACT = {
  email: "educatecloud.online@gmail.com",
  phone: "+44 7365 275339",
  place: "From Surrey",
  placeNote: "Teaching online worldwide",
  googleReviewsUrl: "https://share.google/LA6y228BeAzQJ8vG8",
};

export type SubjectKey = "maths" | "physics" | "chemistry" | "biology" | "science";

/** Name and colour of each subject. */
export const SUBJECTS: Record<SubjectKey, { name: string; color: string }> = {
  maths: { name: "Maths", color: "#2B6CB0" },
  physics: { name: "Physics", color: "#6B4FC9" },
  chemistry: { name: "Chemistry", color: "#2E8B66" },
  biology: { name: "Biology", color: "#B4475A" },
  science: { name: "Science", color: "#1F7A8C" },
};

export interface Course {
  subject: SubjectKey;
  /** [strand, what it covers] */
  strands: [string, string][];
}

export interface Level {
  id: string;
  name: string;
  years: string;
  note: string;
  boards: string;
  courses: Course[];
}

export const LEVELS: Level[] = [
  {
    id: "ks3", name: "Key Stage 3", years: "Years 7–9", note: "Build strong foundations before GCSE.", boards: "National Curriculum",
    courses: [
      { subject: "maths", strands: [["Number", "Place value, fractions, decimals, percentages, negative numbers"], ["Algebra", "Expressions, equations, sequences, graphs"], ["Ratio and proportion", "Ratio, scale, rates"], ["Geometry", "Angles, area, perimeter, volume, transformations"], ["Statistics and probability", "Averages, charts, basic probability"]] },
      { subject: "science", strands: [["Biology", "Cells, body systems, reproduction, ecosystems"], ["Chemistry", "Particles, elements and compounds, reactions, acids and alkalis"], ["Physics", "Forces, energy, electricity, light and sound, space"], ["Working scientifically", "Planning experiments, graphs, evaluating results"]] },
    ],
  },
  {
    id: "gcse", name: "GCSE", years: "Years 10–11", note: "Foundation and Higher tier. Combined and Triple Science.", boards: "AQA · Edexcel · OCR",
    courses: [
      { subject: "maths", strands: [["Number", "Fractions, percentages, indices and surds, standard form"], ["Algebra", "Brackets, quadratics, simultaneous equations, sequences, graphs"], ["Ratio and proportion", "Direct and inverse proportion, compound interest"], ["Geometry and measures", "Pythagoras, trigonometry, circle theorems, vectors"], ["Probability", "Tree and Venn diagrams"], ["Statistics", "Averages, histograms, box plots, cumulative frequency"]] },
      { subject: "physics", strands: [["Energy", "Stores, power, efficiency"], ["Electricity", "Circuits, resistance, mains electricity"], ["Particle model", "Density, changes of state, gas pressure"], ["Atomic structure", "Radioactive decay, half-life"], ["Forces", "Newton's laws, momentum, motion graphs"], ["Waves and magnetism", "EM spectrum, motors, generators"]] },
      { subject: "chemistry", strands: [["Atomic structure and the periodic table", "Atoms, isotopes, groups"], ["Bonding", "Ionic, covalent and metallic structure"], ["Quantitative chemistry", "Moles, concentrations, yields"], ["Chemical and energy changes", "Reactivity, electrolysis, exo and endothermic"], ["Rates and equilibrium", "Collision theory, Le Chatelier"], ["Organic chemistry and analysis", "Hydrocarbons, tests for ions"]] },
      { subject: "biology", strands: [["Cell biology", "Cell structure, division, transport"], ["Organisation", "Digestion, the heart, plant tissues"], ["Infection and response", "Pathogens, immunity, vaccines"], ["Bioenergetics", "Photosynthesis, respiration"], ["Homeostasis and response", "Nervous system, hormones"], ["Inheritance and ecology", "DNA, evolution, ecosystems"]] },
    ],
  },
  {
    id: "alevel", name: "A-level", years: "Years 12–13", note: "For students aiming for A and A*.", boards: "AQA · Edexcel · OCR",
    courses: [
      { subject: "maths", strands: [["Pure", "Proof, functions, trigonometry, differentiation, integration"], ["Statistics", "Data, distributions, hypothesis testing"], ["Mechanics", "Kinematics, forces, moments"]] },
      { subject: "physics", strands: [["Mechanics and materials", "Motion, forces, energy, Young modulus"], ["Electricity and waves", "Circuits, superposition, interference"], ["Fields", "Gravitational, electric and magnetic fields"], ["Nuclear and thermal", "Radioactivity, ideal gases"]] },
      { subject: "chemistry", strands: [["Physical", "Energetics, kinetics, equilibria"], ["Inorganic", "Periodicity, transition metals"], ["Organic", "Mechanisms, synthesis, spectroscopy"]] },
      { subject: "biology", strands: [["Biological molecules and cells", "Proteins, enzymes, cell membranes"], ["Exchange and energy", "Gas exchange, photosynthesis, respiration"], ["Genetics and control", "Gene expression, inheritance, homeostasis"], ["Ecology and evolution", "Populations, selection"]] },
    ],
  },
];

/** What is inside every course: [icon, title, text] */
export const INSIDE: [string, string, string][] = [
  ["target", "A diagnostic", "Finds the gaps and builds a personal learning map."],
  ["users", "Live small-group lessons", "Groups of 3 to 5, on Zoom, with an experienced tutor."],
  ["notes", "Lessons, notes and quizzes", "Set in the right order on the platform, between classes."],
  ["video", "Recordings", "Every live lesson is recorded so students can rewatch it."],
  ["pen", "Marked practice", "Exam-style questions with feedback on the working."],
  ["chart", "A monthly report", "Attendance, topics covered and next steps, sent to parents."],
];

export const PLANS = [
  { name: "Self-paced", text: "Learn at your own pace", popular: false, features: ["Diagnostic and personal learning map", "Lessons, notes and quizzes on the platform", "Progress you and your parents can see"] },
  { name: "Weekly class", text: "Our most popular plan", popular: true, features: ["Everything in Self-paced", "1 live small-group class a week", "Lesson recordings", "Monthly progress report for parents"] },
  { name: "Exam intensive", text: "For mocks and exam season", popular: false, features: ["Everything in Weekly class", "2 live classes a week", "Mock exams with marked feedback", "Predicted papers and model answers"] },
];

/** The platform tour: one line of narration per scene. */
export const TOUR = [
  { scene: "diag", line: "It starts with a short diagnostic. Ten questions, no pressure, and an “I haven’t learned this yet” button." },
  { scene: "map", line: "Every answer builds a personal learning map, so you can see exactly which topics are secure and which need work." },
  { scene: "live", line: "Each week you join a live small-group class with your tutor. Never more than five students, so everyone gets heard." },
  { scene: "tasks", line: "Between classes, your tutor sets lessons, notes and quizzes in the right order, with feedback on your working." },
  { scene: "report", line: "And every month, parents get a clear report: what was covered, how it went, and what comes next." },
] as const;

export type SceneKey = (typeof TOUR)[number]["scene"];

/** [when, title, text] */
export const STEPS: [string, string, string][] = [
  ["Week 0", "Free consultation", "A 20-minute call with a parent and the student. We talk about goals, school, exam board and the right plan."],
  ["Week 1", "Diagnostic", "A short online diagnostic in each subject finds the gaps and builds a personal learning map."],
  ["Every week", "Live class and set tasks", "A small-group class with the same tutor, plus lessons, notes and quizzes in the right order."],
  ["Every month", "Progress report", "Parents get a written report: attendance, topics covered, quiz results and next steps."],
];

/** A typical week: [day, [[kind, text]]] */
export const WEEK: [string, [string, string][]][] = [
  ["Mon", [["self", "Notes: Brackets"]]],
  ["Tue", [["quiz", "Quiz: 8 questions"]]],
  ["Wed", []],
  ["Thu", [["live", "Live class 6pm"]]],
  ["Fri", [["self", "Practice set"]]],
  ["Sat", [["quiz", "Topic check"]]],
  ["Sun", [["rep", "Weekly summary"]]],
];

export const FAQ: [string, string][] = [
  ["How big are the groups?", "Between 3 and 5 students, grouped by level and tier, so lessons move at the right pace and everyone gets attention."],
  ["Which exam boards do you teach?", "AQA, Edexcel and OCR for GCSE and A-level. We confirm your board at the consultation and match the course to it."],
  ["What if my child misses a lesson?", "Every live lesson is recorded and added to the platform, with the notes and tasks that go with it."],
  ["Do you teach students outside the UK?", "Yes. Lessons are online, and class times are shown in your local time."],
  ["How much does it cost?", "We are finalising our prices. Book a free consultation and we will recommend a plan and confirm the price for your subjects."],
];

/** [icon, title, text] */
export const PILLARS: [string, string, string][] = [
  ["users", "Small-group learning", "Groups of 3 to 5 mean personal attention without learning alone. Students ask questions and hear each other think."],
  ["route", "Structured programmes", "Every course follows a clear route through the specification, so nothing is missed and nothing is rushed."],
  ["brain", "Backed by cognitive science", "Retrieval practice, spacing and worked examples are built into every lesson and quiz."],
  ["pen", "Carefully designed lessons", "Each lesson is planned, reviewed and improved. Purposeful education that builds skill and character."],
];

export const FOUNDER = {
  name: "Zainab Abid",
  initials: "ZA",
  quote: "“Education should be more than grades. I want students to enjoy learning, build confidence and grow academically and personally.”",
  story:
    "Zainab studied Maths, Physics and Chemistry before Biomedical Engineering at King’s College London, where she began tutoring. She went on to a Level 6 Diploma in Teaching, taught in UK and international schools, and is now completing a Master’s in Education. She founded Educate Cloud to bring structured, science-backed teaching to small groups of students wherever they live.",
  credentials: [
    ["King’s College London", "Biomedical Engineering"],
    ["Level 6 Diploma", "in Teaching"],
    ["Master’s in Education", "in progress"],
    ["UK and international", "classroom experience"],
  ],
};

/** The learning map drawn in the hero and the laptop screens: m = mastered, p = in progress, w = weak, n = not started. */
export const MAP_TILES = "mmpmpwmmppwnmpwmnnmpnwpnmmppwnmnnwn".split("");

/** The flat colour behind a blog post cover. */
export const postColor = (c: string) => `var(--${c === "rose" ? "rose" : c})`;

/** The flat colour of a tutor's card (the rose one is the softer shade). */
export const teamColor = (c: string) => `var(--${c === "rose" ? "rose-soft" : c})`;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "2026-05-22" -> "22 May 2026" */
export function postDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}
