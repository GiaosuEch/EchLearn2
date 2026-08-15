import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

// 1. Connection Pooling Fix: Instantiate exactly once in global scope (Warm Start reuse)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

// 2. Caching Fix: In-memory store for static curriculum data
// Structure: cache.get(`${languageId}_${lessonId}`) => lessonData
const lessonCache = new Map<string, any>()

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { response, lessonId, language } = await req.json()

    if (!response || !lessonId || !language) {
      return new Response(JSON.stringify({ error: 'Missing required payload (response, lessonId, language)' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Check cache first to avoid hitting the DB for static content
    const cacheKey = `${language}_${lessonId}`
    let lessonContext = lessonCache.get(cacheKey)

    if (!lessonContext) {
      // Cache miss: Securely retrieve lesson context from Postgres
      const { data: lessonRecord, error: dbError } = await supabase
        .from('realworld_lessons')
        .select('data')
        .eq('id', lessonId)
        .eq('language_id', language)
        .single()
      
      if (dbError || !lessonRecord) {
        return new Response(JSON.stringify({ error: 'Invalid lessonId or language' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
      
      lessonContext = lessonRecord.data
      
      // Basic LRU logic to prevent memory bloat (limit 1000 lessons)
      if (lessonCache.size >= 1000) {
        const firstKey = lessonCache.keys().next().value
        lessonCache.delete(firstKey)
      }
      lessonCache.set(cacheKey, lessonContext)
    }

    if (!OPENAI_API_KEY) {
      // Fallback mode if API key isn't set, still returning a structured response
      return new Response(
        JSON.stringify({
          isValid: true,
          overallScore: 70,
          criteria: {
            politeness: { score: 0.7, message: 'Fallback: Server needs OpenAI key. Assume okay.' },
            completeness: { score: 0.7, message: 'Fallback: Server needs OpenAI key. Assume okay.' },
            grammar: { score: 0.7, message: 'Fallback: Server needs OpenAI key. Assume okay.' }
          },
          overallMessage: 'Edge function reached, but OpenAI API key is missing in backend env.'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const systemPrompt = `
You are an expert linguistics AI evaluating a student's response in a language learning platform.
Target Language: ${lessonContext.language}
Scenario: ${lessonContext.scenario?.settingVi || ''}
Goal: ${lessonContext.canDoVi || ''}
Exemplar Answer: ${lessonContext.production?.exemplar || ''}

The user provided the following response: "${response}"

Evaluate the response strictly based on these 3 criteria:
1. Completeness (Did they answer the prompt and include necessary info?)
2. Politeness (Is it culturally appropriate and polite for the given language and scenario?)
3. Grammar (Is the syntax correct?)

Return a JSON object EXACTLY matching this structure, with no markdown formatting or extra text:
{
  "isValid": true,
  "overallScore": 85,
  "criteria": {
    "politeness": { "score": 0.9, "message": "Feedback in Vietnamese" },
    "completeness": { "score": 0.8, "message": "Feedback in Vietnamese" },
    "grammar": { "score": 0.85, "message": "Feedback in Vietnamese" }
  },
  "overallMessage": "General summary in Vietnamese"
}
`

    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'system', content: systemPrompt }],
        temperature: 0.2,
      }),
    })

    const aiData = await aiResponse.json()
    const content = aiData.choices[0].message.content
    
    // Parse the JSON strictly
    let parsedResult;
    try {
      // Handle potential markdown code block wrapping from LLM
      const jsonString = content.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedResult = JSON.parse(jsonString);
    } catch {
      console.error('Failed to parse OpenAI response:', content);
      throw new Error('Invalid JSON from AI');
    }

    return new Response(JSON.stringify(parsedResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
