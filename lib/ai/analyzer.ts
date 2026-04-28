export async function analyzeResumeWithAI({
  resumeText,
  jobDescription,
}: {
  resumeText: string;
  jobDescription: string;
}) {
  try {
    /* Future Gemini Call Here */

    return {
      strengths: [],
      weaknesses: [],
      suggestions: [],
      score: null,
    };
  } catch (error) {
    return {
      strengths: [],
      weaknesses: [],
      suggestions: [],
      score: null,
    };
  }
}