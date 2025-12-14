import React from 'react';
import { CollectionItem } from '../types';
import CollectionItemCard from './CollectionItemCard';

interface CollectionListProps {
  collection: CollectionItem[];
}

const CollectionList: React.FC<CollectionListProps> = ({ collection }) => {
  if (collection.length === 0) {
    return (
      <div className="text-center py-10 px-4 bg-zinc-50 rounded-lg border border-dashed border-zinc-300">
        <p className="text-zinc-600">No items found in your collection.</p>
        <p className="text-sm text-zinc-500 mt-1">Try changing your search or adding a new item!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4 md:gap-6">
      {collection.map(item => (
        <CollectionItemCard key={item.id} item={item} />
      ))}
    </div>
  );
};

export default React.memo(CollectionList);
