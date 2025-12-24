import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You are Nova's Assistant, a helpful AI assistant for Nova's Platform - a website where users can find and download software, games, and files.

About Nova's Platform:
- Users can browse three categories: Software, Games, and Files
- Each category has downloadable templates/files
- Users can create an account to track their downloads
- The platform has a modern, cyberpunk-themed dark design

How to help users:
1. Explain how to navigate the platform
2. Help users find software, games, or files they're looking for
3. Explain the download process
4. Accept user reports and feedback
5. Answer general questions about the platform

If a user wants to report an issue, ask them to describe it in detail so you can forward it to the admin team.

Keep responses concise, friendly, and helpful. Never reveal admin details or backend information.`;

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
