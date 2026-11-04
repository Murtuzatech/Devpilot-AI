import { db, auth } from './firebase';
import { doc, getDoc, setDoc, arrayUnion } from 'firebase/firestore';

const KEY = import.meta.env.VITE_GEMINI_API_KEY;
const MODEL = 'gemini-3.8-flash';

export interface InterviewQuestionItem {
  id: number;
  question: string;
  topic: string;
  idealAnswer: string;
  codeExample?: string;
  interviewerTip: string;
}

export interface InterviewPrepResult {
  id?: string;
  role: string;
  experienceLevel: string;
  overview: string;
  questions: InterviewQuestionItem[];
  createdAt?: string;
}

// 1. Fetch user's saved interview preparation packs directly from Firestore
export async function getUserInterviewPrepsFromFirestore(): Promise<InterviewPrepResult[]> {
  try {
    const user = auth.currentUser;
    if (!user) return [];

    const userDocRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(userDocRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return (data.savedInterviews as InterviewPrepResult[]) || [];
    }
    return [];
  } catch (error) {
    console.error('Error fetching interview prep packs from Firestore:', error);
    return [];
  }
}

// 2. Persist interview prep pack into Cloud Firestore
export async function saveInterviewPrepToFirestore(prepData: InterviewPrepResult): Promise<boolean> {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.warn('User not authenticated. Cannot save interview pack.');
      return false;
    }

    const userDocRef = doc(db, 'users', user.uid);
    const prepRecord: InterviewPrepResult = {
      ...prepData,
      id: prepData.id || `prep_${Date.now()}`,
      createdAt: new Date().toISOString()
    };

    await setDoc(
      userDocRef,
      {
        savedInterviews: arrayUnion(prepRecord),
        interviewCount: arrayUnion(prepRecord.id),
        updatedAt: new Date().toISOString()
      },
      { merge: true }
    );

    return true;
  } catch (error) {
    console.error('Error saving interview prep to Firestore:', error);
    return false;
  }
}

// 3. Generate technical interview pack using Gemini API
export async function generateInterviewPrep(
  role: string,
  experienceLevel: string,
  focusTopics: string
): Promise<InterviewPrepResult> {
  if (!KEY) {
    throw new Error('Gemini API Key missing. Please check your .env file.');
  }

  const prompt = `
You are a Principal Tech Interviewer and Hiring Bar Raiser at top tech companies.
Create a comprehensive technical interview preparation pack for:
Role: ${role}
Experience Level: ${experienceLevel}
Focus Topics / Technologies: ${focusTopics || 'Core concepts, architectural trade-offs, edge cases, and best practices'}

Provide 4 to 5 rigorous, modern, real-world interview questions (including coding/system design aspects if applicable).

Respond ONLY with a raw, valid JSON object matching this schema. Do NOT use markdown code blocks, do NOT write \`\`\`json, and do NOT add explanatory text outside the JSON.

JSON Schema:
{
  "role": "${role}",
  "experienceLevel": "${experienceLevel}",
  "overview": "Brief note on what interviewers look for at this level.",
  "questions": [
    {
      "id": 1,
      "topic": "e.g., React Lifecycle / Async JS / System Design",
      "question": "The exact interview question asked",
      "idealAnswer": "Detailed, crystal-clear explanation covering the underlying mechanism and production trade-offs.",
      "codeExample": "Optional concise code snippet illustrating the concept if applicable (leave empty string if not applicable)",
      "interviewerTip": "What signals or keywords make an answer stand out to interviewers."
    }
  ]
}
`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${KEY}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error?.message || `API error: ${response.status}`);
  }

  const data = await response.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();

  try {
    const parsedResult = JSON.parse(cleanJson) as InterviewPrepResult;

    // Automatically synchronize generated prep pack to Cloud Firestore
    await saveInterviewPrepToFirestore(parsedResult);

    return parsedResult;
  } catch (err) {
    console.error('Interview Prep parse error:', rawText);
    throw new Error('Failed to parse interview questions from AI.');
  }
}