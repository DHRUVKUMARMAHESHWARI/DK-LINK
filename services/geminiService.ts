import { GoogleGenAI, Type } from "@google/genai";
import { LinkItem, Category, CalendarEvent } from "../types";

// Initialize the client
// Note: In a production environment, never expose API keys on the client side.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_FAST = 'gemini-2.5-flash';

/**
 * Chat with the AI Assistant
 */
export const chatWithAI = async (
  message: string,
  contextData: string
): Promise<string> => {
  try {
    const systemInstruction = `
      You are "Nexus", an intelligent personal digital assistant for the 'AI Smart Personal Hub'.
      Your goal is to help the user organize their digital life, find saved links, check password health (generically), and manage their schedule.
      
      You have access to the following context about the user's data:
      ${contextData}
      
      Rules:
      1. Be concise, friendly, and professional.
      2. Do NOT reveal actual password characters. If asked, say "I can see you have a password saved for [Site], but I cannot read the password itself for security."
      3. If the user asks to add a link or event, guide them to the respective page, do not try to execute it (as you are a chat interface).
      4. Offer productivity tips based on their data.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_FAST,
      contents: message,
      config: {
        systemInstruction: systemInstruction,
      },
    });

    return response.text || "I'm having trouble connecting to my neural network right now.";
  } catch (error) {
    console.error("AI Chat Error:", error);
    return "Sorry, I encountered an error processing your request.";
  }
};

/**
 * Auto-categorize and tag a link based on its URL and optional title
 */
export const analyzeLink = async (url: string, title?: string): Promise<{ category: Category; tags: string[]; suggestedTitle: string }> => {
  try {
    const prompt = `
      Analyze this URL: ${url}
      Title hint: ${title || 'Unknown'}
      
      1. Suggest a clean, readable title.
      2. Categorize it into one of: Work, Personal, Entertainment, Finance, Education, Social, Other.
      3. Generate up to 4 relevant short tags.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_FAST,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestedTitle: { type: Type.STRING },
            category: { type: Type.STRING },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["suggestedTitle", "category", "tags"]
        }
      }
    });

    const json = JSON.parse(response.text || '{}');
    
    // Validate category against enum, default to OTHER if mismatch
    let category = Category.OTHER;
    const catValues = Object.values(Category);
    if (json.category && catValues.includes(json.category as Category)) {
      category = json.category as Category;
    }

    return {
      category: category,
      tags: json.tags || [],
      suggestedTitle: json.suggestedTitle || title || url,
    };

  } catch (error) {
    console.error("Link Analysis Error:", error);
    return {
      category: Category.OTHER,
      tags: ['uncategorized'],
      suggestedTitle: title || url,
    };
  }
};

/**
 * Parse natural language into a structured Calendar Event
 */
export const parseNaturalLanguageEvent = async (input: string): Promise<Partial<CalendarEvent> | null> => {
  try {
    const prompt = `
      Extract calendar event details from this text: "${input}"
      Current Date context: ${new Date().toISOString()}
      
      Return a JSON object with:
      - title: string
      - date: ISO string (calculate based on 'tomorrow', 'next friday', etc. relative to current date)
      - type: one of 'Meeting', 'Birthday', 'Deadline', 'Reminder'
    `;

    const response = await ai.models.generateContent({
      model: MODEL_FAST,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            date: { type: Type.STRING },
            type: { type: Type.STRING, enum: ['Meeting', 'Birthday', 'Deadline', 'Reminder'] }
          },
          required: ["title", "date", "type"]
        }
      }
    });

    return JSON.parse(response.text || 'null');
  } catch (error) {
    console.error("Event Parsing Error:", error);
    return null;
  }
};

/**
 * Generate a productivity tip based on current date and generic context
 */
export const getProductivityTip = async (): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_FAST,
      contents: "Give me one short, unique, actionable productivity tip for a digital worker.",
    });
    return response.text || "Focus on one big task per day.";
  } catch (error) {
    return "Stay organized to save time.";
  }
};