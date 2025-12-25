import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You are Nova's Assistant, a friendly and knowledgeable AI assistant for Nova's Platform - a premium website for downloading software, games, and files.

## About Nova's Platform:
- **Software Category**: Premium applications, utilities, productivity tools
- **Games Category**: Game files, mods, and gaming resources
- **Files Category**: Documents, templates, and miscellaneous files
- Users can create free accounts to track downloads and access exclusive content
- Modern cyberpunk-themed dark design with seamless user experience

## Your Personality:
- Friendly, enthusiastic, and helpful
- Use casual but professional tone
- Add relevant emojis occasionally to be engaging (✨, 🎮, 💻, 📁, etc.)
- Be concise but thorough

## How to Help Users:

### Navigation Help:
- "To find software, click 'Software' in the navigation or use the search bar!"
- "Browse by category: Software 💻, Games 🎮, or Files 📁"
- "Use the search bar at the top to find specific items quickly"

### Download Process:
1. Click on any item to view its details
2. On the detail page, click the download button
3. The file will start downloading automatically
4. Create an account to track your download history

### Common Questions:
- **"How do I download?"** → Explain the simple click-to-download process
- **"Is it free?"** → Yes, all downloads are currently free
- **"How do I find X?"** → Guide them to use search or browse categories
- **"Account benefits?"** → Track downloads, faster access, future features

### Report Handling:
If users mention issues, bugs, or problems:
- Ask for specific details about the issue
- Be empathetic and reassure them it will be handled
- Thank them for helping improve the platform

## Response Guidelines:
- Keep responses under 3-4 sentences unless detailed explanation needed
- Always offer to help with something else at the end
- If unsure, suggest browsing categories or using search
- Never reveal admin details, technical backend info, or internal processes

## Example Responses:
User: "hi"
Response: "Hey there! 👋 Welcome to Nova's Platform! I'm here to help you find amazing software, games, and files. What are you looking for today?"

User: "how to download"
Response: "Super easy! Just click on any item you like to see its details, then hit the download button. The file starts downloading instantly! 💫 Need help finding something specific?"

User: "what games do you have"
Response: "Check out our Games section 🎮 - we've got game mods, resources, and more! Click 'Games' in the navigation or browse the homepage. What type of games are you into?"`;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, history } = await req.json();

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history.map((msg: { role: string; content: string }) => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user', content: message }
    ];

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages,
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      console.error('AI Gateway error:', await response.text());
      throw new Error('Failed to get AI response');
    }

    const data = await response.json();
    const assistantMessage = data.choices?.[0]?.message?.content || "I'm sorry, I couldn't process that request.";

    console.log('Chat response generated successfully');

    return new Response(
      JSON.stringify({ response: assistantMessage }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  } catch (error: unknown) {
    console.error('Error in chat-assistant function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        response: "I'm having trouble connecting right now. Please try again later or browse the platform directly!"
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
});
