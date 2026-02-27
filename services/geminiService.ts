
import { GoogleGenAI, Type } from "@google/genai";
import { ProsodyAnalysis, EvaluationResult, AssessmentData } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

export const analyzeVerse = async (verse: string): Promise<ProsodyAnalysis> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Analyze this Arabic poetic verse for prosody (Arud): "${verse}"
    Provide the following in your analysis:
    1. The verse with full diacritics.
    2. The prosodic writing (Kitaba Arudiya) where what's pronounced is written.
    3. The symbolic representation (/ for Harakah, 0 for Sukun).
    4. The name of the poetic meter (Bahr).
    5. The breakdown of the Taf'ilat (feet).
    6. A brief explanation of any poetic licenses or variations used.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          original: { type: Type.STRING },
          diacritized: { type: Type.STRING },
          prosodicWriting: { type: Type.STRING },
          symbols: { type: Type.STRING },
          meterName: { type: Type.STRING },
          tafilat: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                text: { type: Type.STRING },
                pattern: { type: Type.STRING }
              },
              required: ["text", "pattern"]
            }
          },
          explanation: { type: Type.STRING }
        },
        required: ["original", "diacritized", "prosodicWriting", "symbols", "meterName", "tafilat"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response from AI");
  
  try {
    return JSON.parse(text) as ProsodyAnalysis;
  } catch (e) {
    console.error("Failed to parse AI response", text);
    throw new Error("عذراً، لم نتمكن من تحليل البيت الشعري. يرجى التأكد من كتابته بشكل صحيح.");
  }
};

export const evaluateStudentAnalysis = async (
  verse: string, 
  studentPattern: string, 
  correctAnalysis: ProsodyAnalysis
): Promise<EvaluationResult> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Evaluate a student's prosodic analysis of this verse: "${verse}".
    The correct pattern is: "${correctAnalysis.symbols}".
    The student provided: "${studentPattern}".
    The Taf'ilat are: ${JSON.stringify(correctAnalysis.tafilat)}.
    
    Compare them and provide:
    1. isCorrect: boolean
    2. score: 0-100 based on accuracy.
    3. errorTafilaIndex: (optional) index of the tafila where the first error occurred.
    4. feedback: Pedagogical advice in Arabic explaining why it's wrong or praising if correct.
    5. correctedPattern: The full correct string of / and 0.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          isCorrect: { type: Type.BOOLEAN },
          score: { type: Type.NUMBER },
          errorTafilaIndex: { type: Type.NUMBER },
          feedback: { type: Type.STRING },
          correctedPattern: { type: Type.STRING }
        },
        required: ["isCorrect", "score", "feedback", "correctedPattern"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response from AI");
  return JSON.parse(text) as EvaluationResult;
};

export const generateAssessment = async (analysis: ProsodyAnalysis): Promise<AssessmentData> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Generate a prosody knowledge quiz based on the poetic meter "${analysis.meterName}" and this verse: "${analysis.original}".
    The quiz should contain 3 multiple-choice questions about the rules of this meter, Zihaf (changes), or the prosodic writing rules used in this specific verse.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          quiz: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                correctAnswerIndex: { type: Type.NUMBER },
                explanation: { type: Type.STRING }
              },
              required: ["question", "options", "correctAnswerIndex", "explanation"]
            }
          }
        },
        required: ["quiz"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response from AI");
  return JSON.parse(text) as AssessmentData;
};
