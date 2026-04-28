import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    const fileName = file.name.toLowerCase();

    let text = "";

    if (fileName.endsWith(".docx")) {
      const mammoth = await import("mammoth");

      const arrayBuffer = await file.arrayBuffer();

      const result =
        await mammoth.extractRawText({
          arrayBuffer,
        });

      text = result.value;
    } else if (fileName.endsWith(".pdf")) {
      text = "PDF parser next step";
    } else {
      return NextResponse.json(
        { error: "Unsupported file" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      text: text
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Parsing failed" },
      { status: 500 }
    );
  }
}