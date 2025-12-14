import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CollectionItem, WantlistItem } from '../types';
import { areStringsSimilar, capitalizeWords } from '../utils';
import { ArrowLeftIcon } from '../components/icons/ArrowLeftIcon';
import CollectionItemCard from '../components/CDItem';
import MissingAlbumScanner from '../components/MissingAlbumScanner';

interface ArtistDetailViewProps {
  collection: CollectionItem[];
  wantlist: WantlistItem[];
  onAddToWantlist: (item: Omit<WantlistItem, 'id' | 'created_at'>) => Promise<void>;
}

const ArtistDetailView: React.FC<ArtistDetailViewProps> = ({ collection, wantlist, onAddToWantlist }) => {
    const { artistName: encodedArtistName } = useParams<{ artistName: string }>();
    const artistName = decodeURIComponent(encodedArtistName || '');

    const userAlbumsByArtist = useMemo(() => {
        return collection
            .filter(item => areStringsSimilar(item.artist, artistName))
            .sort((a, b) => (a.year || 0) - (b.year || 0));
    }, [collection, artistName]);

    return (
        <div className="max-w-4xl mx-auto">
             <div className="mb-6 flex justify-between items-center">
                <h1 className="text-3xl font-bold text-zinc-800">{capitalizeWords(artistName)}</h1>
                <Link
                    to="/artists"
                    className="inline-flex items-center gap-2 text-zinc-600 hover:text-zinc-900 font-medium"
                >
                    <ArrowLeftIcon className="h-5 w-5" />
                    Back to All Artists
                </Link>
            </div>

            <div className="bg-white rounded-lg border border-zinc-200 p-6">
                 <h2 className="text-xl font-bold text-zinc-800 mb-4">
                    Albums in Your Collection ({userAlbumsByArtist.length})
                </h2>
                {userAlbumsByArtist.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                        {userAlbumsByArtist.map(item => (
                            <CollectionItemCard key={item.id} item={item} />
                        ))}
                    </div>
                ) : (
                    <p className="text-zinc-500">You don't have any albums by this artist yet.</p>
                )}
            </div>

            <div className="mt-8">
                 <MissingAlbumScanner 
                    artistName={artistName}
                    userAlbumsByArtist={userAlbumsByArtist}
                    wantlist={wantlist}
                    onAddToWantlist={onAddToWantlist}
                />
            </div>

        </div>
    );
};

export default ArtistDetailView;