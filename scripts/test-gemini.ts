/**
 * Test script for Gemini API integration
 * 
 * Run with: pnpm tsx scripts/test-gemini.ts
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';

// Load environment variables from .env.local file if available
dotenv.config({ path: '.env.local' });
dotenv.config(); // Fallback to .env if .env.local doesn't exist

const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

if (!apiKey) {
  console.error("\x1b[31mError: GOOGLE_GENERATIVE_AI_API_KEY not found in environment variables\x1b[0m");
  console.log("Make sure to create a .env.local file with your API key or set it as an environment variable.");
  process.exit(1);
}

async function testGeminiAPI() {
  try {
    console.log("\x1b[36mTesting Gemini API integration...\x1b[0m");
    
    // Initialize the API with the apiKey (we've already verified it's not undefined)
    const genAI = new GoogleGenerativeAI(apiKey as string);
    
    // Try first with Gemini 2.5 Pro
    try {
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-pro-exp-03-25",
        generationConfig: { temperature: 0.2 }
      });
      
      console.log("\x1b[36mSending test request to Gemini 2.5 Pro model...\x1b[0m");
      const result = await model.generateContent("Hello, please respond with a JSON object containing a 'success' field set to true and a 'message' field with a greeting.");
      
      console.log("\x1b[32mGemini 2.5 Pro responded successfully!\x1b[0m");
      console.log("Response:", result.response.text());
      return;
    } catch (error: any) {
      console.warn("\x1b[33mWarning: Couldn't use Gemini 2.5 Pro model, falling back to Gemini 2.0 Flash\x1b[0m");
      console.warn("Error:", error.message);
    }
    
    // Fallback to Gemini 2.0 Flash
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash",
      generationConfig: { temperature: 0.2 }
    });
    
    console.log("\x1b[36mSending test request to Gemini 2.0 Flash model...\x1b[0m");
    const result = await model.generateContent("Hello, please respond with a JSON object containing a 'success' field set to true and a 'message' field with a greeting.");
    
    console.log("\x1b[32mGemini 2.0 Flash responded successfully!\x1b[0m");
    console.log("Response:", result.response.text());
    
  } catch (error: any) {
    console.error("\x1b[31mError testing Gemini API:\x1b[0m", error.message);
    console.error("Stack trace:", error.stack);
    process.exit(1);
  }
}

testGeminiAPI().then(() => {
  console.log("\x1b[32m✓ Gemini API integration test completed successfully\x1b[0m");
}).catch(error => {
  console.error("\x1b[31m✗ Gemini API integration test failed\x1b[0m");
  console.error(error);
}); 