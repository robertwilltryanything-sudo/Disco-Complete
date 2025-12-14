import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CollectionItem } from '../types';
import { MusicNoteIcon } from './icons/MusicNoteIcon';
import { EditIcon } from './icons/EditIcon';
import { capitalizeWords } from '../utils';

interface CollectionTableRowProps {
  item: CollectionItem;
  onRequestEdit: (item: CollectionItem) => void;
}

const CollectionTableRow: React.FC<CollectionTableRowProps> = ({ item, onRequestEdit }) => {
  const navigate = useNavigate();

  const handleRowClick = (e: React.MouseEvent<HTMLTableRowElement>) => {
    // Prevent navigation when clicking on the button inside the row
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    navigate(`/item/${item.id}`);
  };

  const handleEditClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); // Prevent row click from firing
    onRequestEdit(item);
  };

  return (
    <tr
      className="block md:table-row mb-4 md:mb-0 bg-white md:bg-transparent border md:border-b border-zinc-200 rounded-lg md:rounded-none shadow-sm md:shadow-none hover:bg-zinc-50 cursor-pointer"
      onClick={handleRowClick}
      aria-label={`View details for ${item.title}`}
    >
      {/* This single cell contains the entire mobile card layout */}
      <td className="block md:table-cell p-3 md:p-2 md:w-16 align-middle">
        <div className="flex items-center gap-4">
          {/* Image */}
          <div className="flex-shrink-0">
            {item.coverArtUrl ? (
              <img src={item.coverArtUrl} alt={`${item.title} cover`} className="w-16 h-16 md:w-12 md:h-12 object-cover rounded-md" />
            ) : (
              <div className="w-16 h-16 md:w-12 md:h-12 bg-zinc-200 flex items-center justify-center rounded-md">
                <MusicNoteIcon className="w-8 md:w-6 h-8 md:h-6 text-zinc-400" />
              </div>
            )}
          </div>
          {/* Info Stack for Mobile */}
          <div className="flex-grow md:hidden">
            <p className="font-bold text-zinc-900" title={item.title}>{item.title}</p>
            <p className="text-zinc-700 text-sm" title={item.artist}>{capitalizeWords(item.artist)}</p>
            {(item.genre || item.year) && (
              <p className="text-xs text-zinc-500 mt-1">{[item.genre, item.year].filter(Boolean).join(' • ')}</p>
            )}
          </div>
           {/* Edit button is part of the flex layout on mobile */}
           <div className="ml-auto md:hidden">
             <button
                onClick={handleEditClick}
                className="p-2 text-zinc-500 hover:text-zinc-800 hover:bg-zinc-200 rounded-full"
                aria-label={`Edit ${item.title}`}
              >
                <EditIcon className="w-5 h-5" />
              </button>
           </div>
        </div>
      </td>

      {/* Desktop-only cells. Hidden on mobile. */}
      <td className="hidden md:table-cell p-3 font-bold text-zinc-900 align-middle" title={item.title}>{item.title}</td>
      <td className="hidden md:table-cell p-3 text-zinc-700 align-middle" title={item.artist}>{capitalizeWords(item.artist)}</td>
      <td className="hidden md:table-cell p-3 text-zinc-600 align-middle">{item.genre}</td>
      <td className="hidden md:table-cell p-3 text-zinc-600 align-middle">{item.year}</td>
      <td className="hidden md:table-cell p-3 text-right align-middle">
        <button
          onClick={handleEditClick}
          className="p-2 text-zinc-500 hover:text-zinc-800 hover:bg-zinc-200 rounded-full"
          aria-label={`Edit ${item.title}`}
        >
          <EditIcon className="w-5 h-5" />
        </button>
      </td>
    </tr>
  );
};

export default React.memo(CollectionTableRow);