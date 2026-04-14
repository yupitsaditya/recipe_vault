export const getGeminiKey = () => localStorage.getItem('rashika_gemini_key') || "";
export const setGeminiKey = (key) => {
  localStorage.setItem('rashika_gemini_key', key);
  localStorage.removeItem('rashika_cached_model_v5');
  localStorage.removeItem('rashika_cached_image_model_v2');
};

const IMAGEN_MODEL = "imagen-4.0-generate-001";

async function getBestModel(apiKey) {
  let cached = localStorage.getItem('rashika_cached_model_v5');
  if (cached) return cached;

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
  if (!res.ok) throw new GeminiError("Failed to verify models. Is your API key correct?");
  
  const data = await res.json();
  const models = data.models || [];
  const validModels = models.filter(m => 
    m.supportedGenerationMethods?.includes('generateContent') && 
    m.name.includes('gemini') && 
    !m.name.includes('vision') &&
    !m.name.includes('image')
  );
  
  // Pivot to lightweight architecture to evade free-tier quota limits
  const preferences = ['gemini-2.5-flash-lite', 'gemini-2.0-flash-lite', 'gemini-flash-lite-latest'];
  for (const pref of preferences) {
    if (validModels.find(m => m.name === `models/${pref}`)) {
      localStorage.setItem('rashika_cached_model_v5', pref);
      return pref;
    }
  }
  
  if (validModels.length > 0) {
    const fallback = validModels[0].name.replace('models/', '');
    localStorage.setItem('rashika_cached_model_v5', fallback);
    return fallback;
  }
  
  throw new GeminiError("No compatible generation models found for your API key.");
}

async function getBestImageModel(apiKey) {
  let cached = localStorage.getItem('rashika_cached_image_model_v2');
  if (cached) return cached;

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
  if (!res.ok) throw new GeminiError("Failed to verify models.");
  
  const data = await res.json();
  const imageModels = (data.models || []).filter(m => 
    m.supportedGenerationMethods?.includes('generateContent') && 
    m.name.includes('image')
  );
  
  // Target the oldest/cheapest available native generative image model to maximize quota
  const preferences = ['gemini-2.5-flash-image', 'gemini-3.1-flash-image-preview', 'gemini-3-pro-image-preview'];
  for (const pref of preferences) {
    if (imageModels.find(m => m.name === `models/${pref}`)) {
      localStorage.setItem('rashika_cached_image_model_v2', pref);
      return pref;
    }
  }
  
  if (imageModels.length > 0) {
    const fallback = imageModels[0].name.replace('models/', '');
    localStorage.setItem('rashika_cached_image_model_v2', fallback);
    return fallback;
  }
  
  return 'gemini-2.5-flash-image'; // Ultimate dead-end fallback
}

export class GeminiError extends Error {
  constructor(message) {
    super(message);
    this.name = "GeminiError";
  }
}

const recipeJsonSchema = {
  type: "OBJECT",
  properties: {
    title: { type: "STRING" }, timeRequired: { type: "STRING" },
    ingredients: { type: "ARRAY", items: { type: "OBJECT", properties: { item: { type: "STRING" }, quantity: { type: "STRING" }, unit: { type: "STRING" } } } },
    steps: { type: "ARRAY", items: { type: "OBJECT", properties: { instruction: { type: "STRING" }, timeEstimate: { type: "STRING" } } } }
  }
};

export const parseRecipeText = async (recipeDump) => {
  const apiKey = getGeminiKey();
  if (!apiKey) throw new GeminiError("API key missing. Please check Settings.");

  const prompt = `You are a culinary AI. Translate to English if needed. Extract recipe data into pure JSON matching this exact structure: ${JSON.stringify(recipeJsonSchema)}. Absolutely NO markdown wrapping (no \`\`\`json). Output raw parsable JSON only. \n\nRecipe: ${recipeDump}`;
  const modelName = await getBestModel(apiKey);
  
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
  });
  
  if (!response.ok) {
    const errText = await response.text();
    console.error("Gemini API Error", errText);
    throw new GeminiError(`Google AI Error: ${response.status} - ${errText}`);
  }
  const data = await response.json();
  let resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!resultText) throw new GeminiError("Empty AI response");
  
  resultText = resultText.replace(/```json/g, '').replace(/```/g, '').trim();
  const parsed = JSON.parse(resultText);
  return {
    title: parsed.title || 'Untitled Recipe', 
    timeRequired: parsed.timeRequired || '',
    ingredients: Array.isArray(parsed.ingredients) ? parsed.ingredients : [],
    steps: Array.isArray(parsed.steps) ? parsed.steps : [],
    imageUrl: '', sourceUrl: ''
  };
};

export const generateImage = async (title) => {
  const apiKey = getGeminiKey();
  if (!apiKey) throw new GeminiError("API key missing.");

  const promptStr = `Professional food photography of ${title}. Culinary magazine style, beautiful warm lighting, highly detailed.`;
  const imageModel = await getBestImageModel(apiKey);
  
  // Use dynamically resolved multimodal image block
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${imageModel}:generateContent?key=${apiKey}`, {
    method: 'POST', 
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: promptStr }] }] })
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error("Gemini API Error", errText);
    if (errText.includes("paid plans") || response.status === 400 || response.status === 404) {
       throw new GeminiError("AI Image Generation failed or model is restricted. Please paste an image URL manually!");
    }
    throw new GeminiError(`Google AI Error: ${response.status}`);
  }
  
  const data = await response.json();
  const parts = data.candidates?.[0]?.content?.parts || [];
  
  for (const part of parts) {
    if (part.inlineData) {
       return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }
  
  throw new GeminiError("Image generation failed (No image data returned).");
};

export const modifyRecipeText = async (recipeToModify, promptStr) => {
  const apiKey = getGeminiKey();
  if (!apiKey) throw new GeminiError("API key missing.");

  const recipeState = {
    title: recipeToModify.title,
    ingredients: recipeToModify.ingredients,
    steps: recipeToModify.steps
  };
  const prompt = `You are an AI Sous Chef. Modify this JSON recipe according to the prompt: "${promptStr}". Recipe: ${JSON.stringify(recipeState)}. \n\nOutput ONLY pure raw JSON strictly following this schema: ${JSON.stringify(recipeJsonSchema)}. DO NOT wrap in \`\`\`json or markdown. Provide raw JSON text only.`;
  const modelName = await getBestModel(apiKey);

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
  });
  
  const data = await response.json();
  let resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;
  resultText = resultText.replace(/```json/g, '').replace(/```/g, '').trim();
  const parsed = JSON.parse(resultText);
  
  return {
    ...recipeToModify, 
    title: parsed.title + " (Modified)", 
    timeRequired: parsed.timeRequired || recipeToModify.timeRequired,
    ingredients: parsed.ingredients || [], 
    steps: parsed.steps || [],
  };
};
