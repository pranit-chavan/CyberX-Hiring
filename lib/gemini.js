import { GoogleGenerativeAI } from '@google/generative-ai';

const defaultGenAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function processTerminalOutput(content, imageBuffer = null, mimeType = null, apiKey = null, modelName = 'gemini-2.0-flash') {
    try {
        let genAI = defaultGenAI;
        if (apiKey) {
            genAI = new GoogleGenerativeAI(apiKey);
        }

        const model = genAI.getGenerativeModel({ model: modelName });

        let prompt = `
      You are an expert cybersecurity analyst.
      Analyze the provided content (terminal output and/or image) from a security tool.
      Provide a concise title and a brief summary.
      
      Output format (JSON):
      {
        "title": "Concise Descriptive Title",
        "summary": "Brief actionable summary (max 200 chars)",
        "imageAnalysis": "Specific insights from the image (optional, if image provided)"
      }

      Terminal Output / Content:
      ${content}
    `;

        const parts = [prompt];

        if (imageBuffer && mimeType) {
            parts.push({
                inlineData: {
                    data: imageBuffer.toString('base64'),
                    mimeType: mimeType
                }
            });
        }

        const result = await model.generateContent(parts);
        const response = await result.response;
        const text = response.text();

        // Clean up potential markdown formatting in the response
        const jsonString = text.replace(/```json\n|\n```/g, '').trim();

        return JSON.parse(jsonString);
    } catch (error) {
        console.error("Error processing with Gemini:", error);
        return {
            title: "Processing Failed",
            summary: "Could not analyze content. Please review raw output.",
            imageAnalysis: null
        };
    }
}
