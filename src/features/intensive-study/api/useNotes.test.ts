import { describe, expect, it } from "vitest";
import {
  mapCardToNote,
  mapCreateCardResponseToNote,
  mapUpdateCardResponseToNote,
} from "../../../../hooks/useNotes";

const explanationCard = {
  id: 41,
  question: "Left-side explanation",
  answer: "Right-side details",
  type: "EXPLANATION" as const,
  topicId: 7,
  images: [
    { imageUrl: "https://cdn.test/question-1.png", imageType: "question" as const },
    { imageUrl: "https://cdn.test/answer-1.png", imageType: "answer" as const },
    { imageUrl: "https://cdn.test/question-2.png", imageType: "question" as const },
    { imageUrl: "https://cdn.test/answer-2.png", imageType: "answer" as const },
  ],
};

describe("notes card response adapters", () => {
  it("maps fetched EXPLANATION image arrays to left/right presentation fields", () => {
    const note = mapCardToNote(explanationCard);

    expect(note).toMatchObject({
      id: 41,
      leftContent: "Left-side explanation",
      rightContent: "Right-side details",
      type: "explanation",
      topicId: 7,
      leftImageUrl: "https://cdn.test/question-1.png",
      rightImageUrl: "https://cdn.test/answer-1.png",
      leftImageUrls: [
        "https://cdn.test/question-1.png",
        "https://cdn.test/question-2.png",
      ],
      rightImageUrls: [
        "https://cdn.test/answer-1.png",
        "https://cdn.test/answer-2.png",
      ],
    });
  });

  it("unwraps the create envelope before retaining card identity, content, and images", () => {
    const note = mapCreateCardResponseToNote(
      { message: "Card created", card: explanationCard },
      99,
    );

    expect(note).toMatchObject({
      id: 41,
      leftContent: "Left-side explanation",
      rightContent: "Right-side details",
      topicId: 7,
      leftImageUrls: [
        "https://cdn.test/question-1.png",
        "https://cdn.test/question-2.png",
      ],
      rightImageUrls: [
        "https://cdn.test/answer-1.png",
        "https://cdn.test/answer-2.png",
      ],
    });
  });

  it("maps the update card envelope without losing canonical images", () => {
    const note = mapUpdateCardResponseToNote({
      message: "Card updated",
      card: {
        ...explanationCard,
        question: "Updated left",
        images: [
          { imageUrl: "https://cdn.test/new-question.png", imageType: "question" },
          { imageUrl: "https://cdn.test/new-answer.png", imageType: "answer" },
        ],
      },
    });

    expect(note).toMatchObject({
      id: 41,
      leftContent: "Updated left",
      leftImageUrl: "https://cdn.test/new-question.png",
      rightImageUrl: "https://cdn.test/new-answer.png",
      leftImageUrls: ["https://cdn.test/new-question.png"],
      rightImageUrls: ["https://cdn.test/new-answer.png"],
    });
  });
});
