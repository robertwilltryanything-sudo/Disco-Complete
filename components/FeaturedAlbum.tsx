import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CollectionItem } from '../types';
import { getAlbumTrivia } from '../gemini';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { MusicNoteIcon } from './icons/MusicNoteIcon';
import { capitalizeWords } from '../utils';

interface FeaturedAlbumProps {
  item: CollectionItem;
}

const FeaturedAlbum: React.FC<FeaturedAlbumProps> = ({ item }) => {
    const [trivia, setTrivia] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTrivia = async () => {
            if (!item) return;
            setIsLoading(true);
            setError(null);
            setTrivia('');

            const cacheKey = `trivia-cache-${item.id}`;

            try {
                const cachedTrivia = localStorage.getItem(cacheKey);
                if (cachedTrivia) {
                    setTrivia(cachedTrivia);
                    setIsLoading(false);
                    return;
                }

                const result = await getAlbumTrivia(item.artist, item.title);
                const triviaText = result || "No trivia found for this album.";
                setTrivia(triviaText);
                
                localStorage.setItem(cacheKey, triviaText);

            } catch (err) {
                console.error("Failed to fetch trivia", err);
                const errorMessage = (err as any)?.toString() ?? '';
                if (errorMessage.includes('429') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
                    setError("Trivia is unavailable due to high demand. Please check back later.");
                } else {
                    setError("Could not load trivia at this time.");
                }
            } finally {
                setIsLoading(false);
            }
        };
        fetchTrivia();
    }, [item]);

    const handleArtistClick = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        navigate({
            pathname: '/',
            search: `?q=${encodeURIComponent(item.artist)}`
        });
    }, [item.artist, navigate]);

    return (
        <Link
          to={`/item/${item.id}`}
          className="block group bg-white rounded-lg border border-zinc-200 hover:border-zinc-300 flex flex-col md:flex-row md:h-80 overflow-hidden"
          aria-label={`View details for featured album: ${item.title} by ${item.artist}`}
        >
            <div className="relative w-full md:w-[30rem] h-80 md:h-auto flex-shrink-0 bg-zinc-100 flex items-center justify-center md:justify-start md:pl-1 overflow-hidden">
                <div className="relative flex items-center justify-center flex-shrink-0">
                    {/* Disc Graphic */}
                    <div 
                        className={`absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 ${
                            item.mediaType === 'vinyl' ? 'w-60 h-60 ml-[6.5rem]' : 'w-56 h-56 ml-24'
                        }`}
                        style={{ zIndex: 0 }}
                        aria-hidden="true"
                    >
                        {item.mediaType === 'vinyl' ? (
                            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
                                <defs>
                                    <radialGradient id="vinyl-sheen" cx="50%" cy="50%" r="50%">
                                        <stop offset="60%" stopColor="#1C1C1C"/>
                                        <stop offset="100%" stopColor="#333333"/>
                                    </radialGradient>
                                </defs>
                                <circle cx="50" cy="50" r="50" fill="url(#vinyl-sheen)" />
                                <circle cx="50" cy="50" r="48" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5"/>
                                <circle cx="50" cy="50" r="30" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5"/>
                                <circle cx="50" cy="50" r="18" fill="#b94e3a"/>
                                <circle cx="50" cy="50" r="2" fill="#1C1C1C"/>
                            </svg>
                        ) : (
                           <div className="w-full h-full rounded-full relative shadow-sm bg-zinc-300 border border-zinc-400">
                                {/* Inner Ring */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[35%] h-[35%] rounded-full border border-zinc-400/30" />

                                {/* Center Hole */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[15%] h-[15%] bg-zinc-100 rounded-full border border-zinc-200" />
                           </div>
                        )}
                    </div>
                    {/* Album Art */}
                    <div className="relative w-64 h-64 flex-shrink-0 shadow-xl z-10 bg-white rounded-md">
                        {item.coverArtUrl ? (
                            <img src={item.coverArtUrl} alt={`${item.title} cover`} className="w-full h-full object-cover rounded-md" />
                        ) : (
                            <div className="w-full h-full bg-zinc-200 flex items-center justify-center rounded-md">
                                <MusicNoteIcon className="w-24 h-24 text-zinc-400" />
                            </div>
                        )}
                        {/* Spine highlight/shadow for depth */}
                        <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-r from-black/20 to-transparent pointer-events-none rounded-l-md"></div>
                    </div>
                </div>
            </div>
            
            <div className="p-4 md:p-6 flex flex-col justify-start flex-grow overflow-hidden">
                <p className="text-sm font-bold uppercase tracking-wider text-zinc-500 mb-2">Featured Album</p>
                <h3 className="text-2xl font-bold text-zinc-900">{item.title}</h3>
                <button
                    onClick={handleArtistClick}
                    className="text-left text-lg text-zinc-600 hover:text-zinc-900 hover:underline focus:outline-none focus-visible:ring-1 focus-visible:ring-zinc-500 rounded-sm"
                    title={item.artist}
                >
                    {capitalizeWords(item.artist)}
                </button>
                <div className="mt-4 pt-4 border-t border-zinc-200 flex-1 overflow-y-auto">
                     {isLoading ? (
                        <div className="flex items-center text-zinc-500">
                            <SpinnerIcon className="w-4 h-4 mr-2" />
                            <span>Loading trivia...</span>
                        </div>
                    ) : error ? (
                        <p className="text-red-600 text-sm">{error}</p>
                    ) : (
                        <p className="text-zinc-700 italic text-sm">"{trivia}"</p>
                    )}
                </div>
            </div>
        </Link>
    );
};

export default React.memo(FeaturedAlbum);