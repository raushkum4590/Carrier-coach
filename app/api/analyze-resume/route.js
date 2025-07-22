import { NextRequest, NextResponse } from 'next/server';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import pdf from 'pdf-parse';
import { authenticateUser } from '../../../lib/middleware';
import clientPromise from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(request) {
  try {
    // Check authentication (optional - allow guest users)
    const { user } = await authenticateUser(request);
    
    const formData = await request.formData();
    const file = formData.get('resume');
    const jobDescription = formData.get('jobDescription');
    const analysisType = formData.get('analysisType') || 'general';
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    let resumeText = '';
    
    // Parse PDF content
    if (file.type === 'application/pdf') {
      try {
        const data = await pdf(buffer);
        resumeText = data.text;
      } catch (error) {
        console.error('PDF parsing error:', error);
        return NextResponse.json({ error: 'Failed to parse PDF' }, { status: 400 });
      }
    } else if (file.type === 'text/plain') {
      resumeText = buffer.toString('utf-8');
    } else {
      return NextResponse.json({ error: 'Unsupported file type. Please upload PDF or TXT files.' }, { status: 400 });
    }

    if (!resumeText.trim()) {
      return NextResponse.json({ error: 'No text content found in the file' }, { status: 400 });
    }

    // Analyze resume using OpenRouter API
    const analysis = await analyzeResumeWithAI(resumeText, jobDescription, analysisType);
    
    // Save analysis to user history if authenticated
    if (user) {
      try {
        const client = await clientPromise;
        const db = client.db('ai_career_coach');
        const users = db.collection('users');
        
        const analysisRecord = {
          analysisType,
          jobDescription: jobDescription || null,
          fileName: file.name,
          fileSize: file.size,
          analysis: analysis,
          createdAt: new Date()
        };
        
        await users.updateOne(
          { _id: new ObjectId(user._id) },
          { 
            $push: { resumeAnalyses: analysisRecord },
            $set: { updatedAt: new Date() }
          }
        );
      } catch (dbError) {
        console.error('Failed to save analysis to user history:', dbError);
        // Continue without failing the request
      }
    }
    
    return NextResponse.json({
      success: true,
      analysis: analysis,
      analysisType: analysisType,
      saved: !!user, // Indicate if analysis was saved to user account
      extractedText: resumeText.substring(0, 500) + '...' // First 500 chars for preview
    });

  } catch (error) {
    console.error('Error processing resume:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Manual parsing function for when JSON parsing fails
function parseAnalysisManually(text, analysisType) {
  try {
    const analysis = {};
    
    // Extract overall score
    const scoreMatch = text.match(/(?:overall score|score):?\s*([0-9]+(?:\.[0-9]+)?(?:%|\s*\/\s*[0-9]+)?)/i);
    if (scoreMatch) {
      analysis.overallScore = scoreMatch[1];
    }
    
    // Extract strengths
    const strengthsMatch = text.match(/strengths?:?\s*([\s\S]*?)(?=weaknesses?|areas?\s+for\s+improvement|recommendations?|$)/i);
    if (strengthsMatch) {
      const strengthsText = strengthsMatch[1];
      analysis.strengths = extractListItems(strengthsText);
    }
    
    // Extract weaknesses/areas for improvement
    const weaknessesMatch = text.match(/(?:weaknesses?|areas?\s+for\s+improvement):?\s*([\s\S]*?)(?=recommendations?|suggestions?|career|$)/i);
    if (weaknessesMatch) {
      const weaknessesText = weaknessesMatch[1];
      analysis.weaknesses = extractListItems(weaknessesText);
    }
    
    // Extract recommendations/action items
    const recommendationsMatch = text.match(/(?:recommendations?|suggestions?|action\s+items?):?\s*([\s\S]*?)(?=career|salary|$)/i);
    if (recommendationsMatch) {
      const recommendationsText = recommendationsMatch[1];
      analysis.actionItems = extractListItems(recommendationsText);
    }
    
    // For targeted analysis, extract job match information
    if (analysisType === 'targeted') {
      const matchScoreMatch = text.match(/(?:match\s+score|compatibility):?\s*([0-9]+(?:\.[0-9]+)?(?:%|\s*\/\s*[0-9]+)?)/i);
      if (matchScoreMatch) {
        analysis.jobMatch = {
          matchScore: matchScoreMatch[1]
        };
      }
      
      const matchingSkillsMatch = text.match(/(?:matching\s+skills?|relevant\s+skills?):?\s*([\s\S]*?)(?=missing|gap|lacking|$)/i);
      if (matchingSkillsMatch) {
        const matchingSkills = extractListItems(matchingSkillsMatch[1]);
        if (!analysis.jobMatch) analysis.jobMatch = {};
        analysis.jobMatch.matchingSkills = matchingSkills;
      }
      
      const missingSkillsMatch = text.match(/(?:missing\s+skills?|gap|lacking|skills?\s+to\s+develop):?\s*([\s\S]*?)(?=recommendations?|$)/i);
      if (missingSkillsMatch) {
        const missingSkills = extractListItems(missingSkillsMatch[1]);
        if (!analysis.jobMatch) analysis.jobMatch = {};
        analysis.jobMatch.missingSkills = missingSkills;
      }
    }
    
    // If we got some structured data, return it
    if (Object.keys(analysis).length > 0) {
      analysis.analysisType = analysisType;
      analysis.note = "Parsed from unstructured AI response";
      return analysis;
    }
    
    return null;
  } catch (error) {
    console.error('Manual parsing error:', error);
    return null;
  }
}

// Helper function to extract list items from text
function extractListItems(text) {
  const items = [];
  
  // Try different bullet point patterns
  const patterns = [
    /^\s*[-•*]\s*(.+)$/gm,  // Bullet points
    /^\s*\d+\.\s*(.+)$/gm,  // Numbered lists
    /^\s*[▪▫◦‣⁃]\s*(.+)$/gm, // Unicode bullets
    /^(.+)$/gm  // Fallback to lines
  ];
  
  for (const pattern of patterns) {
    const matches = [...text.matchAll(pattern)];
    if (matches.length > 0) {
      matches.forEach(match => {
        const item = match[1].trim();
        if (item && item.length > 5 && !item.includes(':')) { // Filter out headers and short items
          items.push(item);
        }
      });
      if (items.length > 0) break;
    }
  }
  
  return items.slice(0, 10); // Limit to 10 items
}

async function analyzeResumeWithAI(resumeText, jobDescription, analysisType) {
  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
  
  if (!OPENROUTER_API_KEY) {
    throw new Error('OpenRouter API key not configured');
  }

  let prompt;
  
  if (analysisType === 'targeted' && jobDescription) {
    prompt = `As an expert career coach, analyze this resume against the specific job description provided:

RESUME CONTENT:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

Please provide a detailed targeted analysis in the following JSON format:
{
  "overallScore": "Score out of 10",
  "strengths": ["List of key strengths relevant to this job"],
  "weaknesses": ["List of areas for improvement for this role"],
  "skillsAnalysis": {
    "technical": ["technical skills found that match the job"],
    "soft": ["soft skills found that match the job"],
    "missing": ["important skills required by the job that are missing"]
  },
  "jobMatch": {
    "matchScore": "Percentage match for this specific job",
    "matchingSkills": ["Skills that directly match job requirements"],
    "missingSkills": ["Required skills not found in resume"],
    "recommendations": ["Specific steps to improve candidacy for this role"]
  },
  "careerSuggestions": {
    "currentLevel": "Assessment relative to job requirements",
    "readiness": "How ready the candidate is for this role",
    "preparationSteps": ["Steps to become job-ready"]
  },
  "improvements": {
    "resumeOptimization": ["How to optimize resume for this job"],
    "keywordsToAdd": ["Important keywords from job description to include"],
    "sectionsToEnhance": ["Resume sections that need improvement for this role"]
  },
  "actionItems": ["Specific actionable recommendations for this job application"],
  "interviewPrep": ["Key areas to focus on for interview preparation"],
  "salaryNegotiation": "Advice for salary negotiation based on match level"
}`;
  } else {
    prompt = `As an expert career coach, analyze the following resume and provide comprehensive feedback:

RESUME CONTENT:
${resumeText}

Please provide a detailed analysis in the following JSON format:
{
  "overallScore": "Score out of 10",
  "strengths": ["List of key strengths"],
  "weaknesses": ["List of areas for improvement"],
  "skillsAnalysis": {
    "technical": ["technical skills found"],
    "soft": ["soft skills found"],
    "missing": ["important skills that are missing"]
  },
  "careerSuggestions": {
    "currentLevel": "Junior/Mid/Senior level assessment",
    "suitableRoles": ["List of job roles that match the profile"],
    "careerPath": ["Suggested career progression steps"],
    "industryFit": ["Industries where this profile would be strong"]
  },
  "improvements": {
    "format": ["formatting improvements"],
    "content": ["content improvements"],
    "keywords": ["important keywords to add"]
  },
  "actionItems": ["Specific actionable recommendations"],
  "marketability": "Assessment of how marketable this candidate is",
  "salaryRange": "Estimated salary range based on skills and experience"
}`;
  }

  prompt += `

IMPORTANT: Respond with valid JSON only. Do not include any text before or after the JSON. Ensure all strings are properly quoted and all arrays/objects are properly formatted. The JSON must be parseable.

Example format:
{
  "overallScore": "85/100",
  "strengths": ["Strong technical skills", "Good education background"],
  "weaknesses": ["Limited work experience", "Missing certifications"],
  "actionItems": ["Add more projects", "Get certified"],
  "marketability": "High potential with improvements"
}`;

  // Try multiple models in order of preference
  const modelsToTry = [
    'qwen/qwen-2.5-72b-instruct:free',
    'meta-llama/llama-3.2-3b-instruct:free',
    'microsoft/phi-3-mini-128k-instruct:free',
    'google/gemma-2-9b-it:free'
  ];

  for (const model of modelsToTry) {
    try {
      console.log('Trying model:', model);
      
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + OPENROUTER_API_KEY,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'AI Career Coach'
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1500
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Model ' + model + ' failed:', response.status, errorText);
        
        // If it's a 404 (model not found), try the next model
        if (response.status === 404) {
          continue;
        }
        
        // Check if it's an HTML error page
        if (errorText.startsWith('<!DOCTYPE') || errorText.includes('<html>')) {
          throw new Error('OpenRouter API returned HTML error page. Status: ' + response.status);
        }
        
        throw new Error('OpenRouter API error: ' + response.status + ' - ' + errorText);
      }

      const responseText = await response.text();
      
      // Check if response is HTML instead of JSON
      if (responseText.startsWith('<!DOCTYPE') || responseText.includes('<html>')) {
        console.error('Received HTML response instead of JSON:', responseText.substring(0, 200));
        throw new Error('OpenRouter API returned HTML instead of JSON. This might be a service issue or incorrect endpoint.');
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        console.error('Response text:', responseText.substring(0, 500));
        throw new Error('Failed to parse API response as JSON');
      }

      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        console.error('Unexpected API response structure:', data);
        throw new Error('Unexpected response structure from OpenRouter API');
      }

      const analysisText = data.choices[0].message.content;
      console.log('Successfully used model:', model);
      
      // Try multiple approaches to parse JSON from the response
      try {
        // First, try to find and parse JSON
        const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          let jsonString = jsonMatch[0];
          
          // Try to fix common JSON issues
          jsonString = jsonString
            .replace(/,\s*}/g, '}')  // Remove trailing commas
            .replace(/,\s*]/g, ']')  // Remove trailing commas in arrays
            .replace(/([{,]\s*)(\w+):/g, '$1"$2":')  // Add quotes to unquoted keys
            .trim();
          
          return JSON.parse(jsonString);
        }
      } catch (parseError) {
        console.error('JSON parsing error from AI response:', parseError);
        console.log('Raw AI response:', analysisText.substring(0, 500) + '...');
        
        // Try a more lenient approach - extract key information manually
        try {
          const analysis = parseAnalysisManually(analysisText, analysisType);
          if (analysis) {
            return analysis;
          }
        } catch (manualParseError) {
          console.error('Manual parsing also failed:', manualParseError);
        }
      }
      
      // Fallback if all parsing fails
      return {
        overallScore: "Analysis completed",
        analysis: analysisText,
        modelUsed: model,
        analysisType: analysisType,
        note: "Raw analysis provided due to parsing issues"
      };

    } catch (error) {
      console.error('Error with model ' + model + ':', error.message);
      
      // If this is the last model, throw the error
      if (model === modelsToTry[modelsToTry.length - 1]) {
        throw error;
      }
      
      // Otherwise, continue to the next model
      continue;
    }
  }
  
  throw new Error('All models failed to provide a response');
}
