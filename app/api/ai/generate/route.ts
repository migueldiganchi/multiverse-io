import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getServerUser } from '@/lib/auth';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const user = await getServerUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { type, prompt, storyTitle, storyDescription, genre, existingVersions } = await req.json();

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    let systemPrompt = '';

    if (type === 'story') {
      systemPrompt = `You are a masterful creative writer specializing in literary fiction with alternate realities and parallel universes. 
      Create an engaging story with rich prose and a compelling narrative.
      
      Genre: ${genre || 'Literary Fiction'}
      Title: ${storyTitle}
      
      Write a captivating story excerpt (400-600 words) based on: "${prompt}"
      
      Make it atmospheric, thought-provoking, and leave readers wanting more. Use vivid descriptions and authentic dialogue where appropriate.`;
    } else if (type === 'alternate-ending') {
      systemPrompt = `You are a creative writer specializing in alternate reality fiction.
      
      Story: "${storyTitle}"
      Description: "${storyDescription}"
      Existing version summaries: ${JSON.stringify(existingVersions)}
      
      Create a COMPLETELY different alternate ending/version (400-600 words) based on: "${prompt}"
      
      This version should diverge significantly from existing versions, exploring a unique narrative branch. 
      Make it emotionally resonant and narratively satisfying while being distinctly different.`;
    } else if (type === 'description') {
      systemPrompt = `Create a compelling story description (100-150 words) for a story titled "${storyTitle}" in the ${genre || 'fiction'} genre.
      Prompt: "${prompt}"
      Make it mysterious, intriguing, and make readers desperate to read more. No spoilers.`;
    } else if (type === 'title') {
      systemPrompt = `Generate 5 unique, captivating story titles for a ${genre || 'fiction'} story about: "${prompt}"
      Return ONLY a JSON array of strings like: ["Title One", "Title Two", "Title Three", "Title Four", "Title Five"]`;
    }

    const result = await model.generateContent(systemPrompt);
    const text = result.response.text();

    if (type === 'title') {
      try {
        const titles = JSON.parse(text.replace(/```json|```/g, '').trim());
        return NextResponse.json({ titles });
      } catch {
        return NextResponse.json({ titles: [text] });
      }
    }

    return NextResponse.json({ content: text });
  } catch (error) {
    console.error('AI generate error:', error);
    return NextResponse.json({ error: 'AI generation failed' }, { status: 500 });
  }
}
