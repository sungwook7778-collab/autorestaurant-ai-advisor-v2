// services/geminiService.ts
import { ENVIRONMENT_PROMPT, PLANNING_PROMPT } from "../constants";
import {
  AnalysisResult,
  InitialAnalysisResult,
  ConfirmedStoreData,
} from "../types";

/**
 * Convert File → Base64 string (no data:image/... prefix)
 */
const fileToBase64 = async (file: File): Promise<string> => {
  return new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // "data:image/jpeg;base64,XXXX" → "XXXX"
      resolve(result.split(",")[1]);
    };
    reader.readAsDataURL(file);
  });
};

/**
 * POST helper to Cloudflare Worker
 */
const WORKER_URL = "https://ai-proxy.sungwook7778.workers.dev";

/**
 * Send POST request to Cloudflare Worker
 */
const sendToWorker = async (payload: any): Promise<any> => {
  const response = await fetch(WORKER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Worker Error: ${response.status}`);
  }

  const json = await response.json();

  // Google AI returns structure: { candidates: [{ content: { parts: [...] }}]}
  const text =
    json?.candidates?.[0]?.content?.parts?.[0]?.text ??
    json?.text ??
    null;

  if (!text) {
    console.error("Worker returned unexpected structure:", json);
    throw new Error("Invalid AI response from Worker");
  }

  try {
    return JSON.parse(text);
  } catch (e) {
    console.error("Failed parsing AI JSON:", text);
    throw new Error("Invalid JSON received from AI");
  }
};

/**
 * Stage 1 – Analyze Environment
 * Uses Worker:
 *   endpoint: "analyze"
 */
export const analyzeEnvironment = async (
  images: File[]
): Promise<InitialAnalysisResult> => {
  const base64Images = await Promise.all(images.map(fileToBase64));

  const payload = {
    endpoint: "analyze",
    images: base64Images,
    prompt: ENVIRONMENT_PROMPT,
  };

  return await sendToWorker(payload);
};

/**
 * Stage 2 – Generate Automation Plan & ROI
 * Uses Worker:
 *   endpoint: "plan"
 */
export const generateAutomationPlan = async (
  confirmedData: ConfirmedStoreData,
  images: File[]
): Promise<AnalysisResult> => {
  const base64Images = await Promise.all(images.map(fileToBase64));

  const totalLaborCost =
    confirmedData.employeeCostFT + confirmedData.employeeCostPT;

  const promptText = `
    [CONFIRMED DATA - USE AS FACTS]
    Store Category: ${confirmedData.store_category}
    Hall Size: ${confirmedData.estimated_hall_size} Pyung
    Kitchen Size: ${confirmedData.estimated_kitchen_size} Pyung
    Table Count: ${confirmedData.estimated_tables} EA
    Existing Table Order Tablets: ${
      confirmedData.has_table_tablets ? "YES" : "NO"
    }

    Monthly Sales: ${confirmedData.monthlySales} 만원
    Monthly Fixed Cost: ${confirmedData.monthlyFixedCost} 만원

    [LABOR DATA]
    Full-time Employees (FT): ${confirmedData.employeeCountFT}명 (Total Cost: ${
    confirmedData.employeeCostFT
  } 만원)
    Part-time Employees (PT): ${confirmedData.employeeCountPT}명 (Total Cost: ${
    confirmedData.employeeCostPT
  } 만원)
    Total Labor Cost: ${totalLaborCost} 만원

    Please detect specific equipment and generate automation plan & ROI.
  `;

  const payload = {
    endpoint: "plan",
    images: base64Images,
    confirmedData,
    prompt: PLANNING_PROMPT + "\n" + promptText,
  };

  const result = await sendToWorker(payload);

  // Fix fields for UI compatibility
  result.current_cost = {
    employee_count_ft: confirmedData.employeeCountFT,
    employee_cost_ft: confirmedData.employeeCostFT,
    employee_count_pt: confirmedData.employeeCountPT,
    employee_cost_pt: confirmedData.employeeCostPT,
    monthly_labor_cost: totalLaborCost,
  };

  return result as AnalysisResult;
};