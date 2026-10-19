import { GoogleGenAI, Type } from "@google/genai";
import { createServerFn } from "@tanstack/react-start";

export const estimateCalories = createServerFn({ method: "POST" }).validator((data: {meal: string}) => data)
.handler(
  async ({data}) => {
    const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY
        });
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents:
        `Look up the calorie count if not then estimate the total calories in ${data.meal} .return it as an interger also take into account we are from south africa.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: { calories: { type: Type.NUMBER } },
          required: ["calories"],
        },
      },
    });

    const result = JSON.parse(response.text ?? "{}");
    if (!Number.isInteger(result.calories)) {
      throw new Error("Invalid response from model");
    }
    return { calories: result.calories as number };
  }
);

