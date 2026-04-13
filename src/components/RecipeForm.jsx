import React, { useState } from 'react';
import { ArrowLeft, Clock, ExternalLink, Wand2, Plus, Trash2, Save, Loader2, AlertCircle } from 'lucide-react';
import { generateImage } from '../services/gemini';
import { compressImage } from '../utils/imageUtils';

export default function RecipeForm({ 
  initialData, 
  onSave, 
  onCancel, 
  isSaving, 
  editingRecipeId 
}) {
  const [formData, setFormData] = useState(initialData);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const updateIng = (index, field, val) => { const n = [...formData.ingredients]; n[index][field] = val; setFormData({...formData, ingredients: n}); };
  const addIng = () => setFormData({...formData, ingredients: [...formData.ingredients, {item: '', quantity: '', unit: ''}]});
  const remIng = (idx) => setFormData({...formData, ingredients: formData.ingredients.filter((_, i) => i !== idx)});
  
  const updateStep = (index, field, val) => { const n = [...formData.steps]; n[index][field] = val; setFormData({...formData, steps: n}); };
  const addStep = () => setFormData({...formData, steps: [...formData.steps, {instruction: '', timeEstimate: ''}]});
  const remStep = (idx) => setFormData({...formData, steps: formData.steps.filter((_, i) => i !== idx)});

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanIngredients = formData.ingredients.filter(i => i.item && i.item.trim() !== '');
    const cleanSteps = formData.steps.filter(s => s.instruction && s.instruction.trim() !== '');

    if (!formData.title.trim() || cleanIngredients.length === 0 || cleanSteps.length === 0) {
      setErrorMsg("Please ensure Title, Ingredients, and Instructions are filled out."); 
      return;
    }
    
    let finalImageUrl = formData.imageUrl;
    if (finalImageUrl.length > 1000000) { finalImageUrl = await compressImage(finalImageUrl); }

    const safeData = {
      title: String(formData.title), timeRequired: String(formData.timeRequired),
      imageUrl: String(finalImageUrl), sourceUrl: String(formData.sourceUrl),
      ingredients: cleanIngredients, steps: cleanSteps 
    };

    onSave(safeData);
  };

  const handleAIImageGen = async () => {
    if (!formData.title) { setErrorMsg("Please enter a title first!"); return; }
    setIsGeneratingImage(true);
    try {
      const generatedImgBase64 = await generateImage(formData.title);
      const compressed = await compressImage(generatedImgBase64);
      setFormData(prev => ({...prev, imageUrl: compressed}));
    } catch (error) { 
      setErrorMsg(error.message || "Image generation failed. Ensure your Gemini API Key is set in Settings."); 
    } 
    finally { setIsGeneratingImage(false); }
  };

  return (
    <div style={{ maxWidth: '56rem', margin: '0 auto', background: 'var(--surface)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-xl)', border: '1px solid var(--border)', padding: '2rem 4rem', animation: 'fadeIn 0.3s' }}>
      <div className="flex items-center justify-between mb-8">
        <p style={{ color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.875rem' }}>{editingRecipeId ? 'Editing Draft' : 'New Draft'}</p>
        <button onClick={onCancel} className="btn-icon"><ArrowLeft size={24} /></button>
      </div>

      {errorMsg && <div className="mb-8 p-4 flex" style={{ background: '#fef2f2', color: '#b91c1c', borderRadius: 'var(--radius-lg)', border: '1px solid #fecaca' }}><AlertCircle size={24} style={{ marginRight: '0.75rem', flexShrink: 0 }} /><span style={{ fontWeight: 700, fontSize: '0.875rem' }}>{errorMsg}</span></div>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input type="text" style={{ width: '100%', fontSize: '3rem', fontWeight: 900, color: 'var(--text-primary)' }} className="font-serif" placeholder="Recipe Title" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
          <div className="flex gap-4" style={{ color: 'var(--text-muted)', fontWeight: 500, fontSize: '1.125rem' }}>
             <div className="flex items-center"><Clock size={20} style={{ marginRight: '0.5rem' }}/><input type="text" style={{ width: '8rem', borderBottom: '2px solid transparent' }} placeholder="Time (e.g. 45m)" value={formData.timeRequired} onChange={(e) => setFormData({...formData, timeRequired: e.target.value})} onFocus={(e)=>e.target.style.borderBottomColor='var(--border)'} onBlur={(e)=>e.target.style.borderBottomColor='transparent'} /></div>
             <div className="flex items-center"><ExternalLink size={20} style={{ marginRight: '0.5rem' }}/><input type="url" style={{ width: '12rem', borderBottom: '2px solid transparent' }} placeholder="Source URL" value={formData.sourceUrl} onChange={(e) => setFormData({...formData, sourceUrl: e.target.value})} onFocus={(e)=>e.target.style.borderBottomColor='var(--border)'} onBlur={(e)=>e.target.style.borderBottomColor='transparent'} /></div>
          </div>
        </div>

        {/* Cover Image Area */}
        <div style={{ position: 'relative', height: '16rem', background: '#f8fafc', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '2px dashed var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          {isGeneratingImage ? ( <div className="flex flex-col items-center" style={{ color: '#2563eb' }}><Loader2 size={32} className="animate-spin mb-3 text-accent" /><span style={{ fontWeight: 700 }}>Painting with AI...</span></div> ) 
          : formData.imageUrl ? ( <><img src={formData.imageUrl} alt="Cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /><div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s', ':hover': { opacity: 1 } }}><input type="url" style={{ width: '75%', padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.9)', fontSize: '0.875rem', fontWeight: 700, outline: 'none' }} placeholder="Change Image URL..." value={formData.imageUrl} onChange={e=>setFormData({...formData, imageUrl: e.target.value})}/></div></> ) 
          : ( <div className="w-full h-full flex flex-col items-center justify-center p-8">
                <input type="url" placeholder="Paste an image URL here..." style={{ width: '100%', maxWidth: '28rem', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--surface)', boxShadow: 'var(--shadow-sm)', marginBottom: '1rem', textAlign: 'center', fontWeight: 500 }} value={formData.imageUrl} onChange={(e) => setFormData({...formData, imageUrl: e.target.value})} />
                <span style={{ color: 'var(--text-muted)', fontWeight: 700, marginBottom: '1rem', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>OR</span>
                <button type="button" onClick={handleAIImageGen} style={{ display: 'flex', alignItems: 'center', padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-md)', background: '#eff6ff', color: '#1d4ed8', fontWeight: 700 }}><Wand2 size={20} style={{ marginRight: '0.5rem' }} /> Generate AI Photo</button>
              </div> )}
        </div>

        {/* Ingredients */}
        <div>
          <h3 className="text-3xl font-serif mb-4 flex items-center" style={{ fontWeight: 900 }}>Ingredients</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {formData.ingredients.map((ing, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <div style={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', background: '#cbd5e1', marginRight: '0.5rem' }}></div>
                <input type="text" placeholder="2" style={{ width: '4rem', padding: '0.5rem', borderRadius: '4px', fontWeight: 700 }} value={ing.quantity} onChange={(e) => updateIng(idx, 'quantity', e.target.value)} />
                <input type="text" placeholder="cups" style={{ width: '6rem', padding: '0.5rem', borderRadius: '4px', color: 'var(--text-secondary)' }} value={ing.unit} onChange={(e) => updateIng(idx, 'unit', e.target.value)} />
                <input type="text" placeholder="Ingredient name..." style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', fontWeight: 500 }} value={ing.item} onChange={(e) => updateIng(idx, 'item', e.target.value)} required />
                <button type="button" onClick={()=>remIng(idx)} style={{ padding: '0.5rem', color: '#cbd5e1' }}><Trash2 size={16}/></button>
              </div>
            ))}
            <button type="button" onClick={addIng} style={{ marginTop: '1rem', color: 'var(--text-muted)', fontWeight: 700, display: 'flex', alignItems: 'center', fontSize: '0.875rem' }}><Plus size={16} style={{ marginRight: '0.25rem' }}/> Add Item</button>
          </div>
        </div>

        {/* Steps */}
        <div>
           <h3 className="text-3xl font-serif mb-4 flex items-center" style={{ fontWeight: 900 }}>Instructions</h3>
           <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {formData.steps.map((step, idx) => (
              <div key={idx} className="flex gap-4 items-start">
                <div style={{ fontWeight: 900, color: '#cbd5e1', fontSize: '1.25rem', width: '2rem', paddingTop: '0.5rem' }} className="font-serif">{idx + 1}.</div>
                <div className="flex-1 flex flex-col gap-2 relative">
                  <textarea rows={2} placeholder="Write step..." style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', fontWeight: 500, fontSize: '1.125rem', resize: 'none', lineHeight: 1.5 }} value={step.instruction} onChange={(e) => updateStep(idx, 'instruction', e.target.value)} required />
                  <input type="text" placeholder="Time (e.g. 5 mins)" style={{ width: '12rem', padding: '0.5rem', borderRadius: '4px', color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.875rem' }} value={step.timeEstimate} onChange={(e) => updateStep(idx, 'timeEstimate', e.target.value)} />
                </div>
                <button type="button" onClick={()=>remStep(idx)} style={{ padding: '0.75rem', color: '#cbd5e1', paddingTop: '1rem' }}><Trash2 size={20}/></button>
              </div>
            ))}
            <button type="button" onClick={addStep} style={{ marginTop: '1rem', color: 'var(--text-muted)', fontWeight: 700, display: 'flex', alignItems: 'center', fontSize: '0.875rem' }}><Plus size={16} style={{ marginRight: '0.25rem' }}/> Add Step</button>
          </div>
        </div>

        <div style={{ paddingTop: '2.5rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" disabled={isSaving || isGeneratingImage} className="btn-primary" style={{ padding: '1.25rem 2.5rem', fontSize: '1.125rem' }}>
            {isSaving ? 'Saving...' : 'Save & Store'} <Save size={24} style={{ marginLeft: '0.75rem', color: '#fca5a5' }} />
          </button>
        </div>
      </form>
    </div>
  );
}
