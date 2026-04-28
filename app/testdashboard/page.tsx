"use client";

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
} from "docx";
import { supabase } from "@/lib/supabase";
import mammoth from "mammoth";
import jsPDF from "jspdf";
import {
  useState,
  useRef,
  useEffect,
  type DragEvent,
  type ReactNode,
} from "react";
import Link from "next/link";
import {
  usePathname,
  useRouter,
} from "next/navigation";
import {
  LayoutDashboard,
  DiamondPercent,
  UserCircle,
  Upload,
  FileText,
  Scan,
  Gem,
  LogOut,
  AlertTriangle,
  X,
  CheckCircle2,
  FileUp,
  AlertCircle,
  Loader2,
  ExternalLink,
  Sparkles,
  Download,
  CheckCircle,
  ArrowRight,
  FileSearch,
  ChevronUp,
  ChevronDown,
  RotateCcw,
  Briefcase,
  Clock3,
  MapPin,
  Search,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

export default function DashboardPage() {
  const pathname = usePathname();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const [docxHtml, setDocxHtml] = useState("");

  const [tempSelection, setTempSelection] = useState<string | null>(null);
  const [confirmedResumeId, setConfirmedResumeId] = useState<string | null>(
    null
  );

  const [renameResume, setRenameResume] = useState<{
  id: string;
  name: string;
} | null>(null);

const [currentUserId, setCurrentUserId] =
  useState<string | null>(null);

const [scanHistory, setScanHistory] = useState<any[]>([]);

const [scanInputMode, setScanInputMode] = useState<"text" | "url">("text");

const [renameValue, setRenameValue] = useState("");

const [toast, setToast] = useState<{
  show: boolean;
  message: string;
  type: "success" | "error";
}>({
  show: false,
  message: "",
  type: "success",
});

const [scanOptimizing, setScanOptimizing] = useState(false);

const handleRunNewScan = () => {
  setShowScanResult(false);
  setShowKeywordModal(false);
  setScanExpanded(true);
}

  const [viewingResume, setViewingResume] = useState<{
    name: string;
    url: string;
  } | null>(null);

  const [showAnalysisModal, setShowAnalysisModal] = useState(false);

  const [isViewerLoading, setIsViewerLoading] = useState(false);

  const [jobInput, setJobInput] = useState("");
  const [jobError, setJobError] = useState("");
  const [jobMeta, setJobMeta] = useState<Record<string, any> | null>(null);

  const [dragActive, setDragActive] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [optimizingId, setOptimizingId] = useState<string | null>(null);

  const [scanLoading, setScanLoading] = useState(false);
  const [scanCount, setScanCount] = useState(0);
  const [showScanResult, setShowScanResult] = useState(false);
  const [showKeywordModal, setShowKeywordModal] = useState(false);
  const [scanExpanded, setScanExpanded] = useState(true);

  const [resumeToDelete, setResumeToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const [resumes, setResumes] = useState<any[]>([]);

  useEffect(() => {
  const checkUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    setCurrentUserId(user.id);
  };

  checkUser();
}, [router]);

useEffect(() => {
  const loadResumes = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const {
  data: { user: currentUser },
} = await supabase.auth.getUser();

if (!currentUser) return;

const { data, error } = await supabase
  .from("resumes")
  .select("*")
  .eq("user_id", currentUser.id)
  .order("created_at", {
    ascending: false,
  });

    if (error) {
      console.error(error);
      return;
    }

    const formatted =
      data?.map((item) => ({
        id: item.id,
        name: item.name,
        url: item.file_url,
        text: item.parsed_text,
        uploadedAt: new Date(
          item.created_at
        ).toLocaleDateString(),
        size: "Saved Resume",
        isOptimized:
          item.name.includes("_AI_Optimized"),
      })) || [];

    setResumes(formatted);
  };

  loadResumes();
}, []);

  const isActive = (path: string) => pathname === path;

  const selectedResume = resumes.find((r) => r.id === confirmedResumeId);
  const selectedResumeName = selectedResume?.name;

  const handleOpenViewer = async (resume: {
  name: string;
  url: string;
}) => {
  setViewingResume(resume);

  const isDocx = resume.name.toLowerCase().endsWith(".docx");

  if (isDocx) {
    setIsViewerLoading(true);

    try {
      const response = await fetch(`${resume.url}?t=${Date.now()}`);

if (!response.ok) {
  throw new Error("Unable to load file");
}

const arrayBuffer = await response.arrayBuffer();

      const result = await mammoth.convertToHtml({
        arrayBuffer,
      });

      setDocxHtml(result.value);
    } catch (error) {
      setDocxHtml(
        "<p style='color:red;'>Failed to preview DOCX file.</p>"
      );
    }

    setIsViewerLoading(false);
  } else {
    setDocxHtml("");
    setIsViewerLoading(true);
  }
};

  const validateAndSetFile = (file: File) => {
    setUploadError(null);

    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!validTypes.includes(file.type)) {
      setUploadError("Invalid format. Please upload PDF or DOCX only.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setUploadError("File size exceeded. Max 2 MB.");
      return;
    }

    setUploadFile(file);
  };

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const [scanData, setScanData] = useState({
  strengthsList: [] as string[],
  improvementsList: [] as string[],

  confidence: "High",

  score: 0,
  keywordMatch: 0,
  strengths: 0,
  improvements: 0,
  suggestions: 0,

  matchedSkills: [] as string[],
  missingSkills: [] as string[],
  suggestionsList: [] as string[],

  breakdown: {
    skills: 0,
    experience: 0,
    keywords: 0,
    other: 0,
  },
});

const handleUpload = async () => {
  if (!uploadFile || uploading) return;

  try {
    setUploading(true);
    setUploadError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      showToast("Please login first", "error");
      setUploading(false);
      return;
    }

    const fileExt = uploadFile.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `uploads/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("resumes")
      .upload(filePath, uploadFile, {
        upsert: true,
      });

    if (uploadError) throw uploadError;

    const { data: publicData } = supabase.storage
      .from("resumes")
      .getPublicUrl(filePath);

    const fileUrl = publicData.publicUrl;

    const formData = new FormData();
    formData.append("file", uploadFile);

    const res = await fetch("/api/extract-resume", {
      method: "POST",
      body: formData,
    });

    const parsed = await res.json();

    const { data, error } = await supabase
      .from("resumes")
      .insert([
        {
          name: uploadFile.name,
          file_url: fileUrl,
          parsed_text: parsed.text || "",
          user_id: user.id,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    setResumes((prev) => [
      {
        id: data.id,
        name: data.name,
        url: data.file_url,
        text: data.parsed_text,
        uploadedAt: new Date().toLocaleDateString(),
        size: `${Math.round(uploadFile.size / 1024)} KB`,
        isOptimized: false,
      },
      ...prev,
    ]);

    setUploadFile(null);
    setIsUploadModalOpen(false);

    showToast("Resume uploaded successfully");
  } catch (error: any) {
    showToast(error.message || "Upload failed", "error");
  } finally {
    setUploading(false);
  }
};

const handleOptimize = async (
  id: string,
  originalName: string
) => {
  setOptimizingId(id);

try {
  const resume = resumes.find(
    (item) => item.id === id
  );

  if (!resume) return;

  const isScanOptimize =
    confirmedResumeId === id &&
    jobInput.trim().length > 0;

  const res = await fetch(
    "/api/optimize-resume",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        resumeText: resume.text,
        jobDescription: isScanOptimize
          ? jobInput
          : "",
      }),
    }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error);
  }

  const optimizedText = (
  data.optimizedText || ""
)
  .replace(/\*\*/g, "")
  .replace(/###/g, "")
  .replace(/__/g, "")
  .trim();

  const lines = optimizedText
    .split("\n")
    .map((line: string) => line.trim())
    .filter(Boolean);

  const sectionTitles = [
  "SUMMARY",
  "PROFESSIONAL SUMMARY",
  "SKILLS",
  "TECHNICAL SKILLS",
  "EXPERIENCE",
  "WORK EXPERIENCE",
  "EMPLOYMENT",
  "PROJECTS",
  "EDUCATION",
  "CERTIFICATIONS",
  "ACHIEVEMENTS",
];

const children = lines.map((line: string, index: number) => {
  const upper = line.toUpperCase();

  const isHeading =
    sectionTitles.includes(upper) ||
    line.endsWith(":");

  const isBullet =
    line.startsWith("-") ||
    line.startsWith("•");

  if (index === 0 && line.length < 45) {
    return new Paragraph({
      spacing: { after: 220 },
      children: [
        new TextRun({
          text: line,
          bold: true,
          size: 34,
          font: "Calibri",
        }),
      ],
    });
  }

  if (isHeading) {
    return new Paragraph({
      spacing: {
        before: 260,
        after: 140,
      },
      children: [
        new TextRun({
          text: line.replace(":", ""),
          bold: true,
          size: 28,
          font: "Calibri",
        }),
      ],
    });
  }

  if (isBullet) {
    return new Paragraph({
      bullet: { level: 0 },
      spacing: { after: 100 },
      children: [
        new TextRun({
          text: line
            .replace(/^[-•]\s*/, ""),
          size: 24,
          font: "Calibri",
        }),
      ],
    });
  }

  return new Paragraph({
    spacing: { after: 100 },
    children: [
      new TextRun({
        text: line,
        size: 24,
        font: "Calibri",
      }),
    ],
  });
});

const doc = new Document({
  sections: [
    {
      properties: {},
      children,
    },
  ],
});

const buffer = await Packer.toBuffer(doc);
const uint8Array = new Uint8Array(buffer as unknown as ArrayBuffer);

const fileName = `${Date.now()}_optimized.docx`;

const file = new File(
  [uint8Array],
  fileName,
  {
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  }
);

  const filePath = `uploads/${fileName}`;

  const { error: uploadError } =
    await supabase.storage
      .from("resumes")
      .upload(filePath, file, {
        contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });

  if (uploadError) throw uploadError;

  const { data: publicData } =
    supabase.storage
      .from("resumes")
      .getPublicUrl(filePath);

  const fileUrl =
    publicData.publicUrl;

  const newName =
    originalName.replace(/\.[^/.]+$/, "") +
    "_AI_Optimized.docx";

  const {
  data: { user },
} = await supabase.auth.getUser();

if (!user) {
  showToast("Login required", "error");
  return;
}

const {
  data: { user: currentUser },
} = await supabase.auth.getUser();

if (!currentUser) {
  showToast("Login required", "error");
  return;
}

const { data: savedRow, error } =
  await supabase
    .from("resumes")
    .insert([
      {
        name: newName,
        file_url: fileUrl,
        parsed_text: optimizedText,
        user_id: currentUser.id,
      },
    ])
    .select()
    .single();

  if (error) throw error;

  setResumes((prev) => [
    {
      id: savedRow.id,
      name: savedRow.name,
      url: savedRow.file_url,
      text: savedRow.parsed_text,
      uploadedAt:
        new Date().toLocaleDateString(),
      size: "AI Generated",
      isOptimized: true,
    },
    ...prev,
  ]);

  showToast(
    "AI optimized resume created"
  );
} catch (error: any) {
  showToast(
    error.message ||
      "Optimization failed",
    "error"
  );
}

setOptimizingId(null);
};

const handleRunScan = async () => {
  if (scanLoading) return;
  if (!confirmedResumeId) return;

  setScanLoading(true);
  setShowScanResult(false);
  setJobMeta(null);
  setJobError("");

  try {
    let detectedTitle = "Detected Role";
    let finalJobDescription = jobInput.trim();

    const isUrl = /^https?:\/\/.+/i.test(finalJobDescription);

    if (isUrl) {
      const res = await fetch("/api/fetch-job", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: finalJobDescription,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      finalJobDescription = data.text;
      setJobMeta(data);
    }

    if (!finalJobDescription) {
      throw new Error(
        "Please paste job description or URL."
      );
    }

    if (!isUrl) {
  const text = finalJobDescription;

  /* Title */
  const titleMatch = text.match(
    /(data analyst|business analyst|software engineer|data engineer|product manager|project manager|frontend developer|backend developer)/i
  );

  const title = titleMatch
    ? titleMatch[0]
        .split(" ")
        .map(
          (w) =>
            w.charAt(0).toUpperCase() +
            w.slice(1).toLowerCase()
        )
        .join(" ")
    : "Detected Role";
  
  detectedTitle = title;

  /* Company */
  const companyMatch =
    text.match(
      /(at|with|for)\s+([A-Z][A-Za-z0-9&.\-\s]{2,30})/
    );

  const company = companyMatch
    ? companyMatch[2].trim()
    : "Not Mentioned";

  /* Employment Type */
  const typeMatch = text.match(
    /(full[- ]time|part[- ]time|contract|internship|freelance)/i
  );

  const employmentType = typeMatch
    ? typeMatch[0]
        .replace("-", " ")
        .replace(/\b\w/g, (c) =>
          c.toUpperCase()
        )
    : "Not Mentioned";

  /* Experience */
  const expMatch = text.match(
    /(\d+\+?\s*(?:to|-)?\s*\d*\+?\s*years?)/i
  );

  const experience = expMatch
    ? expMatch[0]
    : "Not Mentioned";

  /* Location */
  const locationMatch = text.match(
    /(remote|hybrid|onsite|bangalore|hyderabad|pune|mumbai|delhi|chennai|kolkata|jaipur)/i
  );

  const location = locationMatch
    ? locationMatch[0]
        .charAt(0)
        .toUpperCase() +
      locationMatch[0].slice(1)
    : "Not Mentioned";

  /* Skills */
  const skillPool = [
    "SQL",
    "Python",
    "Excel",
    "Power BI",
    "Tableau",
    "MySQL",
    "Snowflake",
    "AWS",
    "React",
    "Node.js",
    "ETL",
    "Dashboard",
    "Analytics",
    "Communication",
  ];

  const skills = skillPool.filter((skill) =>
    text.toLowerCase().includes(
      skill.toLowerCase()
    )
  );

  setJobMeta({
    title,
    company,
    employmentType,
    skills:
      skills.length > 0
        ? skills
        : ["Not Mentioned"],
    experience,
    location,
  });
}

const res = await fetch("/api/scan-resume", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    resumeText: selectedResume?.text,
    jobDescription: finalJobDescription,
  }),
});

const aiData = await res.json();

if (!res.ok) {
  throw new Error(aiData.error || "Scan failed");
}

const score = aiData.score;

setScanData({
  score: aiData.score,
  keywordMatch: aiData.keywordMatch,

  matchedSkills: aiData.matchedSkills || [],
  missingSkills: aiData.missingSkills || [],

  strengthsList: aiData.strengthsList || [],
  improvementsList:
    aiData.improvementsList || [],

  suggestionsList:
    aiData.suggestionsList || [],

  strengths:
    aiData.strengthsList?.length || 0,

  improvements:
    aiData.improvementsList?.length || 0,

  suggestions:
    aiData.suggestionsList?.length || 0,

  confidence:
    aiData.confidence || "High",

  breakdown: {
    skills: aiData.keywordMatch,
    experience: 80,
    keywords: aiData.keywordMatch,
    other: 75,
  },
});

    setTimeout(() => {
  setScanLoading(false);
  setShowScanResult(true);
  setScanCount((prev) => prev + 1);

  setScanHistory((prev) => [
    {
      id: Date.now(),
      role: detectedTitle,
      score,
      resume: selectedResumeName,
      date: new Date().toLocaleString(),
    },
    ...prev.slice(0, 4),
  ]);
}, 1500);

  } catch (error: any) {
    setScanLoading(false);
    setJobError(error.message);
  }
};

const showToast = (
  message: string,
  type: "success" | "error" = "success"
) => {
  setToast({
    show: true,
    message,
    type,
  });

  setTimeout(() => {
    setToast((prev) => ({
      ...prev,
      show: false,
    }));
  }, 3000);
};

  const handleDownloadReport = () => {
    const blob = new Blob(
      [
        `AI Resume Scan Report

Resume: ${selectedResumeName}

ATS Score: ${scanData.score}/100
Keyword Match: ${scanData.keywordMatch}%
Strengths:
- Clean Section Headings
- Quantified Achievements
- Good Skills Presentation

Areas to Improve:
- Add More Relevant Keywords
- Improve Summary Section
- Include More Metrics
`,
      ],
      { type: "text/plain" }
    );

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "AI_Resume_Report.txt";
    a.click();

    URL.revokeObjectURL(url);
  };

  const generateResumePDF = (
  fileName: string,
  content: string
) => {
  const pdf = new jsPDF();

  const pageWidth =
    pdf.internal.pageSize.getWidth();

  let y = 20;

  const lines = content
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  lines.forEach((line, index) => {
    const upper = line.toUpperCase();

    const isHeading = [
      "SUMMARY",
      "SKILLS",
      "EXPERIENCE",
      "EDUCATION",
      "PROJECTS",
      "CERTIFICATIONS",
    ].includes(upper);

    if (index === 0) {
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(20);
      pdf.text(line, 20, y);
      y += 12;
      return;
    }

    if (isHeading) {
      y += 6;
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(14);
      pdf.text(line, 20, y);
      y += 8;
      return;
    }

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(11);

    const wrapped = pdf.splitTextToSize(
      line,
      pageWidth - 40
    );

    pdf.text(wrapped, 20, y);

    y += wrapped.length * 6;

    if (y > 270) {
      pdf.addPage();
      y = 20;
    }
  });

  pdf.save(fileName);
};

  return (
    <div className="min-h-screen bg-[#D9D9D9] text-[#0B1F3A] overflow-x-hidden">

      {toast.show && (
  <div className="fixed top-6 right-6 z-[300]">
    <div
      className={`min-w-[320px] rounded-2xl px-5 py-4 shadow-2xl border bg-white ${
        toast.type === "success"
          ? "border-green-200"
          : "border-red-200"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-9 h-9 rounded-full flex items-center justify-center font-bold ${
            toast.type === "success"
              ? "bg-green-100 text-green-600"
              : "bg-red-100 text-red-600"
          }`}
        >
          {toast.type === "success" ? "✓" : "!"}
        </div>

        <p className="font-medium text-[#0B1F3A]">
          {toast.message}
        </p>
      </div>
    </div>
  </div>
)}

      {/* VIEWER */}
      <div
        className={`fixed inset-y-0 right-0 z-[100] w-full max-w-3xl bg-white shadow-2xl transform transition duration-500 ${
          viewingResume ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {viewingResume && (
          <div className="h-full flex flex-col">
            <div className="p-4 bg-[#0B1F3A] text-white flex justify-between">
              <div className="font-bold">{viewingResume.name}</div>

              <button onClick={() => setViewingResume(null)}>
                <X />
              </button>
            </div>

            <div className="flex-1 relative">
              {isViewerLoading && (
    <div className="absolute inset-0 grid place-items-center bg-white z-10">
      <Loader2 className="animate-spin text-blue-600" size={36} />
    </div>
  )}

  {viewingResume.name.toLowerCase().endsWith(".pdf") ? (
    <iframe
      className="w-full h-full"
      src={viewingResume.url}
      onLoad={() => setIsViewerLoading(false)}
    />
  ) : (
    <div className="h-full overflow-y-auto bg-white p-8">
      <div
        className="prose prose-slate max-w-none"
        dangerouslySetInnerHTML={{
          __html: docxHtml,
        }}
      />
    </div>
  )}
            </div>
          </div>
        )}
      </div>

      {/* DELETE MODAL */}
      {resumeToDelete && (
        <div className="fixed inset-0 bg-black/60 z-[120] grid place-items-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full">
            <h2 className="text-xl font-bold">Delete Resume?</h2>
            <p className="mt-2 text-sm text-slate-500">
              {resumeToDelete.name}
            </p>

            <div className="grid grid-cols-2 gap-3 mt-6">
              <button
                onClick={() => setResumeToDelete(null)}
                className="border rounded-xl py-3"
              >
                Cancel
              </button>

              <button
                onClick={async () => {
  try {
    const resume = resumes.find(
      (r) => r.id === resumeToDelete.id
    );

    if (!resume) return;

    /* Delete storage file */
    if (resume.url) {
      const path = resume.url.split("/resumes/")[1];

      if (path) {
        await supabase.storage
          .from("resumes")
          .remove([path]);
      }
    }

    /* Delete DB row */
    const {
  data: { user },
} = await supabase.auth.getUser();

await supabase
  .from("resumes")
  .delete()
  .eq("id", resumeToDelete.id)
  .eq("user_id", user?.id);

    /* Remove UI */
    setResumes((prev) =>
      prev.filter(
        (r) => r.id !== resumeToDelete.id
      )
    );

    if (
      confirmedResumeId ===
      resumeToDelete.id
    ) {
      setConfirmedResumeId(null);
      setShowScanResult(false);
    }

    setResumeToDelete(null);

    showToast(
      "Resume deleted successfully"
    );
  } catch (error) {
    showToast(
      "Delete failed",
      "error"
    );
  }
}}
                className="bg-red-500 text-white rounded-xl py-3"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RENAME MODAL */}
{renameResume && (
  <div className="fixed inset-0 bg-black/60 z-[125] grid place-items-center p-4">
    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
      <h2 className="text-2xl font-bold text-[#0B1F3A]">
        Rename Resume
      </h2>

      <p className="text-slate-500 text-sm mt-2">
        Update your resume filename.
      </p>

      <input
        value={renameValue}
        onChange={(e) =>
          setRenameValue(e.target.value)
        }
        className="w-full border rounded-2xl px-4 py-3 mt-5 focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Enter new file name"
      />

      <p className="text-xs text-slate-400 mt-2">
        File extension remains same.
      </p>

      <div className="grid grid-cols-2 gap-3 mt-6">
        <button
  onClick={() => {
    setRenameResume(null);
    setRenameValue("");
  }}
  className="border rounded-2xl py-3 font-medium hover:bg-slate-50"
>
  Cancel
</button>

        <button
          onClick={async () => {
  if (!renameValue.trim()) return;

  try {
    const oldName = renameResume.name;
    const ext = "." + oldName.split(".").pop();

    const newName = renameValue.trim() + ext;

    // ✅ Update DB first
    await supabase
      .from("resumes")
      .update({
        name: newName,
      })
      .eq("id", renameResume.id);

    // ✅ Then update UI
    setResumes((prev) =>
      prev.map((resume) =>
        resume.id === renameResume.id
          ? { ...resume, name: newName }
          : resume
      )
    );

    setRenameResume(null);
    setRenameValue("");

    showToast("Resume renamed successfully");
  } catch (error) {
    showToast("Rename failed", "error");
  }
}}

          className="bg-blue-600 text-white rounded-2xl py-3 font-medium hover:bg-blue-700"
        >
          Save Changes
        </button>
      </div>
    </div>
  </div>
)}

{/* COMPLETE ANALYSIS MODAL */}
{showAnalysisModal && (
  <div className="fixed inset-0 bg-black/60 z-[140] grid place-items-center p-4">

    <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">

      {/* Header */}
      <div className="p-6 border-b flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-[#0B1F3A]">
            Complete Analysis
          </h2>

          <p className="text-sm text-slate-500 mt-1">
            Detailed AI insights for {selectedResumeName}
          </p>
        </div>

        <button
          onClick={() => setShowAnalysisModal(false)}
          className="text-slate-500 hover:text-black"
        >
          <X />
        </button>
      </div>

      {/* Body */}
      <div className="p-6 space-y-6">

        {/* Score Cards */}
        <div className="grid md:grid-cols-4 gap-4">

          <MetricBox
  title="ATS Score"
  value={`${scanData.score}`}
  sub="Dynamic Score"
  color="green"
/>

<MetricBox
  title="Keyword Match"
  value={`${scanData.keywordMatch}%`}
  sub="Matched"
  color="blue"
/>

<MetricBox
  title="Strengths"
  value={`${scanData.strengths}`}
  sub="Found"
  color="emerald"
/>

<MetricBox
  title="Improvements"
  value={`${scanData.improvements}`}
  sub="Needed"
  color="orange"
/>

<MetricBox
  title="AI Suggestions"
  value={`${scanData.suggestions}`}
  sub="Generated"
  color="purple"
/>

        </div>

        {/* Missing Keywords */}
        <div className="rounded-3xl border p-6">
          <h3 className="font-bold text-[#0B1F3A] mb-4">
            Missing Keywords
          </h3>

          <div className="flex flex-wrap gap-2">
  {(scanData.missingSkills.length > 0
    ? scanData.missingSkills
    : ["No major missing keywords"]
  ).map((item) => (
    <span
      key={item}
      className={`px-3 py-2 rounded-full text-sm ${
        item === "No major missing keywords"
          ? "bg-green-50 text-green-600"
          : "bg-red-50 text-red-600"
      }`}
    >
      {item}
    </span>
  ))}
</div>
        </div>

        {/* Suggestions */}
        <div className="rounded-3xl border p-6">
          <h3 className="font-bold text-[#0B1F3A] mb-4">
            AI Suggestions
          </h3>

          <ul className="space-y-3 text-sm text-slate-600">
  {(scanData.suggestionsList || []).map(
    (item, index) => (
      <li key={index}>
        ✓ {item}
      </li>
    )
  )}
</ul>
        </div>

      </div>

      {/* Footer */}
      <div className="border-t p-6 flex justify-end gap-3">
        <button
          onClick={() => setShowAnalysisModal(false)}
          className="px-6 py-3 rounded-2xl border"
        >
          Close
        </button>

        <button
          onClick={handleDownloadReport}
          className="px-6 py-3 rounded-2xl bg-blue-600 text-white"
        >
          Download Report
        </button>
      </div>

    </div>
  </div>
)}


      {/* KEYWORD MODAL */}
      {showKeywordModal && (
        <div className="fixed inset-0 bg-black/60 z-[130] grid place-items-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-xl w-full">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Matched Keywords</h2>

              <button onClick={() => setShowKeywordModal(false)}>
                <X />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-6 text-sm">
              {(
  scanData.matchedSkills.length > 0
    ? scanData.matchedSkills
    : ["No matched keywords"]
).map((item) => (
  <div
    key={item}
    className="bg-green-50 text-green-700 rounded-xl px-3 py-2 border"
  >
    {item}
  </div>
))}
            </div>
          </div>
        </div>
      )}

      {/* UPLOAD MODAL */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[110] grid place-items-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full overflow-hidden">
            <div className="p-6 border-b flex justify-between">
              <h2 className="font-bold text-xl">Upload Resume</h2>

              <button
  onClick={handleUpload}
  disabled={uploading}
  className="w-full h-14 rounded-2xl bg-[#0B1F3A] text-white font-semibold hover:opacity-95 disabled:opacity-60 disabled:cursor-not-allowed transition"
>
  {uploading ? "Uploading..." : "Upload Resume"}
</button>
            </div>

            <div className="p-8">
              {!uploadFile ? (
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer ${
                    dragActive
                      ? "border-blue-600 bg-blue-50"
                      : "border-slate-300"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    hidden
                    accept=".pdf,.docx"
                    onChange={(e) =>
                      e.target.files &&
                      validateAndSetFile(e.target.files[0])
                    }
                  />

                  <FileUp className="mx-auto mb-3 text-blue-600" size={36} />

                  <p>Click or Drop File</p>
                </div>
              ) : (
                <div className="border rounded-2xl p-4">
                  {uploadFile.name}
                </div>
              )}

              {uploadError && (
                <div className="text-red-500 text-sm mt-3">
                  {uploadError}
                </div>
              )}

              <button
  onClick={handleUpload}
  disabled={!uploadFile || uploading}
  className="w-full mt-5 bg-[#0B1F3A] text-white py-4 rounded-2xl disabled:bg-slate-300 flex items-center justify-center gap-2"
>
  {uploading ? (
    <>
      <Loader2 className="animate-spin" size={18} />
      Uploading...
    </>
  ) : (
    "Upload & Save"
  )}
</button>
            </div>
          </div>
        </div>
      )}

      {/* SELECT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[110] grid place-items-center p-4">
          <div className="bg-[#0B1F3A] rounded-3xl text-white max-w-2xl w-full">
            <div className="p-6 flex justify-between border-b border-white/10">
              <h2 className="font-bold text-xl">Select Resume</h2>

              <button onClick={() => setIsModalOpen(false)}>
                <X />
              </button>
            </div>

            <div className="p-6 grid gap-3">
              {resumes.length === 0 && (
  <div className="border-2 border-dashed border-slate-300 rounded-3xl p-12 text-center bg-slate-50">
    <Upload className="mx-auto text-slate-400 mb-4" size={36} />

    <h3 className="text-lg font-bold text-[#0B1F3A]">
      No resumes uploaded yet
    </h3>

    <p className="text-slate-500 mt-2">
      Upload your first PDF or DOCX resume.
    </p>
  </div>
)}
              {resumes.map((resume) => (
                <div
                  key={resume.id}
                  onClick={() => setTempSelection(resume.id)}
                  className={`p-4 rounded-xl cursor-pointer border ${
                    tempSelection === resume.id
                      ? "bg-white text-black border-green-500"
                      : "border-white/20"
                  }`}
                >
                  {resume.name}
                </div>
              ))}
            </div>

            <div className="p-6 flex gap-3">
              <button
                className="flex-1 bg-blue-600 py-3 rounded-xl"
                onClick={() => {
  if (!tempSelection) return;

  setConfirmedResumeId(tempSelection);
  setIsModalOpen(false);

  showToast("Resume selected successfully");
}}
              >
                Confirm Selection
              </button>

              <button
  disabled={resumes.length >= 5}
  onClick={() => {
    setIsModalOpen(false);
    setIsUploadModalOpen(true);
  }}
  className={`border px-6 rounded-xl ${
    resumes.length >= 5
      ? "opacity-50 cursor-not-allowed"
      : ""
  }`}
>
  {resumes.length >= 5
    ? "Limit Reached"
    : "Upload New"}
</button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header className="bg-[#0B1F3A] text-white px-8 py-5 flex justify-between">
        <div>
          <h1 className="text-2xl font-bold">Resume AI Dashboard</h1>
          <p className="text-sm text-slate-300">
            Your job hunting companion
          </p>
        </div>

        <div className="flex items-center gap-3">
          Welcome, User
          <UserCircle />
        </div>
      </header>

      <div className="grid md:grid-cols-[260px_1fr] min-h-[calc(100vh-84px)]">
        {/* SIDEBAR */}
        <aside className="bg-[#0B1F3A] text-white p-6 flex flex-col justify-between">
          <div className="space-y-3">
            {[
              {
                name: "Dashboard",
                href: "/dashboard",
                icon: <LayoutDashboard size={18} />,
              },
              {
                name: "Plans",
                href: "#",
                icon: <DiamondPercent size={18} />,
              },
              {
                name: "My Account",
                href: "#",
                icon: <UserCircle size={18} />,
              },
            ].map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl ${
                  isActive(item.href) || item.name === "Dashboard"
                    ? "bg-white/20"
                    : "hover:bg-white/10"
                }`}
              >
                {item.icon}
                {item.name}
              </Link>
            ))}
          </div>

          <button
  onClick={async () => {
  await supabase.auth.signOut();
  window.location.href = "/login";
}}
  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10"
>
  <LogOut size={18} />
  Logout
</button>
        </aside>

        {/* MAIN */}
        <main className="p-8 space-y-6">
          {/* TOP */}
          <section className="grid md:grid-cols-3 gap-6">
            <Card title="Plan" value="FREE" sub="Upgrade" icon={<Gem />} />
            <Card
              title="Resume Uploaded"
              value={String(resumes.length)}
              sub="Upload up to 5 resumes with premium"
              icon={<FileText />}
            />
            <Card
              title="Scans today"
              value={String(scanCount)}
              sub="Scan unlimited times with premium"
              icon={<Scan />}
            />
          </section>

          {/* SCAN HISTORY */}
{scanHistory.length > 0 && (
  <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">

    <div className="flex justify-between items-center mb-6">
      <div>
        <h2 className="text-xl font-bold text-[#0B1F3A]">
          Recent Scan History
        </h2>

        <p className="text-sm text-slate-500">
          Your last AI resume scans
        </p>
      </div>
    </div>

    <div className="space-y-3">

      {scanHistory.map((item) => (
        <div
          key={item.id}
          className="rounded-2xl border border-slate-200 px-5 py-4 flex justify-between items-center hover:bg-slate-50 transition"
        >
          <div>
            <h4 className="font-semibold text-[#0B1F3A]">
              {item.role}
            </h4>

            <p className="text-sm text-slate-500">
              {item.resume}
            </p>

            <p className="text-xs text-slate-400 mt-1">
              {item.date}
            </p>
          </div>

          <div className="text-right">
            <p className="text-2xl font-bold text-green-600">
              {item.score}%
            </p>

            <p className="text-xs text-slate-400">
              ATS Score
            </p>
          </div>
        </div>
      ))}

    </div>
  </section>
)}

          {/* RESUMES */}
          <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
            <div className="flex justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold">My Resumes</h2>
                <p className="text-xs text-slate-400">
                  PDF / DOCX - Max. 2 MB
                </p>
              </div>

              <button
  onClick={() => setIsUploadModalOpen(true)}
  disabled={resumes.length >= 5}
  className={`px-5 py-2 rounded-xl flex gap-2 ${
    resumes.length >= 5
      ? "bg-slate-300 text-slate-500 cursor-not-allowed"
      : "bg-[#0B1F3A] text-white"
  }`}
>
  <Upload size={18} />
  {resumes.length >= 5
    ? "Limit Reached"
    : "Upload New"}
</button>
            </div>

            
            {resumes.map((resume) => {
  const isPdf = resume.name.toLowerCase().endsWith(".pdf");
  const isDocx = resume.name.toLowerCase().endsWith(".docx");

  return (
    <div
      key={resume.id}
      className="group bg-white border border-slate-200 rounded-3xl px-6 py-5 mb-4 hover:border-blue-200 hover:shadow-xl hover:-translate-y-[2px] transition-all duration-300"
    >
      <div className="flex justify-between gap-6 flex-wrap items-center">
        {/* LEFT */}
        <div className="flex items-center gap-5 min-w-[320px]">
          {/* Icon */}
          <div className="w-16 h-16 rounded-2xl border bg-slate-50 flex items-center justify-center shadow-sm">
            {isPdf ? (
              <div className="text-center">
                <FileText size={24} className="mx-auto text-red-500" />
                <p className="text-[10px] font-bold text-red-500 mt-1">
                  PDF
                </p>
              </div>
            ) : isDocx ? (
              <div className="text-center">
                <FileText size={24} className="mx-auto text-blue-600" />
                <p className="text-[10px] font-bold text-blue-600 mt-1">
                  DOCX
                </p>
              </div>
            ) : (
              <FileText size={24} className="text-slate-500" />
            )}
          </div>

          {/* Details */}
          <div>
            <h3 className="text-lg font-bold text-[#0B1F3A] break-all">
              {resume.name}
            </h3>

            <div className="flex flex-wrap items-center gap-2 mt-2 text-xs">
              <span className="text-slate-500">
                Uploaded: {resume.uploadedAt}
              </span>

              <span className="text-slate-300">•</span>

              <span className="text-slate-500">
                {resume.size}
              </span>

              <span className="text-slate-300">•</span>

              <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 font-medium">
                {isPdf ? "PDF" : "DOCX"}
              </span>

              {resume.isOptimized && (
                <span className="px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 font-semibold">
                  AI Optimized
                </span>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT BUTTONS */}
<div className="flex flex-wrap gap-3">

  <button
    onClick={() => {
      setRenameResume({
        id: resume.id,
        name: resume.name,
      });

      setRenameValue(
        resume.name.replace(/\.[^/.]+$/, "")
      );
    }}
    className="px-5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium hover:bg-slate-50 transition"
  >
    Rename
  </button>

  <button
    onClick={() => handleOpenViewer(resume)}
    className="px-5 py-2.5 rounded-xl border text-sm font-medium hover:bg-slate-50 transition flex items-center gap-2"
  >
    View
    <ExternalLink size={14} />
  </button>

          <button
            onClick={() =>
              setResumeToDelete({
                id: resume.id,
                name: resume.name,
              })
            }
            className="px-5 py-2.5 rounded-xl border border-red-300 text-red-500 text-sm font-medium hover:bg-red-50 transition"
          >
            Delete
          </button>

          {resume.isOptimized ? (
  <div className="flex gap-2">
    <a
      href={resume.url}
      download
      className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition flex items-center gap-2"
    >
      <Download size={14} />
      DOCX
    </a>

    <button
      onClick={() =>
        generateResumePDF(
          resume.name.replace(".docx", ".pdf"),
          resume.text
        )
      }
      className="px-5 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition flex items-center gap-2"
    >
      <Download size={14} />
      PDF
    </button>
  </div>
) : (
  <button
    onClick={() =>
      handleOptimize(resume.id, resume.name)
    }
    disabled={optimizingId === resume.id}
    className="px-5 py-2.5 rounded-xl border border-purple-300 text-purple-600 text-sm font-medium hover:bg-purple-50 transition flex items-center gap-2 disabled:opacity-60"
  >
    {optimizingId === resume.id ? (
      <>
        <Loader2
          size={14}
          className="animate-spin"
        />
        Optimizing...
      </>
    ) : (
      <>
        <Sparkles size={14} />
        Optimize with AI
      </>
    )}
  </button>
)}
        </div>
      </div>
    </div>
  );
})}

            
          </section>

          {/* SCANNER */}
          <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">

  {/* Header */}
  <div className="flex justify-between items-start flex-wrap gap-4 mb-8">

    <div>
      <h2 className="text-3xl font-bold text-[#0B1F3A]">
        AI Resume Scanner
      </h2>

      <p className="text-slate-500 mt-2">
        Analyze your resume against the job description and get AI-powered insights.
      </p>
    </div>

    {confirmedResumeId && (
      <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-2xl text-sm flex items-center gap-2">
        <CheckCircle2 size={16} />
        Selected: {selectedResumeName}
      </div>
    )}
  </div>

  {/* Grid */}
  <div className="grid lg:grid-cols-2 gap-6 items-stretch">

    {/* LEFT */}
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 h-full flex flex-col">

      <h3 className="text-xl font-bold text-[#0B1F3A] mb-2">
        Scan Input
      </h3>

      <p className="text-sm text-slate-500 mb-5">
        Paste job description or job URL below.
      </p>

      {/* Tabs */}
<div className="grid grid-cols-2 gap-3 mb-4">
  <button
    onClick={() => {
      setScanInputMode("text");
      setJobInput("");
    }}
    className={`rounded-2xl py-3 font-medium border transition ${
      scanInputMode === "text"
        ? "bg-white border-blue-200 text-blue-600"
        : "bg-slate-100 text-slate-500 border-transparent"
    }`}
  >
    Paste Job Description
  </button>

  <button
    onClick={() => {
      setScanInputMode("url");
      setJobInput("");
    }}
    className={`rounded-2xl py-3 font-medium border transition ${
      scanInputMode === "url"
        ? "bg-white border-blue-200 text-blue-600"
        : "bg-slate-100 text-slate-500 border-transparent"
    }`}
  >
    Job URL
  </button>
</div>

{/* Input Area */}
{scanInputMode === "text" ? (
  <textarea
    rows={10}
    value={jobInput}
    onChange={(e) => setJobInput(e.target.value)}
    placeholder="Paste full job description here..."
    className="w-full flex-1 border border-slate-300 rounded-2xl px-5 py-4 bg-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
  />
) : (
  <input
    type="url"
    value={jobInput}
    onChange={(e) => setJobInput(e.target.value)}
    placeholder="Paste job post URL here..."
    className="w-full border border-slate-300 rounded-2xl px-5 py-4 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
  />
)}

{/* Counter */}
<div className="text-right text-xs text-slate-400 mt-2">
  {scanInputMode === "text"
    ? `${jobInput.length} / 6000`
    : "URL Mode"}
</div>

      {jobError && (
        <p className="text-red-500 text-sm mt-3">
          {jobError}
        </p>
      )}

      <div
  className={`grid gap-3 mt-auto pt-5 ${
    confirmedResumeId
      ? "sm:grid-cols-2"
      : "grid-cols-1"
  }`}
>

        <button
          onClick={() => {
  setTempSelection(
    confirmedResumeId || resumes[0]?.id || null
  );
  setIsModalOpen(true);
}}
          className="bg-[#0B1F3A] text-white px-6 py-3 rounded-2xl hover:bg-[#132a4a] w-full"
        >
          {confirmedResumeId ? "Change Resume" : "Select Resume to Continue"}
        </button>

        {confirmedResumeId && (
          <button
  onClick={handleRunScan}
  disabled={!jobInput.trim() || scanLoading}
  className="bg-blue-600 text-white px-8 py-3 rounded-2xl flex items-center justify-center gap-2 hover:bg-blue-700 w-full disabled:bg-slate-300 disabled:cursor-not-allowed"
>
            {scanLoading ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Scanning...
              </>
            ) : (
              <>
                <FileSearch size={18} />
                Start AI Scan
              </>
            )}
          </button>
        )}
      </div>
    </div>

    {/* RIGHT */}
    <div className="rounded-3xl border border-slate-200 bg-white p-6 h-full flex flex-col">

      <h3 className="text-xl font-bold text-[#0B1F3A] mb-2">
        Detected Job Details
      </h3>

      <p className="text-sm text-slate-500 mb-6">
        Extracted details from the job post will appear here.
      </p>

      {jobMeta ? (
  <>
    {/* Top Role Card */}
    <div className="rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-5 flex gap-4 shadow-sm">

  <div className="w-14 h-14 rounded-2xl bg-white text-emerald-600 flex items-center justify-center shadow-sm">
    <Briefcase size={22} />
  </div>

  <div className="min-w-0">
    <h4 className="text-2xl font-bold text-[#0B1F3A] truncate">
      {jobMeta.title}
    </h4>

    <p className="text-slate-500 mt-1 text-sm">
      {jobMeta.company} • Full-time
    </p>
  </div>

</div>

    {/* Skills */}
    <div className="mt-6">
      <p className="text-sm font-semibold text-[#0B1F3A] mb-3">
        Key Skills
      </p>

      <div className="flex gap-3 flex-wrap">
        {jobMeta.skills?.map((skill: string) => (
          <span
            key={skill}
            className="px-4 py-2 rounded-full bg-violet-50 text-violet-700 text-sm font-medium border border-violet-100"
          >
            {skill}
          </span>
        ))}
      </div>
    </div>

    {/* Meta Info */}
    <div className="grid grid-cols-2 gap-4 mt-7">

      {/* Experience */}
      <div className="rounded-2xl border border-slate-200 p-5 flex gap-4 items-center">

        <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
          <Clock3 size={20} />
        </div>

        <div>
          <p className="text-xs text-slate-500">
            Experience
          </p>

          <p className="font-bold text-[#0B1F3A] text-lg">
            {jobMeta.experience || "Not Mentioned"}
          </p>
        </div>

      </div>

      {/* Location */}
      <div className="rounded-2xl border border-slate-200 p-5 flex gap-4 items-center">

        <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
          <MapPin size={20} />
        </div>

        <div>
          <p className="text-xs text-slate-500">
            Location
          </p>

          <p className="font-bold text-[#0B1F3A] text-lg">
            {jobMeta.location || "Not Mentioned"}
          </p>
        </div>

      </div>

    </div>
  </>
) : (
  <div className="min-h-[280px] flex-1 rounded-3xl border border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 text-sm text-center px-8">
    <FileSearch size={32} className="mb-4 opacity-50" />

    Run a scan to detect job title, company,
    skills, location and experience level.
  </div>
)}
    </div>

  </div>

</section>

            {/* RESULT */}
{showScanResult && (
  <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden mt-8">

    {/* Header */}
    <div className="px-6 py-5 border-b flex justify-between items-center">
      <div className="flex items-center gap-3 flex-wrap">
  <h3 className="text-2xl font-bold text-[#0B1F3A]">
    Scan Results
  </h3>

  <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
    Completed
  </span>

  <span
  className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 ${
    scanData.confidence === "High"
      ? "bg-green-100 text-green-700"
      : scanData.confidence === "Medium"
      ? "bg-orange-100 text-orange-700"
      : "bg-red-100 text-red-700"
  }`}
>
  {scanData.confidence === "High" ? "🟢" :
   scanData.confidence === "Medium" ? "🟠" : "🔴"}

  Confidence: {scanData.confidence}
</span>
</div>

      <button
        onClick={() => setScanExpanded(!scanExpanded)}
        className="text-slate-500 hover:text-black"
      >
        {scanExpanded ? (
          <ChevronUp size={20} />
        ) : (
          <ChevronDown size={20} />
        )}
      </button>
    </div>

    {scanExpanded && (
      <>
        {/* TOP METRICS */}
<div className="grid lg:grid-cols-5 gap-4 p-6 items-stretch">

  <ScoreRing score={scanData.score} />

  <MetricBox
    title="Keyword Match"
    value={`${scanData.keywordMatch}%`}
    sub="Matched"
    color="blue"
  />

  <MetricBox
    title="Strengths"
    value={`${scanData.strengths}`}
    sub="Found"
    color="emerald"
  />

  <MetricBox
    title="Improvements"
    value={`${scanData.improvements}`}
    sub="Needed"
    color="orange"
  />

  <MetricBox
    title="AI Suggestions"
    value={`${scanData.suggestions}`}
    sub="Generated"
    color="purple"
  />

</div>

        {/* INSIGHTS */}
        <div className="grid lg:grid-cols-3 gap-4 px-6 pb-6">

          {/* Strengths */}
          <div className="rounded-3xl border border-slate-200 p-5">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-bold text-[#0B1F3A]">
                Top Strengths
              </h4>

              <span className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-700">
                {scanData.strengthsList.length} Found
              </span>
            </div>

            <ul className="space-y-3 text-sm text-slate-600">

  {(scanData.strengthsList || []).map(
  (item, index) => (
    <li
      key={index}
      className="flex items-center gap-2"
    >
      <CheckCircle2
        size={18}
        className="text-green-500"
      />
      {item}
    </li>
  )
)}

</ul>
          </div>

          {/* Improvements */}
          <div className="rounded-3xl border border-slate-200 p-5">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-bold text-[#0B1F3A]">
                Top Improvements
              </h4>

              <span className="text-xs px-3 py-1 rounded-full bg-orange-100 text-orange-700">
                {scanData.improvementsList.length} Suggestions
              </span>
            </div>

            <ul className="space-y-3 text-sm text-slate-600">

  {(scanData.improvementsList || []).map(
  (item, index) => (
    <li
      key={index}
      className="flex items-center gap-2"
    >
      <AlertTriangle
        size={18}
        className="text-orange-500"
      />
      {item}
    </li>
  )
)}

</ul>
          </div>

          {/* Breakdown */}
          <div className="rounded-3xl border border-slate-200 p-5">
            <h4 className="font-bold text-[#0B1F3A] mb-4">
              Match Breakdown
            </h4>

            <div className="space-y-4 text-sm">
              <BarRow
  label="Skills"
  value={scanData.breakdown.skills}
  color="bg-blue-500"
/>

<BarRow
  label="Experience"
  value={scanData.breakdown.experience}
  color="bg-indigo-500"
/>

<BarRow
  label="Keywords"
  value={scanData.breakdown.keywords}
  color="bg-orange-500"
/>

<BarRow
  label="Other"
  value={scanData.breakdown.other}
  color="bg-green-500"
/>
            </div>
          </div>

        </div>

        {/* ACTIONS */}
<div className="border-t px-6 py-5 grid md:grid-cols-4 gap-4">

  {/* Run New Scan */}
  <button
    onClick={handleRunNewScan}
    className="rounded-2xl border py-3 hover:bg-slate-50 transition"
  >
    Run New Scan
  </button>

  {/* Optimize */}
  <button
    disabled={scanOptimizing}
    onClick={() => {
      if (!confirmedResumeId || !selectedResume) return;

      setScanOptimizing(true);

      handleOptimize(
        selectedResume.id,
        selectedResume.name
      );

      setTimeout(() => {
        setScanOptimizing(false);
      }, 2100);
    }}
    className="rounded-2xl border border-purple-300 text-purple-600 py-3 hover:bg-purple-50 transition disabled:opacity-60"
  >
    {scanOptimizing
      ? "Optimizing..."
      : "Optimize with AI"}
  </button>

  {/* View Analysis */}
  <button
    onClick={() => setShowAnalysisModal(true)}
    className="rounded-2xl border py-3 hover:bg-slate-50 transition"
  >
    View Complete Analysis
  </button>

  {/* Download */}
  <button
    onClick={handleDownloadReport}
    className="rounded-2xl bg-blue-600 text-white py-3 hover:bg-blue-700 transition"
  >
    Download Report
  </button>

</div>
      </>
    )}
  </section>
)}
</main>
</div>
</div>
);
}

function ScoreRing({
  score,
}: {
  score: number;
}) {
  const radius = 44;
  const stroke = 10;
  const normalizedRadius =
    radius - stroke * 0.5;

  const circumference =
    normalizedRadius * 2 * Math.PI;

  const strokeDashoffset =
    circumference -
    (score / 100) * circumference;

  return (
    <div className="rounded-3xl border border-slate-200 p-5 bg-white flex flex-col items-center justify-center h-full">

      <div className="relative w-28 h-28">

        <svg
          height="112"
          width="112"
          className="-rotate-90"
        >
          <circle
            stroke="#E5E7EB"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx="56"
            cy="56"
          />

          <circle
            stroke={
  score >= 80
    ? "#22C55E"
    : score >= 60
    ? "#F97316"
    : "#EF4444"
}
            fill="transparent"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${circumference} ${circumference}`}
            style={{
              strokeDashoffset,
              transition:
                "stroke-dashoffset 1s ease",
            }}
            r={normalizedRadius}
            cx="56"
            cy="56"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-[#0B1F3A]">
            {score}%
          </span>
        </div>
      </div>

      <p className="mt-4 text-lg text-slate-500">
        ATS Score
      </p>

      <p
  className={`font-semibold text-base ${
    score >= 80
      ? "text-green-600"
      : score >= 60
      ? "text-orange-500"
      : "text-red-500"
  }`}
>
        {score >= 85
  ? "Excellent Match"
  : score >= 70
  ? "Strong Match"
  : score >= 55
  ? "Average Match"
  : "Needs Work"}
      </p>
    </div>
  );
}

function MetricBox({
  title,
  value,
  sub,
  color,
}: {
  title: string;
  value: string;
  sub: string;
  color: string;
}) {
  const colors: Record<string, string> = {
    green: "text-green-600 bg-green-50",
    blue: "text-blue-600 bg-blue-50",
    emerald: "text-emerald-600 bg-emerald-50",
    orange: "text-orange-500 bg-orange-50",
    purple: "text-purple-600 bg-purple-50",
  };

  return (
    <div className="rounded-3xl border border-slate-200 p-5 bg-white">
      <div
  className={`w-10 h-10 rounded-2xl flex items-center justify-center ${colors[color]}`}
>
  {title === "Keyword Match" && <Search size={24} />}
  {title === "Strengths" && <ShieldCheck size={24} />}
  {title === "Improvements" && <TrendingUp size={24} />}
  {title === "AI Suggestions" && <Sparkles size={24} />}
</div>

      <p className="text-base font-medium text-slate-500 mt-4">
        {title}
      </p>

      <h4 className="text-4xl font-bold text-[#0B1F3A] mt-2">
        {value}
      </h4>

      <p className="text-base text-slate-400 mt-1">
        {sub}
      </p>
    </div>
  );
}

function BarRow({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-slate-600">{label}</span>
        <span className="text-slate-500">{value}%</span>
      </div>

      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function Card({
  title,
  value,
  sub,
  icon,
}: {
  title: string;
  value: string;
  sub: string;
  icon: ReactNode;
}) {
  const styles: Record<
    string,
    {
      bg: string;
      badge: string;
      iconWrap: string;
      subColor: string;
    }
  > = {
    Plan: {
      bg: "from-blue-50 to-indigo-50",
      badge: "bg-blue-100 text-blue-700",
      iconWrap: "bg-white text-blue-600 shadow-lg shadow-blue-100",
      subColor: "text-purple-600",
    },
    "Resume Uploaded": {
      bg: "from-emerald-50 to-green-50",
      badge: "bg-emerald-100 text-emerald-700",
      iconWrap: "bg-white text-emerald-600 shadow-lg shadow-emerald-100",
      subColor: "text-purple-600",
    },
    "Scans today": {
      bg: "from-orange-50 to-amber-50",
      badge: "bg-orange-100 text-orange-700",
      iconWrap: "bg-white text-orange-500 shadow-lg shadow-orange-100",
      subColor: "text-purple-600",
    },
  };

  const theme = styles[title] || styles["Plan"];

  return (
    <div
      className={`relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br ${theme.bg} border border-white/70 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
    >
      {/* Badge */}
      <div
        className={`inline-flex px-4 py-1 rounded-full text-sm font-medium ${theme.badge}`}
      >
        {title}
      </div>

      {/* Main Content */}
      <div className="mt-5 flex justify-between items-start">
        <div>
          <h3 className="text-5xl font-bold text-[#0B1F3A] leading-none">
            {value}
          </h3>

          <p className="text-slate-500 mt-4 text-lg">
            {title === "Plan"
              ? "Current Plan"
              : title === "Resume Uploaded"
              ? "of 5 resumes"
              : "Today scans"}
          </p>

          <button
            className={`mt-8 font-medium flex items-center gap-2 ${theme.subColor}`}
          >
            {sub}
            <span className="text-xl">→</span>
          </button>
        </div>

        {/* Icon */}
        <div
          className={`w-24 h-24 rounded-full flex items-center justify-center ${theme.iconWrap}`}
        >
          {icon}
        </div>
      </div>

      {/* Decorative dots */}
      <div className="absolute bottom-6 right-8 opacity-10 text-4xl">
      </div>
    </div>
  );
}