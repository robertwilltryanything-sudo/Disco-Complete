import React from 'react';
import { Link } from 'react-router-dom';
import { CollectionItem } from '../types';
import { MusicNoteIcon } from './icons/MusicNoteIcon';

interface RecommendedItemCardProps {
  item: CollectionItem;
}

const RecommendedItemCard: React.FC<RecommendedItemCardProps> = ({ item }) => {
  return (
    <Link 
      to={`/item/${item.id}`} 
      className="block group"
      aria-label={`View details for ${item.title} by ${item.artist}`}
    >
      <div className="bg-white rounded-lg border border-zinc-200 overflow-hidden hover:border-zinc-300">
        <div className="relative">
          {item.coverArtUrl ? (
            <img src={item.coverArtUrl} alt={`${item.title} cover`} className="w-full h-auto aspect-square object-cover" />
          ) : (
            <div className="w-full h-auto aspect-square bg-zinc-200 flex items-center justify-center">
              <MusicNoteIcon className="w-10 h-10 text-zinc-400" />
            </div>
          )}
        </div>
        <div className="p-3">
          <h3 className="font-bold text-sm text-zinc-900 truncate" title={item.title}>{item.title}</h3>
          <p className="text-xs text-zinc-600 truncate" title={item.artist}>{item.artist}</p>
        </div>
      </div>
    </Link>
  );
};

export default React.memo(RecommendedItemCard);