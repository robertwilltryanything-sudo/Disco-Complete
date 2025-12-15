import React from 'react';
import { PlusIcon } from './icons/PlusIcon';

interface FloatingActionButtonProps {
  onClick: () => void;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="md:hidden fixed bottom-20 right-4 w-14 h-14 bg-zinc-900/30 backdrop-blur-md text-white rounded-full shadow-lg flex items-center justify-center hover:bg-zinc-900/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-900 z-30 transition-all active:scale-95"
      aria-label="Add Item"
    >
      <PlusIcon className="w-8 h-8 drop-shadow-sm" />
    </button>
  );
};

export default FloatingActionButton;