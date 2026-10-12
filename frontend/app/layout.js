import './globals.css';
import Header from './shared/Header';

export const metadata = {
  title: 'ADR System',
  description: 'Architecture Decision Record management system'
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
        <Header />
        <main className="page-shell">{children}</main>
      </body>
    </html>
  );
}
