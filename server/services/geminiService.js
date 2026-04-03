import { GoogleGenerativeAI } from "@google/generative-ai";

let genAI = null;
let model = null;

const getModel = () => {
    if (!model) {
        const apiKey = process.env.GEMINI_API_KEY;
        console.log("[Gemini] Initializing with API key:", apiKey ? `${apiKey.substring(0, 10)}...` : "MISSING!");
        genAI = new GoogleGenerativeAI(apiKey);
        model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    }
    return model;
};

export const generateQuiz = async (topic, difficulty) => {
    try {
        const prompt = `Create a ${difficulty} difficulty quiz about ${topic}. 
        Return strictly in JSON format as an array of 5 objects.
        Each object must have:
        - question: (string)
        - options: (array of 4 strings)
        - correctAnswer: (number 0-3)
        - explanation: (string)`;

        const result = await getModel().generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        const jsonMatch = text.match(/\[.*\]/s);
        const cleanJson = jsonMatch ? jsonMatch[0] : text;

        return JSON.parse(cleanJson);
    } catch (error) {
        console.error("Gemini Quiz Error:", error);
        throw new Error("Failed to generate quiz");
    }
};

export const reviewCode = async (code, language) => {
    try {
        const prompt = `You are a senior code reviewer. Review this ${language} code:\n\n${code}\n\nReturn ONLY valid JSON with this exact structure:
{
  "issues": [
    { "line": "number", "problem": "short 1-line description", "fix": "short 1-line fix" }
  ],
  "improvements": ["short 1-line suggestion"],
  "bestPractices": ["short 1-line practice"],
  "explanation": "2-3 sentence overall assessment",
  "score": "X/10"
}
Rules:
- Keep each issue problem and fix to ONE short sentence max
- improvements and bestPractices: 2-4 items each, one sentence each
- score must be a string like "7/10"
- Do NOT wrap in markdown code blocks`;

        const result = await getModel().generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        const jsonMatch = text.match(/\{.*\}/s);
        const cleanJson = jsonMatch ? jsonMatch[0] : text;

        return JSON.parse(cleanJson);
    } catch (error) {
        console.error("Gemini Review Error:", error);
        throw new Error("Failed to review code");
    }
};

export const generateRoadmapAI = async (topic) => {
    try {
        const prompt = `Create a structured learning roadmap for "${topic}".
        Return strictly in JSON format with these fields:
        - title: (string, e.g. "Machine Learning Roadmap")
        - description: (string, 2-3 sentence overview of what the learner will achieve)
        - level: (string, one of: "beginner", "intermediate", "advanced" — pick the most appropriate)
        - nodes: (array of 8-12 objects, each representing a learning step IN ORDER)
          Each node must have:
          - id: (unique string like "node_1", "node_2", etc.)
          - title: (string, short topic name like "Introduction to Neural Networks")
          - description: (string, 2-3 sentences explaining what to learn in this step and why it matters)
          - type: (string, either "video" or "article")
          - order: (number, starting from 1)
        
        Make the roadmap practical and progressive — each step builds on the previous.
        Do NOT include any markdown formatting or code blocks, return ONLY the raw JSON object.`;

        const result = await getModel().generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        const jsonMatch = text.match(/\{.*\}/s);
        const cleanJson = jsonMatch ? jsonMatch[0] : text;

        return JSON.parse(cleanJson);
    } catch (error) {
        console.error("Gemini Roadmap Error:", error);
        throw new Error("Failed to generate roadmap");
    }
};
