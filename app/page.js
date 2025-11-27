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
        // Réservation réussie, redirection vers PayPal
        const amount = selectedBoxes.length * 2;
        const paypalUrl = `https://www.paypal.com/paypalme/raphaelmontico/${amount}EUR`;

        // Redirection directe vers PayPal
        window.location.href = paypalUrl;
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
                  <div className="text-xs text-white text-center mt-1">
                    <div className="font-semibold">RÉSERVÉE</div>
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
              <div className="flex justify-between items-center mb-3">
                <span className="text-slate-600">Total à payer:</span>
                <span className="text-2xl font-bold text-blue-600">{totalPrice} €</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 pt-2 border-t border-slate-200">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.93 4.778-4.005 7.201-9.138 7.201h-2.19a.563.563 0 0 0-.556.479l-1.187 7.527h-.506l-.24 1.516a.56.56 0 0 0 .554.647h3.882c.46 0 .85-.334.922-.788.06-.26.76-4.852.816-5.09a.932.932 0 0 1 .923-.788h.58c3.76 0 6.705-1.528 7.565-5.946.36-1.847.174-3.388-.777-4.471z"/>
                </svg>
                <span>Paiement sécurisé via PayPal</span>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading || selectedBoxes.length === 0}
              className="w-full bg-blue-600 text-white font-semibold py-4 rounded-lg hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors duration-200 text-lg flex items-center justify-center gap-2"
            >
              {loading ? (
                'Envoi en cours...'
              ) : (
                <>
                  <span>ENVOYER ET PAYER</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.93 4.778-4.005 7.201-9.138 7.201h-2.19a.563.563 0 0 0-.556.479l-1.187 7.527h-.506l-.24 1.516a.56.56 0 0 0 .554.647h3.882c.46 0 .85-.334.922-.788.06-.26.76-4.852.816-5.09a.932.932 0 0 1 .923-.788h.58c3.76 0 6.705-1.528 7.565-5.946.36-1.847.174-3.388-.777-4.471z"/>
                  </svg>
                </>
              )}
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