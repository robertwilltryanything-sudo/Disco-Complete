

import React, { useMemo, useCallback, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { CollectionItem } from '../types';
import { ArrowLeftIcon } from '../components/icons/ArrowLeftIcon';
import { MusicNoteIcon } from '../components/icons/MusicNoteIcon';
import { EditIcon } from '../components/icons/EditIcon';
import { ArrowRightIcon } from '../components/icons/ArrowRightIcon';
import { GlobeIcon } from '../components/icons/GlobeIcon';
// FIX: Corrected import path from non-existent 'RecommendedCDItem' to 'RecommendedItemCard'.
import RecommendedItemCard from '../components/RecommendedItemCard';
import { capitalizeWords } from '../utils';
import { PlusIcon } from '../components/icons/PlusIcon';
import { TrashIcon } from '../components/icons/TrashIcon';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import { SparklesIcon } from '../components/icons/SparklesIcon';
import { getAlbumDetails } from '../gemini';
import { SpinnerIcon } from '../components/icons/SpinnerIcon';

interface DetailViewProps {
  collection: CollectionItem[];
  onDeleteItem: (id: string) => void;
  onUpdateItem: (item: CollectionItem) => Promise<void>;
}

const DetailView: React.FC<DetailViewProps> = ({ collection, onDeleteItem, onUpdateItem }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { item, previousItem, nextItem } = useMemo(() => {
    const currentIndex = collection.findIndex(c => c.id === id);
    if (currentIndex === -1) {
      return { item: null, previousItem: null, nextItem: null };
    }
    const currentItem = collection[currentIndex];
    const prev = currentIndex > 0 ? collection[currentIndex - 1] : null;
    const next = currentIndex < collection.length - 1 ? collection[currentIndex + 1] : null;
    return { item: currentItem, previousItem: prev, nextItem: next };
  }, [collection, id]);

  const recommendations = useMemo(() => {
    if (!item) return [];
    
    const MAX_RECOMMENDATIONS = 4;
    const recommendedMap = new Map<string, CollectionItem>();

    // Priority 1: Same Artist
    collection.forEach(c => {
      if (c.id !== item.id && c.artist === item.artist) {
        recommendedMap.set(c.id, c);
      }
    });

    // Priority 2: Same Genre
    if (recommendedMap.size < MAX_RECOMMENDATIONS && item.genre) {
      collection.forEach(c => {
        if (!recommendedMap.has(c.id) && c.id !== item.id && c.genre === item.genre) {
          recommendedMap.set(c.id, c);
        }
      });
    }

    // Priority 3: Shared Tags
    if (recommendedMap.size < MAX_RECOMMENDATIONS && item.tags && item.tags.length > 0) {
      const currentTags = new Set(item.tags);
      collection.forEach(c => {
        if (!recommendedMap.has(c.id) && c.id !== item.id && c.tags?.some(tag => currentTags.has(tag))) {
            recommendedMap.set(c.id, c);
        }
      });
    }
    
    return Array.from(recommendedMap.values()).slice(0, MAX_RECOMMENDATIONS);
  }, [item, collection]);

  const wikipediaUrl = useMemo(() => {
    if (!item) return '';
    return `https://en.wikipedia.org/wiki/${encodeURIComponent(item.title.replace(/ /g, '_'))}`;
  }, [item]);

  const handleEdit = useCallback(() => {
    if (item) {
      navigate('/', { state: { editItemId: item.id } });
    }
  }, [navigate, item]);

  const handleRequestDelete = useCallback(() => {
    setIsDeleteModalOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (item) {
        onDeleteItem(item.id);
        setIsDeleteModalOpen(false);
        navigate('/', { replace: true });
    }
  }, [item, onDeleteItem, navigate]);

  const handleRefreshData = useCallback(async () => {
      if (!item) return;
      setIsRefreshing(true);
      try {
          const details = await getAlbumDetails(item.artist, item.title);
          if (details) {
              const updatedItem: CollectionItem = {
                  ...item,
                  genre: item.genre || details.genre,
                  recordLabel: item.recordLabel || details.recordLabel,
                  year: item.year || details.year,
                  tags: [...new Set([...(item.tags || []), ...(details.tags || [])])],
              };
              await onUpdateItem(updatedItem);
          }
      } catch (error) {
          console.error("Failed to refresh album details:", error);
          alert("Could not fetch new details. Please try again later.");
      } finally {
          setIsRefreshing(false);
      }
  }, [item, onUpdateItem]);

  const handleArtistClick = useCallback(() => {
    if (item?.artist) {
      navigate({ pathname: '/', search: `?q=${encodeURIComponent(item.artist)}` });
    }
  }, [navigate, item]);

  const handleYearClick = useCallback(() => {
    if (item?.year) {
      navigate({ pathname: '/', search: `?q=${encodeURIComponent(item.year.toString())}` });
    }
  }, [navigate, item]);

  const handleGenreClick = useCallback(() => {
    if (item?.genre) {
      navigate({ pathname: '/', search: `?q=${encodeURIComponent(item.genre)}` });
    }
  }, [navigate, item]);

  const handleRecordLabelClick = useCallback(() => {
    if (item?.recordLabel) {
      navigate({ pathname: '/', search: `?q=${encodeURIComponent(item.recordLabel)}` });
    }
  }, [navigate, item]);

  if (!item) {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold text-red-600">Item Not Found</h2>
        <p className="text-zinc-600 mt-2">The item you are looking for does not exist in this collection.</p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-2 bg-zinc-900 text-white font-bold py-2 px-4 rounded-lg hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-900"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          Back to Collection
        </Link>
      </div>
    );
  }

  const hasReleaseInfo = item.year || item.genre || item.recordLabel || item.version;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-zinc-600 hover:text-zinc-900 font-medium"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          Back to Collection
        </Link>
      </div>
      <div className="bg-white rounded-lg border border-zinc-200 overflow-hidden">
        <div className="md:flex">
            <div className="md:flex-shrink-0">
                {item.coverArtUrl ? (
                    <img src={item.coverArtUrl} alt={`${item.title} cover`} className="w-full aspect-square object-cover md:w-64 rounded-br-lg" />
                ) : (
                    <div className="w-full aspect-square bg-zinc-200 flex items-center justify-center md:w-64 rounded-br-lg">
                        <MusicNoteIcon className="w-24 h-24 text-zinc-400" />
                    </div>
                )}
            </div>
            <div className="p-6 md:p-8 flex flex-col justify-start relative flex-grow">
              <h1 className="text-3xl md:text-4xl font-extrabold text-zinc-900 tracking-tight">{item.title}</h1>
              <h2 className="text-lg md:text-xl font-semibold text-zinc-700 mt-1">
                <button
                    onClick={handleArtistClick}
                    className="text-left w-full hover:text-zinc-900 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-800 rounded-sm p-1 -m-1"
                    aria-label={`View all albums by ${item.artist}`}
                    disabled={!item.artist}
                >
                    {capitalizeWords(item.artist)}
                </button>
              </h2>

              {hasReleaseInfo && (
                  <div className="mt-6 pt-6 border-t border-zinc-200">
                      <h3 className="text-lg font-bold text-zinc-800">Release Info</h3>
                      <div className="mt-2 text-zinc-600 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                        {item.year && (
                          <p>
                            <span className="font-bold text-zinc-800">Year:</span>{' '}
                            <button
                                onClick={handleYearClick}
                                className="hover:text-zinc-900 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-800 rounded-sm p-1 -m-1"
                                aria-label={`View all albums from ${item.year}`}
                            >
                                {item.year}
                            </button>
                          </p>
                        )}
                        {item.genre && (
                           <p>
                             <span className="font-bold text-zinc-800">Genre:</span>{' '}
                             <button
                                onClick={handleGenreClick}
                                className="hover:text-zinc-900 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-800 rounded-sm p-1 -m-1"
                                aria-label={`View all ${item.genre} albums`}
                             >
                                 {item.genre}
                             </button>
                           </p>
                        )}
                        {item.recordLabel && (
                           <p>
                             <span className="font-bold text-zinc-800">Label:</span>{' '}
                             <button
                                onClick={handleRecordLabelClick}
                                className="hover:text-zinc-900 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-800 rounded-sm p-1 -m-1"
                                aria-label={`View all albums from ${item.recordLabel}`}
                             >
                                 {item.recordLabel}
                             </button>
                           </p>
                        )}
                        {item.version && <p><span className="font-bold text-zinc-800">Version:</span> {item.version}</p>}
                      </div>
                  </div>
              )}

              {item.notes && (
                  <div className="mt-6 pt-6 border-t border-zinc-200">
                      <h3 className="text-lg font-bold text-zinc-800">Personal Notes</h3>
                      <p className="mt-2 text-zinc-600 whitespace-pre-wrap">{item.notes}</p>
                  </div>
              )}
              
              {item.tags && item.tags.length > 0 && (
                <div className="mt-6 pt-6 border-t border-zinc-200">
                    <h3 className="text-lg font-bold text-zinc-800">Tags</h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {item.tags.map(tag => (
                          <button
                            key={tag}
                            onClick={() => navigate({ pathname: '/', search: `?q=${encodeURIComponent(tag)}` })}
                            className="bg-zinc-200 text-zinc-700 text-sm font-medium px-3 py-1 rounded-full hover:bg-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-500"
                            aria-label={`View all albums tagged ${tag}`}
                          >
                            {capitalizeWords(tag)}
                          </button>
                      ))}
                    </div>
                </div>
              )}
              
              <div className="mt-6 pt-6 border-t border-zinc-200">
                <a
                  href={wikipediaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-zinc-700 hover:text-zinc-900 font-semibold py-2 px-3 rounded-lg hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-800"
                  aria-label={`View Wikipedia page for ${item.title}`}
                >
                  <GlobeIcon className="h-5 w-5" />
                  View on Wikipedia
                </a>
              </div>

              <div className="absolute top-4 right-4 flex items-center gap-2">
                 <button
                    onClick={handleRefreshData}
                    disabled={isRefreshing}
                    className="p-2 rounded-full bg-white/70 text-zinc-700 hover:bg-zinc-100 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    title="Refresh Metadata"
                    aria-label="Refresh Metadata"
                 >
                    <SparklesIcon className={`w-6 h-6 ${isRefreshing ? 'animate-pulse text-blue-500' : ''}`} />
                </button>
                <button
                  onClick={handleEdit}
                  className="p-2 rounded-full bg-white/70 text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-800"
                  aria-label={`Edit ${item.title}`}
                  >
                  <EditIcon className="w-6 h-6" />
                </button>
                <button
                  onClick={handleRequestDelete}
                  className="p-2 rounded-full bg-white/70 text-red-500 hover:bg-red-50 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                  aria-label={`Delete ${item.title}`}
                  >
                  <TrashIcon className="w-6 h-6" />
                </button>
              </div>
            </div>
        </div>
        <div className="border-t border-zinc-200 bg-zinc-50 p-4 flex justify-between items-center">
          {previousItem ? (
            <Link
              to={`/item/${previousItem.id}`}
              className="inline-flex items-center gap-2 text-zinc-700 hover:text-zinc-900 font-semibold py-2 px-3 rounded-lg hover:bg-zinc-200"
            >
              <ArrowLeftIcon className="h-5 w-5" />
              <span>Previous</span>
            </Link>
          ) : (
            <span className="inline-flex items-center gap-2 text-zinc-400 cursor-not-allowed py-2 px-3">
              <ArrowLeftIcon className="h-5 w-5" />
              <span>Previous</span>
            </span>
          )}

          {nextItem ? (
            <Link
              to={`/item/${nextItem.id}`}
              className="inline-flex items-center gap-2 text-zinc-700 hover:text-zinc-900 font-semibold py-2 px-3 rounded-lg hover:bg-zinc-200"
            >
              <span>Next</span>
              <ArrowRightIcon className="h-5 w-5" />
            </Link>
          ) : (
            <span className="inline-flex items-center gap-2 text-zinc-400 cursor-not-allowed py-2 px-3">
              <span>Next</span>
              <ArrowRightIcon className="h-5 w-5" />
            </span>
          )}
        </div>
      </div>

      {recommendations.length > 0 && (
        <div className="mt-8">
          <h3 className="text-2xl font-bold text-zinc-800 mb-4">You Might Also Like</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-6">
            {recommendations.map(recItem => (
              <RecommendedItemCard key={recItem.id} item={recItem} />
            ))}
          </div>
        </div>
      )}
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        item={item}
      />
    </div>
  );
};

export default DetailView;
