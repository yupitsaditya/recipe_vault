import React, { useState } from 'react';
import { Search, Plus, User, Users, Settings, BookOpen, Download, RefreshCw } from 'lucide-react';
import { useAuth } from './hooks/useAuth';
import { useRecipes } from './hooks/useRecipes';

import BrandLogo from './components/BrandLogo';
import RecipeCard from './components/RecipeCard';
import RecipeDetail from './components/RecipeDetail';
import RecipeForm from './components/RecipeForm';
import AIRecipeDump from './components/AIRecipeDump';
import SettingsModal from './components/SettingsModal';
import AIModifierModal from './components/AIModifierModal';

const DEMO_RECIPES = [
  {
    id: 'demo-1', title: 'Mummy Wali Dal Tadka', timeRequired: '25 mins', profile: 'Rashika', isDemo: true,
    imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
    ingredients: [
      { item: 'Toor Dal (Yellow Lentils)', quantity: '1', unit: 'cup' },
      { item: 'Water', quantity: '2.5', unit: 'cups' },
      { item: 'Turmeric Powder', quantity: '0.5', unit: 'tsp' },
      { item: 'Ghee', quantity: '2', unit: 'tbsp' },
      { item: 'Cumin Seeds (Jeera)', quantity: '1', unit: 'tsp' }
    ],
    steps: [
      { instruction: 'Wash the dal thoroughly and add to a pressure cooker with water, turmeric, and salt.', timeEstimate: '2 mins' },
      { instruction: 'Pressure cook for 3 whistles until soft and mushy.', timeEstimate: '15 mins' },
      { instruction: 'In a small pan, heat ghee. Add cumin seeds and let them splutter.', timeEstimate: '3 mins' },
      { instruction: 'Pour the hot tempering over the cooked dal and stir well.', timeEstimate: '1 min' }
    ]
  }
];

const defaultFormData = { title: '', timeRequired: '', imageUrl: '', sourceUrl: '', ingredients: [], steps: [] };

export default function App() {
  const { user, loading } = useAuth();
  const { recipes, saveRecipe, removeRecipe } = useRecipes(user);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [currentView, setCurrentView] = useState('list'); // list, detail, form, dump
  const [selectedRecipeId, setSelectedRecipeId] = useState(null);
  const [editingRecipeId, setEditingRecipeId] = useState(null);
  const [activeProfile, setActiveProfile] = useState('Rashika'); 
  const [formData, setFormData] = useState(defaultFormData);
  
  const [showSettings, setShowSettings] = useState(false);
  const [showAIModifier, setShowAIModifier] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Filter Logic
  const displayRecipes = recipes.length > 0 ? recipes : DEMO_RECIPES;
  const filteredRecipes = displayRecipes.filter(r => 
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (r.profile && r.profile.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleCreateNew = () => {
    setFormData(defaultFormData);
    setEditingRecipeId(null);
    setCurrentView('dump');
  };

  const handleEdit = (id) => {
    const rx = displayRecipes.find(r => r.id === id);
    if (!rx) return;
    setFormData(rx);
    setEditingRecipeId(id);
    setCurrentView('form');
  };

  const handleSaveForm = async (data) => {
    setIsSaving(true);
    try {
      const payload = { ...data, profile: activeProfile };
      const newId = await saveRecipe(payload, editingRecipeId);
      setSelectedRecipeId(newId);
      setCurrentView('detail');
      window.scrollTo(0,0);
    } catch (e) {
      alert("Failed to save: " + e.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (DEMO_RECIPES.find(r => r.id === id)) return;
    await removeRecipe(id);
    if (selectedRecipeId === id && currentView === 'detail') setCurrentView('list');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-pulse flex flex-col items-center"><BrandLogo /><h2 className="mt-4 text-xl font-bold">Warming the kitchen...</h2></div></div>;

  return (
    <>
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
      
      {showAIModifier && (
        <AIModifierModal 
          recipe={displayRecipes.find(r => r.id === selectedRecipeId)} 
          onClose={() => setShowAIModifier(false)}
          onModified={(newDraft) => {
            setFormData(newDraft);
            setShowAIModifier(false);
            setEditingRecipeId(null);
            setCurrentView('form');
          }}
          onRequireSettings={() => {
            setShowAIModifier(false);
            setShowSettings(true);
          }}
        />
      )}

      <header className="header">
        <div className="max-w-7xl sm-flex-row justify-between items-center" style={{ paddingBlock: '1.25rem', paddingInline: '1rem' }}>
          <div className="brand-logo" onClick={() => setCurrentView('list')}>
            <BrandLogo />
            <h1 className="text-3xl font-black">Rashika's Vault</h1>
          </div>
          <div className="header-actions">
            <button className="btn-icon" onClick={() => setShowSettings(true)} title="Settings"><Settings size={20} /></button>
            <div style={{ display: 'flex', background: 'var(--bg-color)', borderRadius: '9999px', padding: '0.25rem', border: '1px solid var(--border)' }}>
              {['Rashika', 'Family'].map(p => (
                <button key={p} onClick={() => setActiveProfile(p)} className={`btn-secondary ${activeProfile === p ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center' }}>
                  {p === 'Rashika' ? <User size={16} style={{ marginRight: '0.5rem' }}/> : <Users size={16} style={{ marginRight: '0.5rem' }}/>} {p}
                </button>
              ))}
            </div>
            {(currentView === 'list' || currentView === 'detail') && (
              <button onClick={handleCreateNew} className="btn-primary" style={{ padding: '0.75rem 1.5rem' }}>
                <Plus size={20} style={{ marginRight: '0.5rem' }}/> Add Recipe
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl" style={{ paddingBlock: '3rem' }}>
        {currentView === 'list' && (
          <div className="animate-in fade-in cursor-default" style={{ animation: 'fadeIn 0.3s' }}>
            <div style={{ position: 'relative', maxWidth: '48rem', margin: '0 auto 3rem auto' }}>
              <div style={{ position: 'absolute', inset: 0, left: '1.5rem', display: 'flex', alignItems: 'center', pointerEvents: 'none', color: 'var(--text-muted)' }}><Search size={24} /></div>
              <input type="text" placeholder="Search recipes or profiles..." style={{ width: '100%', padding: '1.25rem 1.25rem 1.25rem 4rem', borderRadius: '9999px', fontSize: '1.125rem', fontWeight: 500, background: 'var(--surface)', boxShadow: 'var(--shadow-lg)', transition: 'var(--transition)' }} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>

            <div className="card-grid">
              {filteredRecipes.map(recipe => (
                <RecipeCard key={recipe.id} recipe={recipe} onClick={(id) => { setSelectedRecipeId(id); setCurrentView('detail'); window.scrollTo(0,0); }} />
              ))}
            </div>
          </div>
        )}

        {currentView === 'dump' && (
          <AIRecipeDump 
            onBack={() => setCurrentView('list')}
            onParsed={(data) => { setFormData(data); setCurrentView('form'); }}
            onSkip={(text) => { setFormData({...defaultFormData}); setCurrentView('form'); }}
            onRequireSettings={() => setShowSettings(true)}
          />
        )}

        {currentView === 'form' && (
          <RecipeForm 
            initialData={formData} 
            isSaving={isSaving}
            editingRecipeId={editingRecipeId}
            onCancel={() => editingRecipeId ? setCurrentView('detail') : setCurrentView('list')}
            onSave={handleSaveForm}
          />
        )}

        {currentView === 'detail' && (
          <RecipeDetail 
            recipe={displayRecipes.find(r => r.id === selectedRecipeId)}
            onBack={() => setCurrentView('list')}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onSousChef={() => setShowAIModifier(true)}
          />
        )}
      </main>
    </>
  );
}
