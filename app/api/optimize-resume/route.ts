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

    const prompt = jobDescription
  ? `
You are an expert resume writer and recruiter.

Rewrite the resume specifically for the target job.

IMPORTANT RULES:
- Write in natural human tone, not AI tone
- Sound like a real experienced candidate
- Avoid robotic phrases and generic buzzwords
- Avoid lines like "results-driven", "highly motivated", "dynamic professional"
- Keep wording believable and realistic
- Keep achievements truthful
- Add ATS keywords naturally from the job description
- Improve grammar, clarity and impact
- Use concise bullet points
- Use these sections:
NAME
SUMMARY
SKILLS
EXPERIENCE
PROJECTS
EDUCATION
CERTIFICATIONS (if relevant)

- Return plain text only
- No markdown
- No asterisks
- No explanation

Resume:
${resumeText}

Job Description:
${jobDescription}
`
  : `
You are an expert resume writer and recruiter.

Rewrite this resume for strong ATS performance.

IMPORTANT RULES:
- Write in natural human tone
- Sound like a real candidate, not AI generated
- Avoid robotic phrases and fake corporate buzzwords
- Keep wording believable and professional
- Improve grammar and clarity
- Use concise bullet points
- Add relevant ATS keywords naturally
- Keep truthful experience
- Use these sections:
NAME
SUMMARY
SKILLS
EXPERIENCE
PROJECTS
EDUCATION
CERTIFICATIONS (if relevant)

- Return plain text only
- No markdown
- No asterisks
- No explanation

Resume:
${resumeText}
`;

    const result =
      await model.generateContent(prompt);

    const text =
      result.response.text();

    return NextResponse.json({
      optimizedText:
        text || "No output generated",
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error:
          error.message ||
          "Optimization failed",
      },
      { status: 500 }
    );
  }
}