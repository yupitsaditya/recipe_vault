import React, { useState } from 'react';
import { ArrowLeft, Clock, Edit2, Trash2, Check, ExternalLink, Wand2 } from 'lucide-react';
import BrandLogo from './BrandLogo';

export default function RecipeDetail({ recipe, onBack, onEdit, onDelete, onSousChef }) {
  const [checkedSteps, setCheckedSteps] = useState({});

  if (!recipe) return null;

  const isIngArray = Array.isArray(recipe.ingredients);
  const isStepArray = Array.isArray(recipe.steps);

  const toggleStep = (idx) => {
    setCheckedSteps(prev => ({...prev, [idx]: !prev[idx]}));
  };

  return (
    <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-xl)', overflow: 'hidden', animation: 'fadeIn 0.5s', position: 'relative' }}>
      
      {/* Header Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1.5rem', position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 }}>
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', padding: '0.75rem 1.25rem', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(4px)', borderRadius: '9999px', fontWeight: 700, boxShadow: 'var(--shadow-sm)' }}>
          <ArrowLeft size={20} style={{ marginRight: '0.5rem' }} /> Vault
        </button>
        
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={onSousChef} style={{ display: 'flex', alignItems: 'center', padding: '0.75rem 1.25rem', borderRadius: '9999px', background: '#8b5cf6', color: 'white', fontWeight: 700, boxShadow: 'var(--shadow-md)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', transition: 'transform 0.2s' }} onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'} onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}>
            <Wand2 size={20} style={{ marginRight: '0.5rem' }} /> AI Sous Chef
          </button>
          {!recipe.isDemo && (
            <>
              <button onClick={() => onEdit(recipe.id)} style={{ padding: '0.75rem', borderRadius: '50%', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(4px)', color: '#1e3a8a', boxShadow: 'var(--shadow-sm)' }}>
                <Edit2 size={20} />
              </button>
              <button onClick={() => onDelete(recipe.id)} style={{ padding: '0.75rem', borderRadius: '50%', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(4px)', color: '#dc2626', boxShadow: 'var(--shadow-sm)' }}>
                <Trash2 size={20} />
              </button>
            </>
          )}
        </div>
      </div>

      <div className="hero">
        {recipe.imageUrl ? (
          <img src={recipe.imageUrl} alt={recipe.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.2 }}>
            <BrandLogo />
          </div>
        )}
        <div className="hero-content">
          {recipe.profile && <div style={{ display: 'inline-block', background: 'var(--accent)', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>By {recipe.profile}</div>}
          <h1 className="text-5xl font-black mb-4">{recipe.title}</h1>
          
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
             {recipe.timeRequired && ( <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(255,255,255,0.3)', fontWeight: 700, fontSize: '0.875rem' }}><Clock size={20} style={{ marginRight: '0.5rem' }} />{recipe.timeRequired}</div> )}
             {recipe.sourceUrl && ( <a href={recipe.sourceUrl} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(255,255,255,0.3)', fontWeight: 700, fontSize: '0.875rem', color: 'white', textDecoration: 'none' }}><ExternalLink size={20} style={{ marginRight: '0.5rem' }} /> Original Recipe</a> )}
          </div>
        </div>
      </div>

      <div style={{ padding: '4rem', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 2fr)', gap: '4rem', maxWidth: '72rem', margin: '0 auto' }}>
        <div>
          <h3 className="text-3xl font-black mb-8" style={{ borderBottom: '4px solid var(--accent)', display: 'inline-block', paddingBottom: '0.5rem' }}>Ingredients</h3>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {isIngArray ? recipe.ingredients.map((ing, idx) => (
              <li key={idx} style={{ display: 'flex', flexDirection: 'column', borderBottom: '1px solid var(--border)', paddingBottom: '1rem', fontSize: '1.125rem' }}>
                <span style={{ fontWeight: 900, color: 'var(--text-primary)' }}>{ing.quantity} {ing.unit}</span>
                <span style={{ color: 'var(--text-secondary)', fontWeight: 500, marginTop: '0.25rem' }}>{ing.item}</span>
              </li>
            )) : <li style={{ fontSize: '1.125rem', whiteSpace: 'pre-line' }}>{recipe.ingredients}</li>}
          </ul>
        </div>

        <div>
           <h3 className="text-3xl font-black mb-8" style={{ borderBottom: '4px solid var(--text-primary)', display: 'inline-block', paddingBottom: '0.5rem' }}>Preparation</h3>
           <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
             {isStepArray ? recipe.steps.map((st, idx) => {
               const isChecked = checkedSteps[idx];
               return (
                 <div key={idx} onClick={() => toggleStep(idx)} style={{ display: 'flex', gap: '1.5rem', padding: '1.5rem', borderRadius: 'var(--radius-xl)', cursor: 'pointer', transition: 'var(--transition)', opacity: isChecked ? 0.4 : 1, filter: isChecked ? 'grayscale(100%)' : 'none', marginLeft: '-1.5rem' }} className="step-row hover:bg-slate-50">
                    <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 900, fontSize: '1.125rem', border: '2px solid', borderColor: isChecked ? '#22c55e' : 'var(--border)', background: isChecked ? '#22c55e' : 'transparent', color: isChecked ? 'white' : 'var(--text-muted)' }}>
                      {isChecked ? <Check size={24}/> : idx + 1}
                    </div>
                    <div style={{ paddingTop: '0.25rem' }}>
                      <p style={{ fontSize: '1.5rem', fontWeight: 500, lineHeight: 1.6, textDecoration: isChecked ? 'line-through' : 'none' }}>{st.instruction}</p>
                      {st.timeEstimate && <p style={{ fontWeight: 700, color: 'var(--accent)', marginTop: '0.75rem', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{st.timeEstimate}</p>}
                    </div>
                 </div>
               )
             }) : <div style={{ fontSize: '1.5rem', lineHeight: 1.6, whiteSpace: 'pre-line' }}>{recipe.steps}</div>}
           </div>
        </div>
      </div>
    </div>
  );
}
