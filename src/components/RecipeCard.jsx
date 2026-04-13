import React from 'react';
import { Clock } from 'lucide-react';
import BrandLogo from './BrandLogo';

export default function RecipeCard({ recipe, onClick }) {
  return (
    <div onClick={() => onClick(recipe.id)} className="recipe-card">
      {recipe.isDemo && (
        <div style={{ position: 'absolute', top: '1rem', right: '1rem', zIndex: 10, background: '#facc15', color: '#172554', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', boxShadow: 'var(--shadow)' }}>
          DEMO
        </div>
      )}
      
      <div className="recipe-card-img-wrap">
        {recipe.imageUrl ? (
          <img src={recipe.imageUrl} alt={recipe.title} className="recipe-card-img" />
        ) : (
          <div className="flex items-center justify-center h-full" style={{ opacity: 0.2 }}>
            <BrandLogo />
          </div>
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(23,37,84,0.8), transparent)', opacity: 0, transition: 'var(--transition)' }} className="hover-gradient"></div>
        {recipe.timeRequired && (
          <div style={{ position: 'absolute', bottom: '1rem', right: '1rem', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(4px)', padding: '0.5rem 1rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700, color: '#172554', boxShadow: 'var(--shadow-lg)', display: 'flex', alignItems: 'center' }}>
            <Clock size={14} style={{ marginRight: '0.375rem', color: '#dc2626' }} />
            {recipe.timeRequired}
          </div>
        )}
      </div>
      
      <div className="recipe-card-content">
        {recipe.profile && (
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#dc2626', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {recipe.profile}
          </div>
        )}
        <h3 className="recipe-title">{recipe.title}</h3>
      </div>
    </div>
  );
}
