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
You are an expert ATS resume optimizer and recruiter.

TASK:
Optimize the resume professionally for ATS screening while preserving all factual information.

STRICT RULES:
1. DO NOT change company names.
2. DO NOT change dates/timeline.
3. DO NOT change job titles.
4. DO NOT add fake achievements.
5. DO NOT invent tools not supported by experience.
6. Keep all real facts exactly same.

MAIN GOAL:
Rewrite the resume with stronger ATS formatting, better wording, cleaner structure.

VERY IMPORTANT - SKILLS SECTION FORMAT:

Always generate the SKILLS section in grouped recruiter-friendly format.

Use categories dynamically based on candidate profile and target job role.

Preferred categories:
- Tools
- Languages
- Data Analysis
- Data Engineering / Cloud
- Business Analysis
- Marketing
- Finance
- Soft Skills
- Other Relevant Skills

Rules for SKILLS section:
1. Group skills logically.
2. Use commas for listing.
3. Use brackets for subskills.
4. Keep concise but keyword-rich.
5. Include only real skills present in resume.
6. Reorder based on target job relevance.
7. Must be ATS friendly.

Example:

SKILLS

Tools: Power BI (Dashboarding, Data Modeling, ETL), Excel (Pivot Table, Lookups, Power Query), Tableau, JIRA

Languages: SQL, Python (Pandas, NumPy, Matplotlib), DAX

Data Engineering: Snowflake, AWS (Glue, Athena, S3, Redshift)

Business Analysis: BRD, FRD, User Stories, Agile, Scrum, UAT

Soft Skills: Stakeholder Management, Communication, Problem Solving, Analytical Thinking

OUTPUT RULES:
- Plain text only
- No markdown
- No stars
- No explanation
- Use professional ATS resume formatting
- Don't sound robotic, keep it human and natural

Resume:
${resumeText}

Job Description:
${jobDescription || "None"}
`;

    const result =
      await model.generateContent(prompt);

    const text = result.response.text();

    const optimizedText = text
      .replace(/\*\*/g, "")
      .replace(/###/g, "")
      .replace(/__/g, "")
      .replace(/\n{3,}/g, "\n\n")
      .replace(/SKILLS\s*\n+/g, "SKILLS\n\n")
      .trim();

    return NextResponse.json({
      optimizedText:
        optimizedText || "No output generated",
    });
  } catch (error) {
    console.error("optimize-resume error:", error);
    return NextResponse.json(
      { error: "Unable to optimize resume" },
      { status: 500 }
    );
  }
}