export interface HeroSlide {
  id: string;
  image: string;
  alt: string;
  kicker: string;
  title: string;
  description: string;
}

// The pictures live in public/images/home.
export const heroSlides: HeroSlide[] = [
  {
    id: "study-together",
    image: "/images/home/study-together.jpg",
    alt: "A student and tutor working together through a textbook.",
    kicker: "Learn with support",
    title: "Big goals, one topic at a time.",
    description: "Build understanding with clear explanations and a plan that feels manageable.",
  },
  {
    id: "study-group",
    image: "/images/home/study-group.jpg",
    alt: "Students sharing ideas and working through study materials together.",
    kicker: "Study together",
    title: "Make each study session count.",
    description: "Practise steadily, strengthen your knowledge and keep your revision moving.",
  },
  {
    id: "quiet-focus",
    image: "/images/home/quiet-focus.jpg",
    alt: "A student studying at a quiet library desk surrounded by bookshelves.",
    kicker: "Find your focus",
    title: "Feel ready for what comes next.",
    description: "Notice your progress and head into exam day feeling prepared.",
  },
];
