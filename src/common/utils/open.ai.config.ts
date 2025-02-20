import { SECRETS } from '../config/secrets.js';
import { AppError } from '../errors/app.error.js';
import { generateChatPrompt } from './generateChatPrompt.js';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

/**
 * Allowed chat modes excluding "refresh"
 */
export type ValidChatMode =
  | 'ideas'
  | 'improve'
  | 'similar'
  | 'weaknesses'
  | 'expansion'
  | 'monetize'
  | 'audience'
  | 'rewrite';

/**
 * All chat modes, including "refresh"
 */
export type ChatMode = ValidChatMode | 'refresh';

/**
 * Expected format of a project
 */
export interface Project {
  title: string;
  description: string;
}

/**
 * Expected AI API Response
 */
export interface AIResponse {
  monetizationStrategies: boolean;
  similarProjects: boolean;
  audienceAnalysis: boolean;
  improvements: boolean;
  success: boolean;
  message?: string;
  data?: { title: string; description: string }[];
}

/**
 * Handles AI-based project discussions using Google Gemini API.
 *
 * @param projects - Array of project objects containing title and description.
 * @param profession - User's profession for better AI context.
 * @param mode - The specific mode of conversation (e.g., 'improve', 'monetize').
 * @param lastMode - (Optional) The last mode used, required when refreshing.
 * @returns Promise resolving to AI-generated response.
 */
export const chatWithAI = async (
  projects: Project[],
  profession: string,
  mode: ChatMode,
  lastMode?: ValidChatMode,
): Promise<AIResponse> => {
  try {
    // Ensure we never pass "refresh" into `generateChatPrompt`
    const usedMode: ValidChatMode =
      mode === 'refresh'
        ? (lastMode ??
          (() => {
            throw new AppError('Missing lastMode for refresh', 400);
          })())
        : mode;

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: generateChatPrompt(projects, profession, usedMode),
            },
          ],
        },
      ],
      generationConfig: { maxOutputTokens: 500 },
    };

    console.log('🚀 Sending request to Gemini API:', requestBody); // Debugging Log

    const response = await fetch(`${GEMINI_API_URL}?key=${SECRETS.geminiApiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new AppError(`Gemini API Error: ${response.statusText}`, response.status);
    }

    const data = await response.json();

    if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
      throw new AppError('Invalid AI response format', 500);
    }

    let responseText = data.candidates[0].content.parts[0].text.trim();

    // Remove any unwanted markdown JSON wrappers
    responseText = responseText.replace(/```json\n?/g, '').replace(/```$/g, '');

    // Extract JSON block from response
    const match = responseText.match(/\{[\s\S]*\}/);
    if (match) {
      responseText = match[0];
    } else {
      throw new AppError('Invalid AI response format: No valid JSON detected.', 500);
    }

    const parsedResponse: AIResponse = JSON.parse(responseText);

    return parsedResponse;
  } catch (error: unknown) {
    console.error('⚠️ Error in AI chat:', error);
    throw new AppError('Failed to process chat request', 500, error instanceof Error ? error.message : error);
  }
};
