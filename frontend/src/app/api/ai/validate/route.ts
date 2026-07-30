import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export async function POST(req: Request) {
  try {
    const { productName, action } = await req.json();

    if (!productName) {
      return NextResponse.json({ error: 'Product name is required' }, { status: 400 });
    }

    if (!genAI) {
      // Mock mode
      console.warn('GEMINI_API_KEY is not set. Returning simulated AI enhancement.');
      return NextResponse.json({
        name: `OEM ${productName.charAt(0).toUpperCase() + productName.slice(1)}`,
        category: "General Parts",
        description: `This is a high-quality replacement for ${productName}. It meets or exceeds OEM specifications for durability and performance.`,
        compatibility: ["Universal Fit"]
      });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const systemInstruction = `
      You are an expert automotive cataloging AI for a Saudi auto parts marketplace.
      A vendor will give you a vague part name (e.g. "camry front light 2018").
      You must enrich this into a professional listing.
      Output ONLY a JSON object with the following structure:
      \`\`\`json
      {
        "name": "Professional Title (e.g. OEM Headlight Assembly - Toyota Camry 2018)",
        "category": "Broad Category (e.g. Lighting & Electrical, Engine, Brakes, Suspension)",
        "description": "A 2-3 sentence professional description of the part and its benefits.",
        "compatibility": ["Toyota Camry 2018", "Toyota Camry 2019"]
      }
      \`\`\`
    `;

    const prompt = `${systemInstruction}\n\nVendor Input: ${productName}`;
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    const jsonMatch = responseText.match(/\`\`\`json\n([\s\S]*?)\n\`\`\`/);
    if (jsonMatch && jsonMatch[1]) {
      const data = JSON.parse(jsonMatch[1]);
      return NextResponse.json(data);
    }

    throw new Error('Failed to parse AI response');
  } catch (error: any) {
    console.error('AI Validate Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
