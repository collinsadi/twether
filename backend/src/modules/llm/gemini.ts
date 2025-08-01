import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";

// Environment configuration for Gemini
export const GEMINI_CONFIG = {
  API_KEY: process.env.GEMINI_API_KEY,
  MODEL: process.env.GEMINI_MODEL || "gemini-1.5-flash",
  MAX_TOKENS: parseInt(process.env.GEMINI_MAX_TOKENS || "8192"),
  TEMPERATURE: parseFloat(process.env.GEMINI_TEMPERATURE || "0.7"),
};

// Initialize Gemini client
let geminiClient: GoogleGenerativeAI | null = null;
let geminiModel: GenerativeModel | null = null;

/**
 * Initialize the Gemini client and model
 */
export const initializeGemini = (): void => {
  if (!GEMINI_CONFIG.API_KEY) {
    throw new Error("GEMINI_API_KEY environment variable is required");
  }

  try {
    geminiClient = new GoogleGenerativeAI(GEMINI_CONFIG.API_KEY);
    geminiModel = geminiClient.getGenerativeModel({
      model: GEMINI_CONFIG.MODEL,
      generationConfig: {
        maxOutputTokens: GEMINI_CONFIG.MAX_TOKENS,
        temperature: GEMINI_CONFIG.TEMPERATURE,
      },
    });
  } catch (error) {
    throw new Error(`Failed to initialize Gemini: ${error}`);
  }
};

/**
 * Get the initialized Gemini model
 */
export const getGeminiModel = (): GenerativeModel => {
  if (!geminiModel) {
    initializeGemini();
  }
  return geminiModel!;
};

/**
 * Generate text using Gemini
 */
export const generateText = async (prompt: string): Promise<string> => {
  try {
    const model = getGeminiModel();
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    throw new Error(`Gemini text generation failed: ${error}`);
  }
};

/**
 * Analyze tweet content using Gemini
 */
export const analyzeTweet = async (
  tweetText: string,
  context?: string
): Promise<string> => {
  const prompt = `"You are an AI that professionally analyzes tweets, specifically focusing on their relevance to the Ethereum/cryptocurrency community. For each tweet provided, analyze whether it pertains to the Ethereum/cryptocurrency community, determine its sentiment, identify which topics it closely aligns with from the list ['Defi', 'DAOs', 'ETH2.0', 'Layer2', 'Hackathons', 'Jobs'], assess its impact, and provide a brief summary. Format your response as pure JSON (not Markdown JSON) with the following structure:\n\n{\n  "sentiment": "positive|negative|neutral",\n  "topics": [],\n  "impact": "high|medium|low",\n  "summary": "brief summary here"\n}\n\nTweet to analyze: '${tweetText}'"`;

  try {
    const model = getGeminiModel();
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const rawResponse = response.text();
    
    // Clean the response from markdown JSON to raw JSON
    return cleanJsonResponse(rawResponse);
  } catch (error) {
    throw new Error(`Tweet analysis failed: ${error}`);
  }
};

/**
 * Clean markdown JSON response to raw JSON
 */
export const cleanJsonResponse = (response: string): string => {
  try {
    // Remove markdown code blocks
    let cleaned = response.replace(/```json\s*/g, '').replace(/```\s*$/g, '');
    
    // Remove any leading/trailing whitespace
    cleaned = cleaned.trim();
    
    // Try to parse and stringify to ensure valid JSON
    const parsed = JSON.parse(cleaned);
    return JSON.stringify(parsed);
  } catch (error) {
    // If parsing fails, try to extract JSON from the response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        return JSON.stringify(parsed);
      } catch (parseError) {
        throw new Error(`Failed to parse JSON response: ${parseError}`);
      }
    }
    throw new Error(`No valid JSON found in response: ${error}`);
  }
};

/**
 * Check if Gemini is properly configured
 */
export const isGeminiConfigured = (): boolean => {
  return !!GEMINI_CONFIG.API_KEY && !!geminiModel;
};

// Initialize Gemini on module load
try {
  if (GEMINI_CONFIG.API_KEY) {
    initializeGemini();
  }
} catch (error) {
  console.warn("Gemini initialization failed:", error);
}
