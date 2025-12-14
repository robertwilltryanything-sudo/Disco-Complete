import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CollectionItem } from '../types';
import { MusicNoteIcon } from './icons/MusicNoteIcon';
import { EditIcon } from './icons/EditIcon';
import { capitalizeWords } from '../utils';

// This component is defined internally to fix the dependency on the missing CDTableRow.tsx file.
const CollectionTableRow: React.FC<{ item: CollectionItem; onRequestEdit: (item: CollectionItem) => void; }> = ({ item, onRequestEdit }) => {
  const navigate = useNavigate();

  const handleRowClick = (e: React.MouseEvent<HTMLTableRowElement>) => {
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    navigate(`/item/${item.id}`);
  };

  const handleEditClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onRequestEdit(item);
  };

  return (
    <tr
      className="block md:table-row mb-4 md:mb-0 bg-white md:bg-transparent border md:border-b border-zinc-200 rounded-lg md:rounded-none shadow-sm md:shadow-none hover:bg-zinc-50 cursor-pointer"
      onClick={handleRowClick}
      aria-label={`View details for ${item.title}`}
    >
      <td className="block md:table-cell p-3 md:p-2 md:w-16 align-middle">
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0">
            {item.coverArtUrl ? (
              <img src={item.coverArtUrl} alt={`${item.title} cover`} className="w-16 h-16 md:w-12 md:h-12 object-cover rounded-md" />
            ) : (
              <div className="w-16 h-16 md:w-12 md:h-12 bg-zinc-200 flex items-center justify-center rounded-md">
                <MusicNoteIcon className="w-8 md:w-6 h-8 md:h-6 text-zinc-400" />
              </div>
            )}
          </div>
          <div className="flex-grow md:hidden">
            <p className="font-bold text-zinc-900" title={item.title}>{item.title}</p>
            <p className="text-zinc-700 text-sm" title={item.artist}>{capitalizeWords(item.artist)}</p>
            {(item.genre || item.year) && (
              <p className="text-xs text-zinc-500 mt-1">{[item.genre, item.year].filter(Boolean).join(' • ')}</p>
            )}
          </div>
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


interface CollectionTableProps {
  collection: CollectionItem[];
  onRequestEdit: (item: CollectionItem) => void;
}

const CollectionTable: React.FC<CollectionTableProps> = ({ collection, onRequestEdit }) => {
  if (collection.length === 0) {
    return (
      <div className="text-center py-10 px-4 bg-zinc-50 rounded-lg border border-dashed border-zinc-300">
        <p className="text-zinc-600">No items found in your collection.</p>
        <p className="text-sm text-zinc-500 mt-1">Try changing your search or adding a new item!</p>
      </div>
    );
  }

  return (
    <div className="md:bg-white md:rounded-lg md:border md:border-zinc-200 md:overflow-hidden">
      <table className="w-full text-left">
        <thead className="hidden md:table-header-group bg-zinc-50/75 border-b border-zinc-200 text-sm font-semibold text-zinc-600 uppercase tracking-wider">
          <tr>
            <th className="p-3 w-16" aria-label="Cover Art"></th>
            <th className="p-3">Title</th>
            <th className="p-3">Artist</th>
            <th className="p-3">Genre</th>
            <th className="p-3">Year</th>
            <th className="p-3 w-20" aria-label="Actions"></th>
          </tr>
        </thead>
        <tbody className="block md:table-row-group">
          {collection.map(item => (
            <CollectionTableRow key={item.id} item={item} onRequestEdit={onRequestEdit} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default React.memo(CollectionTable);