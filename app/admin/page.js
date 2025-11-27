'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [boxes, setBoxes] = useState([]);
  const router = useRouter();

  // Charger les cases quand authentifié
  const loadBoxes = async () => {
    try {
      const res = await fetch('/api/boxes', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        }
      });
      const data = await res.json();
      setBoxes(data.boxes);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleLogin = () => {
    // Vérification simple côté client (le vrai check est côté serveur)
    if (password.trim()) {
      setIsAuthenticated(true);
      setMessage({ type: '', text: '' });
      loadBoxes();
    } else {
      setMessage({ type: 'error', text: 'Veuillez entrer un mot de passe' });
    }
  };

  const handleReset = async () => {
    if (!window.confirm('⚠️ Êtes-vous sûr de vouloir réinitialiser TOUTE la base de données ? Cette action est irréversible !')) {
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await fetch('/api/admin/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: data.message });
        await loadBoxes();
        setTimeout(() => {
          router.push('/');
        }, 2000);
      } else {
        setMessage({ type: 'error', text: data.error });
        if (res.status === 401) {
          setIsAuthenticated(false);
          setPassword('');
        }
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors de la réinitialisation' });
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">
              🔒 Administration
            </h1>
            <p className="text-slate-600">Accès restreint</p>
          </div>

          {message.text && (
            <div className={`p-4 rounded-lg mb-6 ${
              message.type === 'error' ? 'bg-red-50 text-red-800' : 'bg-green-50 text-green-800'
            }`}>
              <p className="text-sm">{message.text}</p>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="••••••••"
                autoFocus
              />
            </div>

            <button
              onClick={handleLogin}
              className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Se connecter
            </button>

            <button
              onClick={() => router.push('/')}
              className="w-full text-slate-600 hover:text-slate-800 text-sm transition-colors"
            >
              ← Retour au site
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 mb-2">
                ⚙️ Panel Admin
              </h1>
              <p className="text-slate-600">Gestion de la base de données</p>
            </div>
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 text-slate-600 hover:text-slate-800 border border-slate-300 rounded-lg hover:border-slate-400 transition-colors"
            >
              ← Retour au site
            </button>
          </div>

          {message.text && (
            <div className={`p-4 rounded-lg mb-6 flex items-start gap-3 ${
              message.type === 'error' ? 'bg-red-50 text-red-800' : 'bg-green-50 text-green-800'
            }`}>
              <span className="text-xl">
                {message.type === 'error' ? '❌' : '✅'}
              </span>
              <p className="text-sm flex-1">{message.text}</p>
            </div>
          )}

          <div className="space-y-6">
            {/* Grille des cases avec infos complètes */}
            <div className="bg-slate-50 rounded-lg p-6">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span>📊</span>
                État de la grille
              </h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 mb-4">
                {boxes.map((box) => (
                  <div
                    key={box.number}
                    className={`
                      aspect-square rounded-lg border-2
                      flex flex-col items-center justify-center p-2
                      ${box.reserved === 1
                        ? 'bg-slate-400 border-slate-500'
                        : 'bg-white border-slate-300'
                      }
                    `}
                  >
                    <span className={`text-2xl font-bold ${box.reserved === 1 ? 'text-white' : 'text-slate-700'}`}>
                      {box.number}
                    </span>
                    {box.reserved === 1 && (
                      <div className="text-xs text-white text-center mt-1 leading-tight">
                        <div className="truncate w-full font-semibold">{box.user_name}</div>
                        <div className="truncate w-full text-[10px]">{box.user_phone}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="text-sm text-slate-600">
                <strong>{boxes.filter(b => b.reserved === 1).length}</strong> case(s) réservée(s) sur <strong>12</strong>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
              <div className="flex items-start gap-3 mb-4">
                <span className="text-2xl">⚠️</span>
                <div>
                  <h3 className="font-bold text-amber-900 mb-1">
                    Zone dangereuse
                  </h3>
                  <p className="text-sm text-amber-800">
                    Cette action supprimera toutes les réservations et réinitialisera toutes les cases.
                  </p>
                </div>
              </div>

              <button
                onClick={handleReset}
                disabled={loading}
                className="w-full bg-red-600 text-white font-semibold py-4 rounded-lg hover:bg-red-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? '🔄 Réinitialisation en cours...' : '🗑️ Réinitialiser la base de données'}
              </button>
            </div>

            <div className="bg-slate-50 rounded-lg p-6">
              <h3 className="font-bold text-slate-800 mb-3">
                📊 Actions disponibles
              </h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>✓ Réinitialiser toutes les cases</li>
                <li>✓ Supprimer tous les utilisateurs</li>
                <li>✓ Remettre la grille à zéro</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}