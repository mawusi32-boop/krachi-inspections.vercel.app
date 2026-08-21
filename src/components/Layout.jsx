import Navigation from './Navigation';
import { Toaster } from 'react-hot-toast';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
      <Toaster position="top-right" />
    </div>
  );
}