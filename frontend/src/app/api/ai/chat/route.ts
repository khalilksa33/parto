import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export async function POST(req: Request) {
  try {
    const { message, history } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    if (!genAI) {
      // Mock fallback if no API key is provided yet
      console.warn('GEMINI_API_KEY is not set. Returning simulated AI response.');
      const lowerMsg = message.toLowerCase();
      if (lowerMsg.includes('battery') || lowerMsg.includes('start') || lowerMsg.includes('clicking')) {
        return NextResponse.json({
          response: "It sounds like you might have a dead battery or a faulty starter motor. I can help you find a replacement battery from a local scrapyard, or I can dispatch a Tow Truck to help you out!",
          action: "redirect_tashleeh",
          part: "Car Battery"
        });
      } else if (lowerMsg.includes('mirror') || lowerMsg.includes('glass')) {
        return NextResponse.json({
          response: "I can definitely help you find a replacement side mirror! Let's check the local scrapyards.",
          action: "redirect_tashleeh",
          part: "Side Mirror"
        });
      }
      
      return NextResponse.json({
        response: "I am the Nexus AI Garage Assistant! (Mock Mode: Please add GEMINI_API_KEY to your .env file to enable full AI diagnostics). How can I help you with your vehicle today?",
        action: null
      });
    }

    // Initialize the model
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // System prompt defining the AI's persona and JSON output structure
    const systemInstruction = `
      You are the Nexus AI Garage Assistant, an expert auto mechanic for a Saudi Arabian automotive platform.
      Your job is to diagnose car issues based on user symptoms, or help them identify the exact auto part they need.
      If you determine the user needs a specific auto part, you must output a JSON object at the very end of your response with the following structure:
      \`\`\`json
      {
        "action": "redirect_tashleeh",
        "part": "Exact Part Name (e.g. Alternator, Brake Pads)",
        "make": "Vehicle Make if mentioned",
        "model": "Vehicle Model if mentioned",
        "year": "Vehicle Year if mentioned"
      }
      \`\`\`
      If they need a tow truck (e.g. car broke down on the highway and can't be fixed on-site), output:
      \`\`\`json
      {
        "action": "redirect_towing"
      }
      \`\`\`
      If they have a minor issue that can be fixed on-site (e.g., flat tire, dead battery needing a jump start, locked out of car), output:
      \`\`\`json
      {
        "action": "redirect_workshop"
      }
      \`\`\`
      Keep your response friendly, concise, and helpful. Always include the JSON block if an action is warranted.
    `;

    // Convert history format if needed (for simplicity we just send the current prompt + system instruction here)
    const prompt = `${systemInstruction}\n\nUser: ${message}\nAssistant:`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Parse the response for our custom JSON action block
    let action = null;
    let part = null;
    let make = null;
    let vehicleModel = null;
    let year = null;
    
    let cleanResponseText = responseText;

    const jsonMatch = responseText.match(/\`\`\`json\n([\s\S]*?)\n\`\`\`/);
    if (jsonMatch && jsonMatch[1]) {
      try {
        const actionData = JSON.parse(jsonMatch[1]);
        action = actionData.action;
        part = actionData.part;
        make = actionData.make;
        vehicleModel = actionData.model;
        year = actionData.year;
        
        // Remove the JSON block from the user-facing text
        cleanResponseText = responseText.replace(jsonMatch[0], '').trim();
      } catch (e) {
        console.error("Failed to parse AI action JSON:", e);
      }
    }

    return NextResponse.json({
      response: cleanResponseText,
      action,
      part,
      make,
      model: vehicleModel,
      year
    });
  } catch (error: any) {
    console.error('AI Chat Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
