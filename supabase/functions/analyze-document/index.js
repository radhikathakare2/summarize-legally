import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.79.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, filePath } = await req.json();
    
    let documentText = text;

    // If filePath is provided, download and parse the file
    if (filePath && !text) {
      console.log('Downloading and parsing file:', filePath);
      
      const supabaseUrl = Deno.env.get('SUPABASE_URL');
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
      
      if (!supabaseUrl || !supabaseServiceKey) {
        return new Response(
          JSON.stringify({ error: 'Server configuration error' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      // Download file from storage
      const { data: fileData, error: downloadError } = await supabase.storage
        .from('documents')
        .download(filePath);

      if (downloadError || !fileData) {
        console.error('Error downloading file:', downloadError);
        return new Response(
          JSON.stringify({ error: 'Failed to download file' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Parse based on file type
      const fileExtension = filePath.split('.').pop()?.toLowerCase();
      
      try {
        if (fileExtension === 'pdf') {
          // For PDF, use Mozilla's PDF.js
          const pdfjs = await import('https://esm.sh/pdfjs-dist@4.0.379/legacy/build/pdf.mjs');
          
          const arrayBuffer = await fileData.arrayBuffer();
          const typedArray = new Uint8Array(arrayBuffer);
          
          const loadingTask = pdfjs.getDocument({ data: typedArray });
          const pdfDoc = await loadingTask.promise;
          
          let fullText = '';
          for (let i = 1; i <= pdfDoc.numPages; i++) {
            const page = await pdfDoc.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map((item) => item.str).join(' ');
            fullText += pageText + '\n';
          }
          
          documentText = fullText;
          console.log('Extracted text from PDF:', documentText.length, 'characters');
        } else if (fileExtension === 'docx') {
          const arrayBuffer = await fileData.arrayBuffer();
          // Use a simpler approach for DOCX - extract via API
          const formData = new FormData();
          formData.append('file', new Blob([arrayBuffer]));
          
          // For now, return error for DOCX until we implement proper parser
          return new Response(
            JSON.stringify({ error: 'DOCX support coming soon. Please convert to PDF or paste text directly.' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } else if (fileExtension === 'doc') {
          // DOC format is more complex, fallback to error
          return new Response(
            JSON.stringify({ error: 'Legacy DOC format not supported. Please convert to DOCX or PDF.' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } else if (fileExtension === 'txt') {
          documentText = await fileData.text();
          console.log('Extracted text from TXT:', documentText.length, 'characters');
        } else {
          return new Response(
            JSON.stringify({ error: 'Unsupported file format' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } catch (parseError) {
        console.error('Error parsing file:', parseError);
        return new Response(
          JSON.stringify({ error: 'Failed to parse document. Please ensure the file is not corrupted.' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Clean up: delete the file from storage after parsing
      await supabase.storage.from('documents').remove([filePath]);
    }
    
    if (!documentText || documentText.trim().length < 100) {
      return new Response(
        JSON.stringify({ error: 'Document text must be at least 100 characters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Starting document analysis...');

    // Step 1: Segment the document into clauses
    const segmentResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are a legal document analyzer. Your task is to segment legal documents into distinct clauses.
            
For each clause, provide:
1. A descriptive title
2. The exact original text from the document
3. A category (e.g., "Privacy & Data", "Billing & Payments", "Liability", "Account Management", "Legal")

Return the result as a JSON array of objects with fields: title, originalText, category.
Identify 3-7 major clauses from the document.`
          },
          {
            role: 'user',
            content: `Segment this legal document into clauses:\n\n${documentText}`
          }
        ],
        temperature: 0.3,
      }),
    });

    if (!segmentResponse.ok) {
      const errorText = await segmentResponse.text();
      console.error('Segmentation API error:', segmentResponse.status, errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to segment document' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const segmentData = await segmentResponse.json();
    let clauses = [];
    
    try {
      const segmentContent = segmentData.choices[0].message.content;
      // Extract JSON from markdown code blocks if present
      const jsonMatch = segmentContent.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || 
                       segmentContent.match(/\[[\s\S]*\]/);
      const jsonString = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : segmentContent;
      clauses = JSON.parse(jsonString);
    } catch (e) {
      console.error('Failed to parse segmentation result:', e);
      return new Response(
        JSON.stringify({ error: 'Failed to process document structure' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Segmented into ${clauses.length} clauses`);

    // Step 2: Analyze each clause for risk and summaries
    const analyzedClauses = await Promise.all(
      clauses.map(async (clause, index) => {
        const analysisResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [
              {
                role: 'system',
                content: `You are a legal document risk analyzer. Analyze clauses and provide:

1. risk: "high", "medium", or "low"
   - HIGH: Broad data sharing without consent, unexpected fees, one-sided terms, severe liability limitations, difficult cancellation
   - MEDIUM: Auto-renewal with advance notice, standard liability clauses, reasonable restrictions
   - LOW: Standard terms, fair termination, clear jurisdiction

2. summaryEn: 1-2 sentence plain English summary (max 150 chars)
3. summaryHi: Same summary in Hindi (max 200 chars)
4. rationale: 1-2 sentence explanation of the risk assessment

Return as JSON with fields: risk, summaryEn, summaryHi, rationale`
              },
              {
                role: 'user',
                content: `Analyze this legal clause:\n\nTitle: ${clause.title}\nCategory: ${clause.category}\n\nClause: ${clause.originalText}`
              }
            ],
            temperature: 0.2,
          }),
        });

        if (!analysisResponse.ok) {
          console.error(`Failed to analyze clause ${index + 1}`);
          return {
            ...clause,
            id: index + 1,
            summaryEn: 'Analysis unavailable',
            summaryHi: 'विश्लेषण उपलब्ध नहीं',
            risk: 'medium',
            rationale: 'Unable to assess risk automatically',
          };
        }

        const analysisData = await analysisResponse.json();
        let analysis = {};
        
        try {
          const analysisContent = analysisData.choices[0].message.content;
          const jsonMatch = analysisContent.match(/```(?:json)?\s*([\s\S]*?)\s*```/) ||
                           analysisContent.match(/\{[\s\S]*\}/);
          const jsonString = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : analysisContent;
          analysis = JSON.parse(jsonString);
        } catch (e) {
          console.error(`Failed to parse analysis for clause ${index + 1}:`, e);
          analysis = {
            summaryEn: 'Analysis unavailable',
            summaryHi: 'विश्लेषण उपलब्ध नहीं',
            risk: 'medium',
            rationale: 'Unable to assess risk automatically',
          };
        }

        return {
          id: index + 1,
          title: clause.title,
          originalText: clause.originalText,
          category: clause.category,
          ...analysis,
        };
      })
    );

    // Calculate statistics
    const statistics = {
      totalClauses: analyzedClauses.length,
      highRisk: analyzedClauses.filter(c => c.risk === 'high').length,
      mediumRisk: analyzedClauses.filter(c => c.risk === 'medium').length,
      lowRisk: analyzedClauses.filter(c => c.risk === 'low').length,
    };

    console.log('Analysis complete:', statistics);

    return new Response(
      JSON.stringify({
        clauses: analyzedClauses,
        statistics,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in analyze-document:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
