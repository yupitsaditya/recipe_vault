import React, { useState } from 'react';
import { Settings, LogOut, LogIn, User } from 'lucide-react';
import { getGeminiKey, setGeminiKey } from '../services/gemini';
import { useAuth, signInWithGoogle, signOutUser } from '../hooks/useAuth';

export default function SettingsModal({ onClose }) {
  const [localKey, setLocalKey] = useState(() => getGeminiKey() || '');
  const { user } = useAuth();

  const handleSave = () => {
    setGeminiKey(localKey);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button onClick={onClose} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', color: 'var(--text-muted)' }}>
          <Settings size={24} />
        </button>
        <h3 className="text-3xl font-black font-serif flex items-center mb-2">
          <Settings size={32} style={{ marginRight: '0.75rem', color: 'var(--text-primary)' }} />
          App Settings
        </h3>
        <p className="mb-6 text-sm" style={{ color: 'var(--text-secondary)' }}>
          Configure your Bring Your Own Key (BYOK) settings.
        </p>

        <div className="mb-6">
          <label className="text-sm font-bold mb-2" style={{ display: 'block' }}>Account & Sync</label>
          <div style={{ background: 'var(--bg-color)', padding: '1rem', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ padding: '0.5rem', background: 'var(--surface)', borderRadius: '50%', color: 'var(--accent)' }}><User size={20} /></div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{user?.isAnonymous ? 'Local Device Only' : 'Cross-Device Sync Active'}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{user?.isAnonymous ? 'Sign in to access your recipes anywhere' : user?.email}</div>
              </div>
            </div>
            {user?.isAnonymous ? (
              <button type="button" onClick={signInWithGoogle} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'white' }}>
                <LogIn size={16} /> Sign In
              </button>
            ) : (
              <button type="button" onClick={signOutUser} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'white', color: '#dc2626' }}>
                <LogOut size={16} /> Sign Out
              </button>
            )}
          </div>
        </div>

        <div className="mb-6">
          <label className="text-sm font-bold mb-2" style={{ display: 'block' }}>Gemini API Key</label>
          <input 
            type="password" 
            className="input-field"
            placeholder="AIzaSy..." 
            value={localKey} 
            onChange={(e) => setLocalKey(e.target.value)}
          />
          <p className="text-sm mt-4 font-weight-500 text-muted">
            Saved locally to your browser via localStorage. This ensures your key is never public.
          </p>
        </div>

        <div className="flex justify-between gap-4 mt-8" style={{ justifyContent: 'flex-end' }}>
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button onClick={handleSave} className="btn-primary" style={{ padding: '0.75rem 2rem' }}>
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
