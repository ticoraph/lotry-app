'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [boxes, setBoxes] = useState([]);
  const [selectedBoxes, setSelectedBoxes] = useState([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadBoxes();
  }, []);

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

  const toggleBox = (number) => {
    const box = boxes.find(b => b.number === number);
    if (box?.reserved) return;

    if (selectedBoxes.includes(number)) {
      setSelectedBoxes(selectedBoxes.filter(n => n !== number));
    } else {
      setSelectedBoxes([...selectedBoxes, number]);
    }
  };

  const handleSubmit = async () => {
    if (selectedBoxes.length === 0) {
      setMessage({ type: 'error', text: 'Veuillez sélectionner au moins une case' });
      return;
    }

    if (!name.trim() || !phone.trim()) {
      setMessage({ type: 'error', text: 'Veuillez remplir tous les champs' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await fetch('/api/reserve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, selectedBoxes })
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: data.message });
        setSelectedBoxes([]);
        setName('');
        setPhone('');
        await loadBoxes();
      } else {
        setMessage({ type: 'error', text: data.error });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors de la réservation' });
    } finally {
      setLoading(false);
    }
  };

  const totalPrice = selectedBoxes.length * 2;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1
            onClick={() => window.location.reload()}
            className="text-5xl font-bold text-slate-800 mb-2 tracking-tight cursor-pointer hover:text-blue-600 transition-colors"
          >
            LOTRY
          </h1>
          <p className="text-xl text-slate-600 mb-1">2€ la case</p>
          <p className="text-sm text-slate-500">1 case gagnante par grille</p>
        </header>

        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-8">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 mb-6">
            {boxes.map((box) => (
              <button
                key={box.number}
                onClick={() => toggleBox(box.number)}
                disabled={box.reserved === 1}
                className={`
                  aspect-square rounded-lg border-2 transition-all duration-200
                  flex flex-col items-center justify-center p-2
                  ${box.reserved === 1
                    ? 'bg-slate-400 border-slate-500 cursor-not-allowed opacity-60'
                    : selectedBoxes.includes(box.number)
                    ? 'bg-blue-500 border-blue-600 text-white shadow-md scale-105'
                    : 'bg-white border-slate-300 hover:border-slate-400 hover:shadow-md hover:scale-105 cursor-pointer'
                  }
                `}
              >
                <span className={`text-2xl font-bold ${box.reserved === 1 ? 'text-white' : selectedBoxes.includes(box.number) ? 'text-white' : 'text-slate-700'}`}>
                  {box.number}
                </span>
                {box.reserved === 1 && (
                  <div className="text-xs text-white text-center mt-1 leading-tight">
                    <div className="truncate w-full">{box.user_name}</div>
                    <div className="truncate w-full text-[10px]">{box.user_phone}</div>
                  </div>
                )}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-slate-600 justify-center">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-white border-2 border-slate-300 rounded"></div>
              <span>Disponible</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 border-2 border-blue-600 rounded"></div>
              <span>Sélectionnée</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-slate-400 border-2 border-slate-500 rounded"></div>
              <span>Réservée</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">
            Réserver mes cases
          </h2>

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
                Nom complet
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="Votre nom"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Téléphone
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="06 12 34 56 78"
              />
            </div>

            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <div className="flex justify-between items-center text-sm mb-2">
                <span className="text-slate-600">Cases sélectionnées:</span>
                <span className="font-bold text-slate-800">{selectedBoxes.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Total à payer:</span>
                <span className="text-2xl font-bold text-blue-600">{totalPrice} €</span>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading || selectedBoxes.length === 0}
              className="w-full bg-blue-600 text-white font-semibold py-4 rounded-lg hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors duration-200 text-lg"
            >
              {loading ? 'Envoi en cours...' : 'ENVOYER'}
            </button>
          </div>
        </div>

        <footer className="text-center mt-12 text-sm text-slate-500">
          <p>© 2025 LOTRY - Tous droits réservés</p>
        </footer>
      </div>
    </div>
  );
}