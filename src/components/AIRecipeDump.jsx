import React, { useState, useEffect } from 'react';
import { ArrowLeft, Wand2, Loader2, AlertCircle } from 'lucide-react';
import { parseRecipeText, GeminiError } from '../services/gemini';

export default function AIRecipeDump({ onBack, onParsed, onSkip, onRequireSettings }) {
  const [recipeDump, setRecipeDump] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const cached = localStorage.getItem('rashika_draft_dump');
    if (cached) setRecipeDump(cached);
  }, []);

  const handleParseDump = async () => {
    if (!recipeDump.trim()) { setErrorMsg("Please paste a recipe first!"); return; }
    setIsParsing(true);
    setErrorMsg('');

    try {
      localStorage.setItem('rashika_draft_dump', recipeDump);
      const parsedData = await parseRecipeText(recipeDump);
      onParsed(parsedData);
    } catch (error) {
      if (error instanceof GeminiError && error.message.includes('missing')) {
        onRequireSettings();
      } else {
        setErrorMsg(error.message || "Failed to automatically extract.");
      }
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <div style={{ maxWidth: '48rem', margin: '0 auto', background: 'var(--surface)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-xl)', border: '1px solid var(--border)', padding: '3rem', animation: 'fadeIn 0.3s' }}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-5xl font-serif font-black" style={{ letterSpacing: '-0.02em' }}>Add to Vault</h2>
          <p className="text-muted mt-2 text-lg font-medium">Paste messy notes in any language.</p>
        </div>
        <button onClick={onBack} className="btn-icon"><ArrowLeft size={24} /></button>
      </div>
      
      {errorMsg && <div className="mb-8 p-4 flex" style={{ background: '#fef2f2', color: '#b91c1c', borderRadius: 'var(--radius-lg)' }}><AlertCircle size={24} style={{ marginRight: '0.75rem', flexShrink: 0 }} /><span style={{ fontWeight: 700 }}>{errorMsg}</span></div>}
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <textarea 
          rows={12} 
          style={{ width: '100%', padding: '2rem', background: 'var(--bg-color)', borderRadius: 'var(--radius-lg)', fontSize: '1.25rem', fontWeight: 500, lineHeight: 1.6, resize: 'none' }} 
          placeholder="Paste recipe text here...&#10;&#10;e.g., Mummy wali dal: 1 cup dal ko dho lo, cooker me 3 seeti aane tak pakao..." 
          value={recipeDump} 
          onChange={(e) => {
            setRecipeDump(e.target.value);
            localStorage.setItem('rashika_draft_dump', e.target.value);
          }} 
        />
        
        <button onClick={handleParseDump} disabled={isParsing || !recipeDump.trim()} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '1.5rem', fontSize: '1.25rem' }}>
          {isParsing ? <><Loader2 size={24} className="animate-spin" style={{ marginRight: '0.75rem' }} /> Processing AI Draft...</> : <><Wand2 size={24} style={{ marginRight: '0.75rem', color: 'var(--accent)' }} /> Format & Translate</>}
        </button>
        
        <div style={{ textAlign: 'center', paddingTop: '0.5rem' }}>
          <button onClick={() => onSkip('')} style={{ fontWeight: 700, color: 'var(--text-muted)' }}>Skip AI, enter manually</button>
        </div>
      </div>
    </div>
  );
}
