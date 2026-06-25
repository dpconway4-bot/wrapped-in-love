export interface SurveyQuestion {
  day: number;
  week: string;
  question: string;
}

export const SURVEYS: SurveyQuestion[] = [
  {
    day: 1,
    week: "The Introduction",
    question:
      "The Introduction asked you to get honest before you begin. What's one thing you realized about yourself or this relationship that you didn't expect?",
  },
  {
    day: 8,
    week: "Week 1: Patience",
    question:
      "Patience asked you to stop being anxious about someone else's growth. What shifted for you this week — in your thinking, your actions, or both?",
  },
  {
    day: 15,
    week: "Week 2: Kindness",
    question:
      "Kindness asked you to act — even toward someone difficult. What's the most honest thing you can say about how you showed up this week?",
  },
];

export function getSurveyForDay(day: number): SurveyQuestion | null {
  return SURVEYS.find((s) => s.day === day) ?? null;
}
