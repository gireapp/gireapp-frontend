import {
  BookOpen,
  GraduationCap,
  LucideIcon,
  Shield,
  Trophy,
  Users,
} from "lucide-react";

interface EducationCardProps {
  icon: LucideIcon;
  borderColor: string;
  title: string;
  description: string;
  tags?: string[];
}

const EducationCard = ({
  icon: Icon,
  borderColor,
  title,
  description,
  tags = [],
}: EducationCardProps) => {
  return (
    <div
      className={`group relative flex h-full flex-col bg-indigo-900 backdrop-blur-sm rounded-3xl border ${borderColor} py-6 px-4 space-y-4`}
    >
      <Icon
        className="w-9 h-9 text-indigo-400 dark:text-indigo-400"
        aria-hidden="true"
      />
      <h3 className="text-base md:text-2xl font-bold text-indigo-200 font-plus-jakarta-sans">
        {title}
      </h3>
      <p className="text-xs md:text-sm text-indigo-200 font-normal flex-grow font-inter">
        {description}
      </p>
      <div className="flex flex-wrap gap-4">
        {tags.map((tag) => (
          <span
            key={tag}
            className="px-3 py-1 bg-indigo-950 text-indigo-400 rounded-full text-[10px] lg:text-xs font-normal font-inter"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
};

export default EducationCard;

export const educationLevels: EducationCardProps[] = [
  {
    icon: BookOpen,
    borderColor: "border-indigo-400",
    title: "Secondary Education",
    description:
      "Science, Business and Arts tracks for high school students. WAEC and JAMB-ready contents with targeted exam prep.",
    tags: ["Science", "Business", "Arts"],
  },
  {
    icon: GraduationCap,
    borderColor: "border-orange-500",
    title: "Tertiary Studies",
    description:
      "Undergraduate and Postgraduate modules. Research methodology, thesis support and career mentorship.",
    tags: ["Undergraduate", "Postgraduate"],
  },
  {
    icon: Trophy,
    borderColor: "border-green-500",
    title: "Professional Skills",
    description:
      "Industry certified training for working adults and career changers. Data-saver mode for cost-efficient learning.",
    tags: ["Data Analytics", "Project Mgt", "Digital Marketing"],
  },
];

export const Features: EducationCardProps[] = [
  {
    icon: BookOpen,
    borderColor: "border-indigo-400",
    title: "Structured courses",
    description:
      "Multi-format lessons: texts, PDFs and rich markdown. Organized by modules for clear progressions.",
  },
  {
    icon: Trophy,
    borderColor: "border-orange-500",
    title: "Gamified Learning",
    description:
      "Test your knowledge and earn rank badges as you complete quizzes. Moving from Bronze to Master keeps you motivated.",
  },
  {
    icon: Users,
    borderColor: "border-green-500",
    title: "Mentorship Access",
    description:
      "Stuck on a concept? Connect directly with verified academic counselors and industry mentors within the platform.",
  },
  {
    icon: Shield,
    borderColor: "border-yellow-500",
    title: "Enterprise Grade Privacy",
    description:
      "Fully NDPR and POPIA compliant. Your academic records and personal data are encrypted and strictly access-controlled.",
  },
];
