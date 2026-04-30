import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json(
        { error: "URL missing" },
        { status: 400 }
      );
    }

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          error: `Failed to fetch job page: ${response.status} ${response.statusText}`,
        },
        { status: response.status || 502 }
      );
    }

    const html = await response.text();

    const clean = html
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

   const text = clean
  .slice(0, 6000)
  .replace(/\b(apply now|login|register|cookie|privacy|terms|share|menu)\b/gi, "")
  .replace(/\s+/g, " ")
  .trim();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing Gemini API key" },
        { status: 500 }
      );
    }



const geminiRes = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: `
Extract job details from this job description.

Return JSON only:

{
  "title": "",
  "company": "",
  "employmentType": "",
  "experience": "",
  "location": "",
  "seniority": "",
  "skills": []
}

Job Description:
${text}
              `,
            },
          ],
        },
      ],
    }),
  }
);

    if (!geminiRes.ok) {
      const errorText = await geminiRes.text();

console.error(
  "Gemini API error:",
  geminiRes.status,
  errorText
);
      return NextResponse.json({
  text,
  title: "Role Detected",
  company: "Not Found",
  employmentType: "Not Found",
  experience: "Not Found",
  location: "Not Found",
  seniority: "Not Found",
  skills: ["Not Found"],
});}

const geminiData = await geminiRes.json();

const raw =
  geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

const cleaned = raw
  .replace(/```json/g, "")
  .replace(/```/g, "")
  .trim();

let parsed: Record<string, unknown>;

try {
  parsed = JSON.parse(cleaned);
} catch (err) {
  console.error("Parsing error:", err);
  parsed = {};
}

console.log("GEMINI RESPONSE:", JSON.stringify(geminiData, null, 2));

return NextResponse.json({
  text,
  title: typeof parsed.title === "string" ? parsed.title : "Not Found",
  company: typeof parsed.company === "string" ? parsed.company : "Not Found",
  employmentType:
    typeof parsed.employmentType === "string"
      ? parsed.employmentType
      : "Not Found",
  experience:
    typeof parsed.experience === "string" ? parsed.experience : "Not Found",
  location: typeof parsed.location === "string" ? parsed.location : "Not Found",
  seniority:
    typeof parsed.seniority === "string" ? parsed.seniority : "Not Found",
  skills:
    Array.isArray(parsed.skills) && parsed.skills.length > 0
      ? parsed.skills
      : ["Not Found"],
});


  } catch (err) {
    console.error("Fetch-job route failed:", err);
    return NextResponse.json(
      { error: "Failed to fetch job page." },
      { status: 500 }
    );
  }
}