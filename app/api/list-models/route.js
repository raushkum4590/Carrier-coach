import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
    
    if (!OPENROUTER_API_KEY) {
      return NextResponse.json({ 
        error: 'OpenRouter API key not configured',
        configured: false 
      }, { status: 400 });
    }

    // Get list of available models
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ 
        error: `API connection failed: ${response.status}`,
        details: errorText.substring(0, 200),
        configured: true
      }, { status: response.status });
    }

    const data = await response.json();
    
    // Filter for free models that might work
    const freeModels = data.data?.filter(model => 
      model.id.includes('free') && 
      (model.id.includes('qwen') || 
       model.id.includes('llama') || 
       model.id.includes('phi') ||
       model.id.includes('gemma'))
    ) || [];

    // Also check for any qwen models specifically
    const qwenModels = data.data?.filter(model => 
      model.id.includes('qwen')
    ) || [];

    return NextResponse.json({
      success: true,
      configured: true,
      apiConnected: true,
      totalModels: data.data?.length || 0,
      freeModels: freeModels.map(m => ({
        id: m.id,
        name: m.name,
        pricing: m.pricing
      })),
      qwenModels: qwenModels.map(m => ({
        id: m.id,
        name: m.name,
        pricing: m.pricing
      })),
      availableQwenModels: qwenModels.map(m => m.id)
    });

  } catch (error) {
    console.error('API test error:', error);
    return NextResponse.json({ 
      error: 'Failed to test API connection',
      details: error.message,
      configured: !!process.env.OPENROUTER_API_KEY
    }, { status: 500 });
  }
}
