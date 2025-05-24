
import { GoogleGenAI, GenerateContentParameters } from "@google/genai";
import { generateWebsitePlanPrompt, generateWebsitePromptWithPlan } from "../promptTemplates";

// Fix: Updated MODEL_NAME to the allowed model 'gemini-2.5-flash-preview-04-17' as per guidelines.
const MODEL_NAME = "gemini-2.5-pro-preview-05-06";

export async function generateWebsitePlanStream(
  ai: GoogleGenAI,
  reportText: string,
  onChunk: (chunkText: string) => void,
  onComplete: (finalText: string) => void,
  signal?: AbortSignal
): Promise<void> {
  const prompt = generateWebsitePlanPrompt(reportText);
  
  const requestParams: GenerateContentParameters = { 
    model: MODEL_NAME, 
    contents: prompt 
  };

  // console.log("Attempting to stream plan..."); // For debugging
  try {
    // Fix: Pass AbortSignal directly within the first argument object
    const streamRequest = signal ? { ...requestParams, signal } : requestParams;
    const responseStream = await ai.models.generateContentStream(streamRequest);

    let accumulatedText = "";
    for await (const chunk of responseStream) {
      const chunkText = chunk.text; 
      if (chunkText) { 
        // console.log("Plan Stream Chunk Text (service):", `"${chunkText}" (Length: ${chunkText.length})`); // For debugging
        accumulatedText += chunkText;
        onChunk(chunkText); 
      } else {
        // console.log("Plan Stream (service): Received chunk without text or empty text."); // For debugging
      }
    }
    // console.log("Plan Stream Complete (service). Accumulated Text Length:", accumulatedText.length); // For debugging
    onComplete(accumulatedText);
  } catch (error) {
    console.error("Error in generateWebsitePlanStream:", error);
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw error;
      }
      if (error.message.includes("API key") || error.message.includes("API_KEY")) {
         throw new Error("Invalid or missing Gemini API Key for plan generation.");
      }
      if (error.message.includes("finishReason") || error.message.includes("SAFETY")) {
        throw new Error(`AI model error (plan): Content restrictions or other issues. Details: ${error.message}`);
      }
      throw new Error(`Failed to generate plan: ${error.message}`);
    }
    throw new Error("An unknown error occurred while generating the plan.");
  }
}


export async function generateWebsiteFromReportWithPlanStream(
  ai: GoogleGenAI,
  reportText: string,
  planText: string,
  onChunk: (chunkText: string) => void,
  onComplete: (finalText: string) => void,
  signal?: AbortSignal
): Promise<void> {
  const prompt = generateWebsitePromptWithPlan(reportText, planText);

  const requestParams: GenerateContentParameters = { 
    model: MODEL_NAME, 
    contents: prompt 
  };
  
  console.log("Attempting to stream website HTML..."); // For debugging
  try {
    // Fix: Pass AbortSignal directly within the first argument object
    const streamRequest = signal ? { ...requestParams, signal } : requestParams;
    const responseStream = await ai.models.generateContentStream(streamRequest);
    
    let accumulatedText = "";
    for await (const chunk of responseStream) {
      const chunkText = chunk.text; 
      if (chunkText) { 
        // console.log("HTML Stream Chunk Text (service):", `"${chunkText}" (Length: ${chunkText.length})`); // For debugging
        accumulatedText += chunkText;
        onChunk(chunkText); 
      } else {
        // console.log("HTML Stream (service): Received chunk without text or empty text."); // For debugging
      }
    }
    // console.log("HTML Stream Complete (service). Accumulated Text Length:", accumulatedText.length); // For debugging
    onComplete(accumulatedText);

  } catch (error) {
    console.error("Error in generateWebsiteFromReportWithPlanStream:", error);
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw error; 
      }
      if (error.message.includes("API key") || error.message.includes("API_KEY")) {
         throw new Error("Invalid or missing Gemini API Key for website generation.");
      }
      if (error.message.includes("finishReason") || error.message.includes("SAFETY")) {
        throw new Error(`AI model error (website): Content restrictions or other issues. Details: ${error.message}`);
      }
      throw new Error(`Failed to generate website from plan: ${error.message}`);
    }
    throw new Error("An unknown error occurred while generating the website from plan.");
  }
}
