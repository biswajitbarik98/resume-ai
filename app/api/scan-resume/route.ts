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
Return ONLY valid JSON.

{
 "score": 78,
 "keywordMatch": 72,
 "matchedSkills": [],
 "missingSkills": [],
 "strengthsList": [],
 "improvementsList": [],
 "suggestionsList": [],
 "confidence": "High"
}

Resume:
${resumeText}

Job Description:
${jobDescription}
`;

    const result =
      await model.generateContent(prompt);

    const text =
      result.response.text();

    const match =
      text.match(/\{[\s\S]*\}/);

    if (!match) {
      throw new Error("Invalid AI JSON");
    }

    const data = JSON.parse(match[0]);

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      {
        error:
          error.message ||
          "AI scan failed",
      },
      { status: 500 }
    );
  }
}