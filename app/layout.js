import './globals.css';

export const metadata = {
  title: 'LOTRY - 2€ la case',
  description: '1 case gagnante par grille',
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body className="antialiased">{children}</body>
    </html>
  );
}
