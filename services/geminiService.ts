
import { GoogleGenAI, Type } from "@google/genai";
import { Issue } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const geminiService = {
  /**
   * Generates a weekly city summary using reported issues.
   */
  async generateWeeklySummary(issues: Issue[]): Promise<string> {
    if (!issues.length) return "No significant issues reported this week.";
    
    const issueContext = issues.map(i => `- ${i.title}: ${i.description} (${i.upvoteCount} upvotes)`).join('\n');

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Act as a City Manager. Summarize the following top issues reported by residents this week into a professional but empathetic update for the City Council. Highlight trends and priorities based on upvotes.\n\nIssues:\n${issueContext}`,
        config: {
          systemInstruction: "You are a professional city official communicating to the public and other council members.",
          maxOutputTokens: 500,
        }
      });
      return response.text || "Summary unavailable.";
    } catch (error) {
      console.error("Gemini summary failed:", error);
      return "Unable to generate summary at this time.";
    }
  },

  /**
   * Helps determine if an issue might be a duplicate based on text.
   */
  async checkDuplicate(newIssueTitle: string, existingIssues: Issue[]): Promise<boolean> {
    if (existingIssues.length === 0) return false;

    const titles = existingIssues.map(i => i.title).join(', ');
    
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `New issue title: "${newIssueTitle}"\nExisting issues: ${titles}\nIs the new issue likely a duplicate of any existing ones? Answer with a JSON boolean.`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              isDuplicate: { type: Type.BOOLEAN }
            },
            required: ['isDuplicate']
          }
        }
      });
      const result = JSON.parse(response.text || '{"isDuplicate": false}');
      return result.isDuplicate;
    } catch {
      return false;
    }
  }
};
