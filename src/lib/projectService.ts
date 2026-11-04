import { db, auth } from './firebase';
import { doc, getDoc, setDoc, arrayUnion } from 'firebase/firestore';

const KEY = import.meta.env.VITE_GEMINI_API_KEY;
const MODEL = 'gemini-3.8-flash';

export interface ProjectBlueprint {
  id?: string;
  title: string;
  summary: string;
  techStack: {
    frontend: string[];
    backend: string[];
    database: string[];
    devops: string[];
  };
  folderStructure: string;
  databaseSchema: string[];
  roadmapSteps: {
    phase: string;
    description: string;
  }[];
  createdAt?: string;
}

// 1. Fetch user's saved project blueprints directly from Cloud Firestore
export async function getUserProjectsFromFirestore(): Promise<ProjectBlueprint[]> {
  try {
    const user = auth.currentUser;
    if (!user) return [];

    const userDocRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(userDocRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return (data.savedProjects as ProjectBlueprint[]) || [];
    }
    return [];
  } catch (error) {
    console.error('Error fetching project blueprints from Firestore:', error);
    return [];
  }
}

// 2. Persist newly generated blueprint into Cloud Firestore
export async function saveProjectToFirestore(blueprint: ProjectBlueprint): Promise<boolean> {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.warn('User not authenticated. Cannot save project blueprint.');
      return false;
    }

    const userDocRef = doc(db, 'users', user.uid);
    const projectRecord: ProjectBlueprint = {
      ...blueprint,
      id: blueprint.id || `proj_${Date.now()}`,
      createdAt: new Date().toISOString()
    };

    await setDoc(
      userDocRef,
      {
        savedProjects: arrayUnion(projectRecord),
        projectCount: arrayUnion(projectRecord.id),
        updatedAt: new Date().toISOString()
      },
      { merge: true }
    );

    return true;
  } catch (error) {
    console.error('Error saving project blueprint to Firestore:', error);
    return false;
  }
}

// 3. Generate architectural blueprint using Gemini API
export async function generateProjectBlueprint(
  promptText: string,
  projectType: string
): Promise<ProjectBlueprint> {
  if (!KEY) {
    throw new Error('Gemini API Key missing. Please check your .env file.');
  }

  const prompt = `
You are a Principal Software Architect and Technical Lead.
Create a production-grade blueprint and architectural scaffolding for this project requirement:
"${promptText}"
Target Architecture Category: ${projectType}

You must respond ONLY with a raw, valid JSON object matching this schema. Do NOT use markdown code blocks, do NOT write \`\`\`json, and do NOT add explanatory text outside the JSON.

JSON Schema:
{
  "title": "Clean concise project title",
  "summary": "1-2 sentence architectural overview of the application",
  "techStack": {
    "frontend": ["tech1", "tech2"],
    "backend": ["tech1", "tech2"],
    "database": ["tech1", "tech2"],
    "devops": ["tech1", "tech2"]
  },
  "folderStructure": "Full ASCII/tree folder structure as a formatted string",
  "databaseSchema": [
    "Table/Collection: column/field definitions with types and relations"
  ],
  "roadmapSteps": [
    {
      "phase": "Phase title (e.g., Phase 1: Auth & Schema)",
      "description": "Specific technical deliverables"
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
    const parsedBlueprint = JSON.parse(cleanJson) as ProjectBlueprint;

    // Automatically persist to Firestore for logged-in user
    await saveProjectToFirestore(parsedBlueprint);

    return parsedBlueprint;
  } catch (err) {
    console.error('Project Blueprint parse error:', rawText);
    throw new Error('Failed to parse project blueprint from AI.');
  }
}