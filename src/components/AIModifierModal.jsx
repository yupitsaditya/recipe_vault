import React, { useState } from 'react';
import { Wand2, Loader2 } from 'lucide-react';
import { modifyRecipeText, GeminiError } from '../services/gemini';

export default function AIModifierModal({ recipe, onClose, onModified, onRequireSettings }) {
  const [prompt, setPrompt] = useState('');
  const [isModifying, setIsModifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleModify = async () => {
    if (!prompt.trim()) return;
    setIsModifying(true);
    setErrorMsg('');

    try {
      const updatedRecipe = await modifyRecipeText(recipe, prompt);
      onModified(updatedRecipe);
    } catch (error) {
       if (error instanceof GeminiError && error.message.includes('missing')) {
          onRequireSettings();
       } else {
          setErrorMsg(error.message || "Modification failed.");
       }
    } finally {
      setIsModifying(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content text-center">
        <h3 className="text-3xl font-black font-serif mb-2 flex items-center justify-center">
          <Wand2 size={32} className="text-accent" style={{ marginRight: '0.75rem' }}/> AI Sous Chef
        </h3>
        <p className="text-muted mb-8 font-weight-500">How should we change this recipe? (e.g. "Scale for 8 people", "Make it vegan")</p>
        
        {errorMsg && <p style={{ color: 'var(--accent)', marginBottom: '1rem', fontWeight: 700 }}>{errorMsg}</p>}

        <textarea 
          rows={3} 
          className="input-field mb-6" 
          placeholder="Your instructions..." 
          value={prompt} 
          onChange={e => setPrompt(e.target.value)}
          autoFocus
        ></textarea>
        
        <div className="flex justify-between gap-4 mt-4" style={{ justifyContent: 'flex-end' }}>
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button onClick={handleModify} disabled={isModifying || !prompt} className="btn-primary" style={{ padding: '0.75rem 2rem' }}>
            {isModifying ? <Loader2 size={20} className="animate-spin" style={{ marginRight: '0.5rem' }}/> : <Wand2 size={20} style={{ marginRight: '0.5rem', color: '#fca5a5' }}/>} Modify Magic
          </button>
        </div>
      </div>
    </div>
  );
}
