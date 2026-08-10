// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BookOpen } from "lucide-react";
import EducationCard from "@/components/landing-page/EducationCard";

const BASE = {
  icon: BookOpen,
  borderColor: "border-indigo-400",
  title: "Secondary",
  description: "Science, Business and Arts tracks for high school students.",
};

describe("EducationCard", () => {
  it("renders the title and description", () => {
    render(<EducationCard {...BASE} />);

    expect(screen.getByText("Secondary")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Science, Business and Arts tracks for high school students.",
      ),
    ).toBeInTheDocument();
  });

  it("renders every supplied tag", () => {
    render(<EducationCard {...BASE} tags={["Science", "Business", "Arts"]} />);

    expect(screen.getByText("Science")).toBeInTheDocument();
    expect(screen.getByText("Business")).toBeInTheDocument();
    expect(screen.getByText("Arts")).toBeInTheDocument();
  });

  it("renders no tags when the prop is omitted", () => {
    const withTags = render(
      <EducationCard {...BASE} tags={["Alpha", "Beta"]} />,
    );
    const tagCount = withTags.container.querySelectorAll("span").length;
    withTags.unmount();

    const withoutTags = render(<EducationCard {...BASE} />);

    expect(withoutTags.container.querySelectorAll("span").length).toBe(
      tagCount - 2,
    );
  });

  it("applies the caller's border colour", () => {
    const { container } = render(
      <EducationCard {...BASE} borderColor="border-coral-500" />,
    );

    expect(container.firstElementChild).toHaveClass("border-coral-500");
  });

  it("renders the supplied icon", () => {
    const { container } = render(<EducationCard {...BASE} />);

    expect(container.querySelector("svg")).toBeInTheDocument();
  });
});
