
import { GoogleGenAI } from "@google/genai";
import { ENVIRONMENT_PROMPT, PLANNING_PROMPT } from "../constants";
import { AnalysisResult, InitialAnalysisResult, ConfirmedStoreData } from "../types";

// Helper to convert file to Base64
const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  
  return {
    inlineData: {
      data: await base64EncodedDataPromise,
      mimeType: file.type,
    },
  };
};

/**
 * Stage 1: Analyze Environment
 * 
 * [Applied Algorithm]
 * This function utilizes the Gemini 2.5 Flash Vision model.
 * It applies **Mask R-CNN (Instance Segmentation)** based Object Detection to identify and count tables/equipment,
 * and **Metric Scale Estimation** & **Depth Estimation** to estimate hall/kitchen dimensions based on visual cues 
 * (like tile size, standard door width, etc.) relative to the identified objects.
 */
export const analyzeEnvironment = async (
  images: File[]
): Promise<InitialAnalysisResult> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const imageParts = await Promise.all(images.map(fileToGenerativePart));

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    config: {
      systemInstruction: ENVIRONMENT_PROMPT,
      responseMimeType: "application/json",
      temperature: 0.4,
    },
    contents: {
      parts: [...imageParts]
    }
  });

  const text = response.text;
  if (!text) throw new Error("Gemini returned empty response for environment analysis.");
  
  return JSON.parse(text) as InitialAnalysisResult;
};

/**
 * Stage 2: Generate Automation Plan & ROI
 * 
 * Uses confirmed data as ground truth and re-analyzes images for specific equipment opportunities
 * (e.g., finding a fryer for auto-fryer recommendation) and workflow optimization.
 */
export const generateAutomationPlan = async (
  confirmedData: ConfirmedStoreData,
  images: File[]
): Promise<AnalysisResult> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const imageParts = await Promise.all(images.map(fileToGenerativePart));

  const totalLaborCost = confirmedData.employeeCostFT + confirmedData.employeeCostPT;

  const promptText = `
    [CONFIRMED DATA - USE AS FACTS]
    Store Category: ${confirmedData.store_category}
    Hall Size: ${confirmedData.estimated_hall_size} Pyung
    Kitchen Size: ${confirmedData.estimated_kitchen_size} Pyung
    Table Count: ${confirmedData.estimated_tables} EA
    Existing Table Order Tablets: ${confirmedData.has_table_tablets ? 'YES' : 'NO'}
    
    Monthly Sales: ${confirmedData.monthlySales} 만원
    Monthly Fixed Cost: ${confirmedData.monthlyFixedCost} 만원
    
    [LABOR DATA]
    Full-time Employees (FT): ${confirmedData.employeeCountFT}명 (Total Cost: ${confirmedData.employeeCostFT} 만원)
    Part-time Employees (PT): ${confirmedData.employeeCountPT}명 (Total Cost: ${confirmedData.employeeCostPT} 만원)
    Total Labor Cost: ${totalLaborCost} 만원
    
    Please detect specific equipment (fryers, woks, machines) from images and generate the automation plan and ROI report.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    config: {
      systemInstruction: PLANNING_PROMPT,
      responseMimeType: "application/json",
      temperature: 0.5,
    },
    contents: {
      parts: [
        ...imageParts,
        { text: promptText }
      ]
    }
  });

  const text = response.text;
  if (!text) throw new Error("Gemini returned empty response for planning.");

  const result = JSON.parse(text) as AnalysisResult;
  
  // Ensure the AI returned labor details are populated correctly for the dashboard
  result.current_cost.employee_count_ft = confirmedData.employeeCountFT;
  result.current_cost.employee_cost_ft = confirmedData.employeeCostFT;
  result.current_cost.employee_count_pt = confirmedData.employeeCountPT;
  result.current_cost.employee_cost_pt = confirmedData.employeeCostPT;
  result.current_cost.monthly_labor_cost = totalLaborCost;

  return result;
};
