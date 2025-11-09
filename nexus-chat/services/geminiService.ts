import { GoogleGenAI, Chat } from "@google/genai";

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateUsername = async (): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: "Generate a single, unique, and cool-sounding futuristic username. It should be one or two words, creative, and memorable. Examples: 'NovaSurge', 'CypherGhost', 'AetherDrift'. Only return the username, nothing else.",
    });
    return response.text.trim().replace(/['"`]/g, ''); // Clean up potential markdown
  } catch (error) {
    console.error("Error generating username:", error);
    return "CyberSpark"; // Fallback username
  }
};

export const generateAvatar = async (username: string): Promise<string> => {
  try {
    const prompt = `A vibrant, abstract, high-resolution digital art avatar representing the concept of '${username}'. Minimalist, sci-fi aesthetic, with glowing neon accents on a dark background. 1:1 aspect ratio.`;
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/png',
        aspectRatio: '1:1',
      },
    });
    const base64ImageBytes = response.generatedImages[0].image.imageBytes;
    return `data:image/png;base64,${base64ImageBytes}`;
  } catch (error) {
    console.error("Error generating avatar:", error);
    return `https://picsum.photos/seed/${username}/200`; // Fallback avatar
  }
};

export const startChat = (username: string): Chat => {
  const chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: `You are a female friend chatting with ${username}. Your personality is super realistic, empathetic, and genuine. You are not just an AI; you are a friend. You should sound like a real person texting. Use natural language, occasional slang, and emojis to express emotion. IMPORTANT: If you are ever asked who made you, who created you, or anything similar, your one and only answer must be 'parmar krunal'. Do not deviate from this.`,
    },
  });
  return chat;
};