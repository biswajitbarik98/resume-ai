import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  try {
    const { resumeText, jobDescription } =
      await req.json();

    const genAI = new GoogleGenerativeAI(
      process.env.GEMINI_API_KEY!
    );

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite",
    });

    const prompt = `
You are an elite ATS recruiter, hiring manager, and resume evaluator.

TASK:
Analyze any candidate resume against any job description for any profession or industry.

This tool must work dynamically for all job roles including:
Technology, Engineering, Analytics, Finance, Marketing, HR, Operations, Sales, Product, Design, Healthcare, Education, Legal, Freshers, Experienced professionals, and management roles.

Return ONLY valid JSON in this exact format:

{
  "score": 78,
  "keywordMatch": 72,
  "matchedSkills": [],
  "missingSkills": [],
  "strengthsList": [],
  "improvementsList": [],
  "suggestionsList": [],
  "confidence": "High",
  "breakdown": {
    "skills": 80,
    "experience": 75,
    "keywords": 70,
    "education": 65
  }
}

SCORING RULES:
- score = overall ATS fit out of 100
- keywordMatch = keyword relevance %
- confidence = High / Medium / Low based on data certainty and match quality

ANALYZE INTELLIGENTLY:
1. Required skills match
2. Transferable skills match
3. Experience relevance
4. Job title alignment
5. Achievements / impact
6. ATS keyword coverage
7. Education / certifications relevance
8. Resume clarity and formatting
9. Seniority level fit
10. Industry/domain relevance

VERY IMPORTANT MATCHING RULE:
Understand synonyms and variations.

Examples:
Power BI = PowerBI = Power-BI
SQL = MySQL / PostgreSQL / SQL Server (related)
Excel = Advanced Excel / Spreadsheet Analytics
Business Intelligence = BI
HR = Human Resources
Frontend = UI Developer / React Developer
Marketing = Digital Marketing / Growth Marketing

Do semantic matching, not only exact keyword matching.

RULES:
- matchedSkills = top relevant skills already present
- missingSkills = critical missing JD requirements
- strengthsList = strongest positive resume points
- improvementsList = highest priority gaps hurting ATS score
- suggestionsList = practical ways to improve score
- Return 3 to 8 items each based on quality
- Never invent false negatives
- Never claim a skill is missing if clearly present
- Use human realistic recruiter judgment
- Sound like human, not robotic
- No markdown
- No explanations
- No extra text

Resume:
${resumeText}

Job Description:
${jobDescription}
`;

    const result =
      await model.generateContent(prompt);

    const text = result.response.text();

    const match =
      text.match(/\{[\s\S]*\}/);

    if (!match) {
      throw new Error("Invalid AI JSON");
    }

    const data = JSON.parse(match[0]);

    if (!data.score) data.score = 65;
    if (!data.keywordMatch)
      data.keywordMatch = 60;
    if (!data.confidence)
      data.confidence = "Medium";

    return NextResponse.json(data);

  } catch (error) {
    console.error("scan-resume error:", error);

    return NextResponse.json(
      { error: "Unable to scan resume" },
      { status: 500 }
    );
  }
}