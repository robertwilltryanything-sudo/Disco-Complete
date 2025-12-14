
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { CollectionItem, CollectionData, SyncProvider, SyncStatus, SyncMode, WantlistItem, MediaType } from './types';
import Header from './components/Header';
import ListView from './views/ListView';
import DetailView from './views/DetailView';
import ArtistsView from './views/ArtistsView';
import DashboardView from './views/DashboardView';
import { getAlbumDetails } from './gemini';
import { useSupabaseSync } from './hooks/useSupabaseSync';
import AddItemForm from './components/AddCDForm';
import { XIcon } from './components/icons/XIcon';
import ConfirmDuplicateModal from './components/ConfirmDuplicateModal';
// FIX: Removed getBestCD as it is not exported from utils.
import { areStringsSimilar } from './utils';
import { useDebounce } from './hooks/useDebounce';
import ImportConfirmModal from './components/ImportConfirmModal';
import { XCircleIcon } from './components/icons/XCircleIcon';
import BottomNavBar from './components/BottomNavBar';
import SyncSettingsModal from './components/SyncSettingsModal';
import SupabaseNotConfigured from './components/SupabaseNotConfigured';
import SupabaseAuth from './components/SupabaseAuth';
import DuplicatesView from './views/DuplicatesView';
import WantlistView from './views/WantlistView';
import { PlusIcon } from './components/icons/PlusIcon';
import AddWantlistItemForm from './components/AddWantlistItemForm';
import WantlistDetailView from './views/WantlistDetailView';
import ArtistDetailView from './views/ArtistDetailView';
import { useSimpleSync } from './hooks/useSimpleSync';
import { useGoogleDrive } from './hooks/useGoogleDrive';
import SyncConflictModal from './components/SyncConflictModal';
import ScrollToTop from './components/ScrollToTop';

const INITIAL_CDS: CollectionItem[] = [
  {
    id: '1',
    mediaType: 'cd',
    artist: 'Pink Floyd',
    title: 'The Dark Side of the Moon',
    genre: 'Progressive Rock',
    year: 1973,
    coverArtUrl: 'https://upload.wikimedia.org/wikipedia/en/3/3b/Dark_Side_of_the_Moon.png',
    notes: 'Classic.',
    created_at: new Date(Date.now() - 10000).toISOString(),
    tracklist: [
      { number: 1, title: 'Speak to Me', duration: '1:30' },
      { number: 2, title: 'Breathe', duration: '2:43' },
      { number: 3, title: 'On the Run', duration: '3:36' },
      { number: 4, title: 'Time', duration: '7:01' },
      { number: 5, title: 'The Great Gig in the Sky', duration: '4:36' },
      { number: 6, title: 'Money', duration: '6:22' },
      { number: 7, title: 'Us and Them', duration: '7:46' },
      { number: 8, title: 'Any Colour You Like', duration: '3:25' },
      { number: 9, title: 'Brain Damage', duration: '3:48' },
      { number: 10, title: 'Eclipse', duration: '2:03' }
    ]
  },
  {
    id: '4',
    mediaType: 'cd',
    artist: 'Steely Dan',
    title: 'Aja',
    genre: 'Jazz Rock',
    year: 1977,
    coverArtUrl: 'https://upload.wikimedia.org/wikipedia/en/4/49/Aja_album_cover.jpg',
    created_at: new Date(Date.now() - 40000).toISOString()
  }
];

const INITIAL_VINYLS: CollectionItem[] = [
    {
        id: 'v1',
        mediaType: 'vinyl',
        artist: 'Fleetwood Mac',
        title: 'Rumours',
        genre: 'Rock',
        year: 1977,
        coverArtUrl: 'https://e-cdn-images.dzcdn.net/images/cover/f9478f7707c307223b55c3c0429f518e/500x500-000000-80-0-0.jpg',
        notes: 'A timeless classic on vinyl.',
        created_at: new Date().toISOString(),
    },
    {
        id: 'v2',
        mediaType: 'vinyl',
        artist: 'Supertramp',
        title: 'Even in the Quietest Moments...',
        genre: 'Progressive Rock',
        year: 1977,
        coverArtUrl: 'https://upload.wikimedia.org/wikipedia/en/4/43/Supertramp_-_Even_in_the_Quietest_Moments.jpg',
        notes: 'Iconic album with a unique cover.',
        created_at: new Date(Date.now() - 5000).toISOString(),
    }
];

const AppContent: React.FC = () => {
  const [mediaType, setMediaType] = useState<MediaType>('cd');
  const [collection, setCollection] = useState<CollectionItem[]>([]);
  
  const [wantlist, setWantlist] = useState<WantlistItem[]>(() => {
      const saved = localStorage.getItem('disco_wantlist');
      return saved ? JSON.parse(saved) : [];
  });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<CollectionItem | null>(null);
  const [prefillData, setPrefillData] = useState<Partial<CollectionItem> | null>(null);
  
  const [isAddWantlistModalOpen, setIsAddWantlistModalOpen] = useState(false);
  const [wantlistItemToEdit, setWantlistItemToEdit] = useState<WantlistItem | null>(null);
  
  const [duplicateCheckResult, setDuplicateCheckResult] = useState<{ newItem: Omit<CollectionItem, 'id'>, existingItem: CollectionItem } | null>(null);
  const [pendingImport, setPendingImport] = useState<CollectionItem[] | null>(null);
  
  const [isSyncSettingsOpen, setIsSyncSettingsOpen] = useState(false);
  const [syncProvider, setSyncProvider] = useState<SyncProvider>(() => {
      return (localStorage.getItem('disco_sync_provider') as SyncProvider) || 'none';
  });
  const [syncMode, setSyncMode] = useState<SyncMode>(() => {
       return (localStorage.getItem('disco_sync_mode') as SyncMode) || 'manual';
  });

  const [conflictData, setConflictData] = useState<{ local: CollectionData, cloud: CollectionData } | null>(null);

  // Load collection based on media type
  useEffect(() => {
    const saved = localStorage.getItem(`disco_collection_${mediaType}`);
    const initialData = mediaType === 'cd' ? INITIAL_CDS : INITIAL_VINYLS;
    setCollection(saved ? JSON.parse(saved) : initialData);
  }, [mediaType]);


  // Sync Hooks
  const supabaseSync = useSupabaseSync(setCollection, setWantlist, syncMode, syncProvider);
  const simpleSync = useSimpleSync();
  const googleDriveSync = useGoogleDrive();

  // Persist local changes
  useEffect(() => {
    if (syncProvider === 'none' || (syncProvider === 'supabase' && syncMode === 'manual')) {
        localStorage.setItem(`disco_collection_${mediaType}`, JSON.stringify(collection));
        localStorage.setItem('disco_wantlist', JSON.stringify(wantlist));
    }
  }, [collection, wantlist, syncProvider, syncMode, mediaType]);
  
  useEffect(() => {
      localStorage.setItem('disco_sync_provider', syncProvider);
  }, [syncProvider]);
  
  useEffect(() => {
      localStorage.setItem('disco_sync_mode', syncMode);
  }, [syncMode]);

  // Derived Sync Status
  let currentSyncStatus: SyncStatus = 'idle';
  let currentSyncError: string | null = null;
  
  if (syncProvider === 'supabase') {
      currentSyncStatus = supabaseSync.syncStatus;
      currentSyncError = supabaseSync.error;
  } else if (syncProvider === 'google_drive') { // Placeholder if implemented
       currentSyncStatus = googleDriveSync.syncStatus;
       currentSyncError = googleDriveSync.error;
  }

  const handleManualSync = useCallback(async () => {
    if (syncProvider === 'supabase') {
        await supabaseSync.manualSync();
    }
    // Add other providers here
  }, [syncProvider, supabaseSync]);


  const handleImport = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const content = event.target?.result as string;
            const importedData = JSON.parse(content);
            if (Array.isArray(importedData)) {
               setPendingImport(importedData);
            } else if (importedData.collection && Array.isArray(importedData.collection)) {
               setPendingImport(importedData.collection);
            } else {
              alert("Invalid file format.");
            }
          } catch (error) {
            console.error("Import failed:", error);
            alert("Failed to parse the file.");
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }, []);

  const confirmImport = useCallback((strategy: 'merge' | 'replace') => {
      if (!pendingImport) return;
      
      if (strategy === 'replace') {
          setCollection(pendingImport);
      } else {
          // Merge logic: avoid exact ID duplicates, but allow similar content (user can dedup later)
          const existingIds = new Set(collection.map(c => c.id));
          const newItems = pendingImport.filter(c => !existingIds.has(c.id));
          setCollection([...collection, ...newItems]);
      }
      setPendingImport(null);
  }, [pendingImport, collection]);

  const handleExport = useCallback(() => {
    const dataStr = JSON.stringify({ collection: collection, lastUpdated: new Date().toISOString() }, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `disco_backup_${mediaType}_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [collection, mediaType]);


  const fetchAndApplyAlbumDetails = async (item: CollectionItem) => {
    if (!item.genre || !item.year || !item.tracklist) {
        try {
            const details = await getAlbumDetails(item.artist, item.title);
            if (details) {
                const updatedItem: CollectionItem = {
                    ...item,
                    genre: item.genre || details.genre,
                    year: item.year || details.year,
                    recordLabel: item.recordLabel || details.recordLabel,
                    tags: [...new Set([...(item.tags || []), ...(details.tags || [])])],
                    tracklist: item.tracklist || details.tracklist,
                };
                
                if (syncProvider === 'supabase') {
                    await supabaseSync.updateItem(updatedItem);
                } else {
                     setCollection(prev => prev.map(c => c.id === item.id ? updatedItem : c));
                }
            }
        } catch (e) {
            console.error("Background fetch for details failed", e);
        }
    }
  };

  const handleSaveItem = useCallback(async (itemData: Omit<CollectionItem, 'id'> & { id?: string }) => {
    // Check for duplicates if adding new
    if (!itemData.id && !duplicateCheckResult) {
        const potentialDuplicate = collection.find(c => 
            areStringsSimilar(c.artist, itemData.artist) && 
            areStringsSimilar(c.title, itemData.title)
        );
        
        if (potentialDuplicate) {
            setDuplicateCheckResult({ newItem: itemData, existingItem: potentialDuplicate });
            return;
        }
    }

    let savedItem: CollectionItem | null = null;
    const itemWithMeta = { ...itemData, mediaType };

    if (itemData.id) {
      // Edit existing
      const updatedItem: CollectionItem = { 
          ...itemWithMeta, 
          id: itemData.id, 
          created_at: itemData.created_at || new Date().toISOString(),
          user_id: (syncProvider === 'supabase' && supabaseSync.user) ? supabaseSync.user.id : undefined
      };
      
      if (syncProvider === 'supabase') {
          await supabaseSync.updateItem(updatedItem);
          savedItem = updatedItem;
      } else {
          setCollection(prev => prev.map(item => item.id === itemData.id ? updatedItem : item));
          savedItem = updatedItem;
      }
    } else {
      // Add new
      const newItemBase = {
          ...itemWithMeta,
          created_at: new Date().toISOString(),
      };
      
      if (syncProvider === 'supabase') {
         savedItem = await supabaseSync.addItem(newItemBase);
      } else {
         const newItem: CollectionItem = { ...newItemBase, id: crypto.randomUUID() };
         setCollection(prev => [newItem, ...prev]);
         savedItem = newItem;
      }
    }
    
    if (savedItem) {
        // Trigger background fetch for details (tracklist, etc) if missing
        fetchAndApplyAlbumDetails(savedItem);
    }

    setIsAddModalOpen(false);
    setItemToEdit(null);
    setPrefillData(null);
    setDuplicateCheckResult(null);
  }, [collection, syncProvider, supabaseSync, duplicateCheckResult, mediaType]);

  const handleDeleteItem = useCallback((id: string) => {
    if (syncProvider === 'supabase') {
        supabaseSync.deleteItem(id);
    } else {
        setCollection(prev => prev.filter(item => item.id !== id));
    }
  }, [syncProvider, supabaseSync]);
  
  // Wrapper for update to be passed to DetailView
  const handleUpdateItem = useCallback(async (item: CollectionItem) => {
      await handleSaveItem(item);
  }, [handleSaveItem]);

  // Wantlist Handlers
  const handleSaveWantlistItem = useCallback(async (itemData: Omit<WantlistItem, 'id'> & { id?: string }) => {
      const itemWithMeta = { ...itemData, mediaType };
      if (itemData.id) {
          // Update
           const updatedItem: WantlistItem = {
              ...itemWithMeta,
              id: itemData.id,
              created_at: itemData.created_at || new Date().toISOString(),
              user_id: (syncProvider === 'supabase' && supabaseSync.user) ? supabaseSync.user.id : undefined
          };
          if (syncProvider === 'supabase') {
              await supabaseSync.updateWantlistItem(updatedItem);
          } else {
              setWantlist(prev => prev.map(item => item.id === itemData.id ? updatedItem : item));
          }
      } else {
          // Add
          const newItemBase = { ...itemWithMeta, created_at: new Date().toISOString() };
           if (syncProvider === 'supabase') {
              await supabaseSync.addWantlistItem(newItemBase);
          } else {
              const newItem: WantlistItem = { ...newItemBase, id: crypto.randomUUID() };
              setWantlist(prev => [newItem, ...prev]);
          }
      }
      setIsAddWantlistModalOpen(false);
      setWantlistItemToEdit(null);
  }, [syncProvider, supabaseSync, mediaType]);

  const handleDeleteWantlistItem = useCallback((id: string) => {
       if (syncProvider === 'supabase') {
        supabaseSync.deleteWantlistItem(id);
    } else {
        setWantlist(prev => prev.filter(item => item.id !== id));
    }
  }, [syncProvider, supabaseSync]);

  const handleMoveToCollection = useCallback(async (item: WantlistItem) => {
      // 1. Add to collection
      const itemData: Omit<CollectionItem, 'id'> = {
          artist: item.artist,
          title: item.title,
          mediaType: item.mediaType,
          genre: item.genre,
          year: item.year,
          coverArtUrl: item.coverArtUrl,
          notes: item.notes,
          version: item.version,
          recordLabel: item.recordLabel,
          tags: item.tags,
          tracklist: item.tracklist,
      };
      await handleSaveItem(itemData);

      // 2. Delete from wantlist
      handleDeleteWantlistItem(item.id);
  }, [handleSaveItem, handleDeleteWantlistItem]);

  const location = useLocation();
  const isOnWantlistPage = location.pathname.startsWith('/wantlist');
  
  return (
    <div className="bg-zinc-100 min-h-screen font-sans pb-16 md:pb-0">
      <Header
        onAddClick={() => isOnWantlistPage ? setIsAddWantlistModalOpen(true) : setIsAddModalOpen(true)}
        collectionCount={collection.length}
        onImport={handleImport}
        onExport={handleExport}
        onOpenSyncSettings={() => setIsSyncSettingsOpen(true)}
        syncStatus={currentSyncStatus}
        syncError={currentSyncError}
        syncProvider={syncProvider}
        syncMode={syncMode}
        onManualSync={handleManualSync}
        user={supabaseSync.user}
        onSignOut={supabaseSync.signOut}
        isOnWantlistPage={isOnWantlistPage}
        mediaType={mediaType}
        setMediaType={setMediaType}
      />

      <main className="container mx-auto p-4 md:p-6">
        {syncProvider === 'supabase' && !supabaseSync.isConfigured && <SupabaseNotConfigured onOpenSyncSettings={() => setIsSyncSettingsOpen(true)} />}
        {syncProvider === 'supabase' && supabaseSync.isConfigured && !supabaseSync.session && <SupabaseAuth user={supabaseSync.user} signIn={supabaseSync.signIn} syncStatus={supabaseSync.syncStatus} error={supabaseSync.error} onOpenSyncSettings={() => setIsSyncSettingsOpen(true)} />}
        
        <Routes>
          <Route path="/" element={<ListView collection={collection} wantlist={wantlist} mediaType={mediaType} onAddToWantlist={async (item) => handleSaveWantlistItem({ ...item, mediaType })} onRequestAdd={(artist) => { setPrefillData(artist ? { artist } : null); setIsAddModalOpen(true); }} onRequestEdit={(item) => { setItemToEdit(item); setIsAddModalOpen(true); }} />} />
          <Route path="/item/:id" element={<DetailView collection={collection} onDeleteItem={handleDeleteItem} onUpdateItem={handleUpdateItem} />} />
          <Route path="/artists" element={<ArtistsView collection={collection} />} />
          <Route path="/artist/:artistName" element={<ArtistDetailView collection={collection} wantlist={wantlist} onAddToWantlist={async (item) => handleSaveWantlistItem({ ...item, mediaType })} />} />
          <Route path="/dashboard" element={<DashboardView collection={collection} mediaType={mediaType} />} />
          <Route path="/duplicates" element={<DuplicatesView collection={collection} onDeleteItem={handleDeleteItem} mediaType={mediaType} />} />
          <Route path="/wantlist" element={<WantlistView wantlist={wantlist} onRequestEdit={(item) => { setWantlistItemToEdit(item); setIsAddWantlistModalOpen(true); }} onDelete={handleDeleteWantlistItem} onMoveToCollection={handleMoveToCollection} />} />
          <Route path="/wantlist/:id" element={<WantlistDetailView wantlist={wantlist} collection={collection} onDelete={handleDeleteWantlistItem} onMoveToCollection={handleMoveToCollection} />} />
        </Routes>
      </main>
      
      <BottomNavBar />

      {(isAddModalOpen || itemToEdit || prefillData) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-30 flex justify-center items-start p-4 overflow-y-auto">
          <div className="relative bg-white rounded-lg w-full max-w-2xl my-8">
            <button onClick={() => { setIsAddModalOpen(false); setItemToEdit(null); setPrefillData(null); }} className="absolute top-3 right-3 p-2 rounded-full text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 z-10">
              <XIcon className="w-6 h-6" />
            </button>
            <AddItemForm onSave={handleSaveItem} itemToEdit={itemToEdit} onCancel={() => { setIsAddModalOpen(false); setItemToEdit(null); }} prefill={prefillData} mediaType={mediaType} />
          </div>
        </div>
      )}
      
      {(isAddWantlistModalOpen || wantlistItemToEdit) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-30 flex justify-center items-start p-4 overflow-y-auto">
          <div className="relative bg-white rounded-lg w-full max-w-2xl my-8">
             <button onClick={() => { setIsAddWantlistModalOpen(false); setWantlistItemToEdit(null); }} className="absolute top-3 right-3 p-2 rounded-full text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 z-10">
              <XIcon className="w-6 h-6" />
            </button>
            <AddWantlistItemForm onSave={handleSaveWantlistItem} itemToEdit={wantlistItemToEdit} onCancel={() => { setIsAddWantlistModalOpen(false); setWantlistItemToEdit(null); }} mediaType={mediaType} />
          </div>
        </div>
      )}

      <ConfirmDuplicateModal 
        isOpen={!!duplicateCheckResult}
        onClose={() => setDuplicateCheckResult(null)}
        onConfirm={(version) => {
          if (duplicateCheckResult) {
            handleSaveItem({ ...duplicateCheckResult.newItem, version: version });
          }
        }}
        newItemData={duplicateCheckResult?.newItem!}
        existingItem={duplicateCheckResult?.existingItem!}
      />
      
      <ImportConfirmModal
        isOpen={!!pendingImport}
        onClose={() => setPendingImport(null)}
        onMerge={() => confirmImport('merge')}
        onReplace={() => confirmImport('replace')}
        importCount={pendingImport?.length || 0}
      />
      
      <SyncSettingsModal
        isOpen={isSyncSettingsOpen}
        onClose={() => setIsSyncSettingsOpen(false)}
        currentProvider={syncProvider}
        onProviderChange={setSyncProvider}
        syncMode={syncMode}
        onSyncModeChange={setSyncMode}
      />
      
      <SyncConflictModal
          isOpen={!!conflictData}
          onClose={() => setConflictData(null)}
          onResolve={(useCloud) => {
              if (conflictData) {
                  const dataToSet = useCloud ? conflictData.cloud : conflictData.local;
                  setCollection(dataToSet.collection);
              }
              setConflictData(null);
          }}
          conflictData={conflictData!}
      />
    </div>
  );
};

const App = () => {
  return (
    <HashRouter>
      <ScrollToTop />
      <AppContent />
    </HashRouter>
  );
};

export default App;
