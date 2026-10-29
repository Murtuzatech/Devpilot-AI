const KEY = import.meta.env.VITE_GEMINI_API_KEY;
const MODEL = 'gemini-3.1-flash-lite';

export interface ReviewResult {
  score: number;
  summary: string;
  issues: {
    type: 'critical' | 'warning' | 'info';
    title: string;
    desc: string;
  }[];
  suggestions: string[];
  refactoredCode: string;
}

export async function analyzeCodeWithGemini(code: string, language: string): Promise<ReviewResult> {
  if (!KEY) {
    throw new Error("Gemini API Key is missing. Check your .env file.");
  }

  const prompt = `
You are a Staff Principal Engineer and Security Auditor.
Review the following ${language} code for security flaws, memory leaks, performance bottlenecks, code smells, and architecture antipatterns.

You must respond ONLY with a raw, valid JSON object matching the exact schema below. Do NOT use markdown codeblocks, do NOT add backticks, and do NOT add explanatory text outside the JSON.

JSON Schema:
{
  "score": number (0-100),
  "summary": "High-level architectural assessment of code quality",
  "issues": [
    {
      "type": "critical" | "warning" | "info",
      "title": "Short descriptive issue title",
      "desc": "Technical explanation and why it matters"
    }
  ],
  "suggestions": [
    "Concrete actionable refactoring recommendation"
  ],
  "refactoredCode": "Full production-ready refactored code without placeholder comments"
}

Code to analyze:
${code}
`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${KEY}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt }]
        }
      ]
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error?.message || `API request failed with status ${response.status}`);
  }

  const data = await response.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  const sanitizedJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();

  try {
    const parsedData: ReviewResult = JSON.parse(sanitizedJson);
    return parsedData;
  } catch (err) {
    console.error("Failed to parse AI response:", rawText);
    throw new Error("Invalid response format received from AI.");
  }
}