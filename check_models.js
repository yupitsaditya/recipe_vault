const args = process.argv.slice(2);
const apiKey = args[0];

if (!apiKey) {
  console.error("Usage: node check_models.js YOUR_API_KEY");
  process.exit(1);
}

async function run() {
  console.log("Fetching all available models for your API Key...");
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    if (!res.ok) {
      console.error(`Error: ${res.status} - ${await res.text()}`);
      return;
    }
    const data = await res.json();
    
    // Sort models into text/multimodal vs image-specific
    const allModels = data.models || [];
    
    console.log("\n====== TEXT & MULTIMODAL MODELS ======");
    const textModels = allModels.filter(m => m.supportedGenerationMethods?.includes('generateContent') && m.name.includes('gemini'));
    console.table(textModels.map(m => ({ 
      Name: m.name.replace('models/', ''), 
      Version: m.version,
      InputTokenLimit: m.inputTokenLimit
    })));

    console.log("\n====== IMAGE & VISION MODELS ======");
    const imageModels = allModels.filter(m => m.name.includes('vision') || m.name.includes('imagen') || m.name.includes('image'));
    console.table(imageModels.map(m => ({ 
      Name: m.name.replace('models/', ''), 
      Methods: (m.supportedGenerationMethods || []).join(', ')
    })));

  } catch (error) {
    console.error("Script failed:", error.message);
  }
}

run();
