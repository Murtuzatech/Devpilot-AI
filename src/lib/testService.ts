import { db, auth } from './firebase';
import { doc, getDoc, setDoc, arrayUnion, increment } from 'firebase/firestore';

const KEY = import.meta.env.VITE_GEMINI_API_KEY;
const MODEL = 'gemini-3.8-flash';

export interface TestGeneratorResult {
  id?: string;
  framework: string;
  testCode: string;
  testCasesCovered: string[];
  mockingNotes: string;
  createdAt?: string;
}

// 1. Fetch user's saved test suites directly from Cloud Firestore
export async function getUserGeneratedTestsFromFirestore(): Promise<TestGeneratorResult[]> {
  try {
    const user = auth.currentUser;
    if (!user) return [];

    const userDocRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(userDocRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return (data.savedTests as TestGeneratorResult[]) || [];
    }
    return [];
  } catch (error) {
    console.error('Error fetching test suites from Firestore:', error);
    return [];
  }
}

// 2. Persist generated test suite into Cloud Firestore
export async function saveGeneratedTestsToFirestore(testData: TestGeneratorResult): Promise<boolean> {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.warn('User not authenticated. Cannot save test suite.');
      return false;
    }

    const userDocRef = doc(db, 'users', user.uid);
    const testRecord: TestGeneratorResult = {
      ...testData,
      id: testData.id || `test_${Date.now()}`,
      createdAt: new Date().toISOString()
    };

    await setDoc(
      userDocRef,
      {
        savedTests: arrayUnion(testRecord),
        testGeneratorCount: increment(1),
        updatedAt: new Date().toISOString()
      },
      { merge: true }
    );

    return true;
  } catch (error) {
    console.error('Error saving test suite to Firestore:', error);
    return false;
  }
}

// 3. Generate unit and integration test suite using Gemini API
export async function generateTestCases(
  code: string,
  framework: string,
  language: string
): Promise<TestGeneratorResult> {
  if (!KEY) {
    throw new Error('Gemini API Key missing. Please check your .env file.');
  }

  const prompt = `
You are a Principal QA Architect and Test Automation Specialist.
Generate a comprehensive, battle-tested unit/integration test suite for the provided ${language} source code using the ${framework} framework.

Requirements:
- Cover happy path, edge cases (empty data, null/undefined, boundary values), and error states.
- Include clear assertions, describes, and it/test blocks.
- If mocking is required (APIs, timers, DBs), provide standard mocks.

You must respond ONLY with a raw, valid JSON object matching this schema. Do NOT use markdown code blocks, do NOT write \`\`\`json, and do NOT add explanatory text outside the JSON.

JSON Schema:
{
  "framework": "${framework}",
  "testCode": "Full production-ready executable test file code",
  "testCasesCovered": [
    "Specific edge case or behavior verified"
  ],
  "mockingNotes": "Brief overview of what dependencies or APIs were mocked and how"
}

Code to Test:
${code}
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
    const parsedResult = JSON.parse(cleanJson) as TestGeneratorResult;

    // Automatically persist to Firestore for logged-in user
    await saveGeneratedTestsToFirestore(parsedResult);

    return parsedResult;
  } catch (err) {
    console.error('Test Generator parse error:', rawText);
    throw new Error('Failed to parse test cases from AI.');
  }
}