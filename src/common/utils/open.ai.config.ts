import { AppError } from '../errors/app.error.js';
import { generateChatPrompt } from './generateChatPrompt.js';

const OLLAMA_API_URL = 'http://127.0.0.1:11434/api/chat';

type AIMode = 'rewrite' | 'improve' | 'similar' | 'weaknesses' | 'expansion' | 'monetize' | 'audience' | 'ideas';

export const chatWithAI = async (projects: unknown, profession: string, mode: string, lastMode?: string) => {
  try {
    const usedMode =
      mode === 'refresh'
        ? (lastMode ??
          (() => {
            throw new AppError('Missing lastMode for refresh', 400);
          })())
        : mode;

    if (!isValidMode(usedMode)) {
      throw new AppError(`Invalid mode: ${usedMode}`, 400);
    }

    const requestBody = {
      model: 'qwen2.5:1.5b',
      stream: false,
      messages: [
        {
          role: 'user',
          content: generateChatPrompt(
            projects as { title: string; description: string }[],
            profession,
            usedMode as AIMode,
          ),
        },
      ],
      options: {
        num_predict: 500,
        temperature: 0.4,
      },
    };

    const response = await fetch(OLLAMA_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new AppError(`Ollama API Error: ${response.status} ${response.statusText} - ${errorText}`, response.status);
    }

    const data = await response.json();

    const rawText = (data?.message?.content ?? '').trim();
    if (!rawText) {
      throw new AppError('Invalid AI response format: empty response', 500);
    }

    let responseText = rawText.replace(/```json\n?/g, '').replace(/```$/g, '');
    const match = responseText.match(/\{[\s\S]*\}/);

    if (!match) {
      throw new AppError('Invalid AI response format: No valid JSON detected.', 500);
    }

    responseText = match[0];
    return JSON.parse(responseText);
  } catch (error: unknown) {
    if (error instanceof AppError) throw error;

    throw new AppError('Failed to process chat request', 500, error instanceof Error ? error.message : String(error));
  }
};

const isValidMode = (mode: string): mode is AIMode => {
  const validModes: AIMode[] = [
    'rewrite',
    'improve',
    'similar',
    'weaknesses',
    'expansion',
    'monetize',
    'audience',
    'ideas',
  ];
  return validModes.includes(mode as AIMode);
};
