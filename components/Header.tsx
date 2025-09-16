
import React, { useState } from 'react';

interface HeaderProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const SunIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
);
const MoonIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
);

const Header: React.FC<HeaderProps> = ({ theme, toggleTheme }) => {
  const [isMenuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/30 dark:bg-gray-900/50 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="text-2xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-magenta">
          Dark Gallery
        </div>
        
        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-6">
          <a href="#" className="hover:text-neon-cyan transition-colors">Home</a>
          <a href="#" className="hover:text-neon-cyan transition-colors">Explore</a>
          <a href="#" className="hover:text-neon-cyan transition-colors">About</a>
          <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" aria-label="Toggle theme">
            {theme === 'light' ? <MoonIcon /> : <SunIcon />}
          </button>
        </nav>

        {/* Mobile Hamburger */}
        <div className="md:hidden flex items-center">
            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors mr-2" aria-label="Toggle theme">
                {theme === 'light' ? <MoonIcon /> : <SunIcon />}
            </button>
            <button onClick={() => setMenuOpen(!isMenuOpen)} className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-neon-cyan">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"} />
                </svg>
            </button>
        </div>
      </div>
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden px-4 pb-4">
          <nav className="flex flex-col space-y-2">
            <a href="#" className="block py-2 px-3 rounded-md hover:bg-gray-200 dark:hover:bg-gray-800 hover:text-neon-cyan transition-colors">Home</a>
            <a href="#" className="block py-2 px-3 rounded-md hover:bg-gray-200 dark:hover:bg-gray-800 hover:text-neon-cyan transition-colors">Explore</a>
            <a href="#" className="block py-2 px-3 rounded-md hover:bg-gray-200 dark:hover:bg-gray-800 hover:text-neon-cyan transition-colors">About</a>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
