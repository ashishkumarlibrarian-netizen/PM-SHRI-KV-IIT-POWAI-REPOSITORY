import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, X, Save, Loader2, Upload, Image as ImageIcon, Check } from "lucide-react";
import { uploadFile } from "../lib/upload";

export default function ReaderClubManager() {
  const [folders, setFolders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [editingFolder, setEditingFolder] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'photos'>('info');
  
  const [photos, setPhotos] = useState<any[]>([]);
  
  const fetchFolders = async () => {
    try {
      const res = await fetch('/api/admin/readers-club/folders');
      if (res.ok) {
        const data = await res.json();
        setFolders(data.folders || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFolders();
  }, []);

  const handleEdit = (f: any) => {
    setEditingFolder({...f});
    setActiveTab('info');
    fetchPhotos(f.id);
  };
  
  const fetchPhotos = async (folderId: string) => {
    try {
      const res = await fetch(`/api/admin/readers-club/folders/${folderId}/photos`);
      if (res.ok) {
        const data = await res.json();
        setPhotos(data.photos || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveInfo = async () => {
    if (!editingFolder) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/readers-club/folders/${editingFolder.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingFolder)
      });
      if (res.ok) {
        fetchFolders();
        setEditingFolder(null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>, field: 'logo' | 'cover_image' | 'banner_image') => {
    if (!e.target.files || e.target.files.length === 0 || !editingFolder) return;
    const file = e.target.files[0];
    const ext = file.name.split('.').pop() || 'png';
    const fileName = `${editingFolder.id}/${field}.${ext}`;
    try {
      const url = await uploadFile(file, `reader-clubs`, fileName);
      setEditingFolder({ ...editingFolder, [field]: url });
    } catch (err) {
      console.error(err);
    }
  };
  
  const handleAddPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !editingFolder) return;
    const file = e.target.files[0];
    const ext = file.name.split('.').pop() || 'png';
    const uuid = Math.random().toString(36).substring(7);
    const fileName = `${editingFolder.id}/gallery/image_${uuid}.${ext}`;
    try {
      const url = await uploadFile(file, `reader-clubs`, fileName);
      const newPhoto = { folder_id: editingFolder.id, url, display_order: photos.length };
      const res = await fetch(`/api/admin/readers-club/folders/${editingFolder.id}/photos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPhoto)
      });
      if (res.ok) {
        fetchPhotos(editingFolder.id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (!editingFolder) return;
    try {
      const res = await fetch(`/api/admin/readers-club/folders/${editingFolder.id}/photos/${photoId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchPhotos(editingFolder.id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    if (!confirm('Are you sure you want to delete this folder and all its contents?')) return;
    try {
      const res = await fetch(`/api/admin/readers-club/folders/${folderId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchFolders();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData("photoIndex", index.toString());
  };

  const handleDrop = async (e: React.DragEvent, index: number) => {
    const fromIndex = parseInt(e.dataTransfer.getData("photoIndex"));
    if (fromIndex === index) return;
    
    const newPhotos = [...photos];
    const [moved] = newPhotos.splice(fromIndex, 1);
    newPhotos.splice(index, 0, moved);
    
    // Update display order in array
    const updatedPhotos = newPhotos.map((p, idx) => ({ ...p, display_order: idx }));
    // Do not set local state immediately to rely on db order
    
    // Send to backend
    try {
      const res = await fetch(`/api/admin/readers-club/folders/${editingFolder.id}/photos/reorder`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photos: updatedPhotos })
      });
      if (res.ok) {
        await fetchPhotos(editingFolder.id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleFolderDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData("folderIndex", index.toString());
  };

  const handleFolderDrop = async (e: React.DragEvent, index: number) => {
    const fromIndex = parseInt(e.dataTransfer.getData("folderIndex"));
    if (isNaN(fromIndex) || fromIndex === index) return;
    
    const newFolders = [...folders];
    const [moved] = newFolders.splice(fromIndex, 1);
    newFolders.splice(index, 0, moved);
    
    // Update display order in array
    const updatedFolders = newFolders.map((f, idx) => ({ ...f, display_order: idx }));
    // Do not set local state to avoid conflicts if DB is not updated properly
    
    // Send to backend
    try {
      const res = await fetch(`/api/admin/readers-club/folders/reorder`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folders: updatedFolders })
      });
      if (res.ok) {
        await fetchFolders(); // Re-fetch using ordered query
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {folders.map((folder, idx) => (
          <div 
            key={folder.id} 
            draggable
            onDragStart={(e) => handleFolderDragStart(e, idx)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleFolderDrop(e, idx)}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col items-center text-center gap-3 relative group cursor-move"
          >
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => handleEdit(folder)} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors" title="Edit Club">
                <Edit2 className="w-4 h-4" />
              </button>
              <button onClick={() => handleDeleteFolder(folder.id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors" title="Delete Club">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            {folder.logo ? (
              <img src={folder.logo} alt="" className="w-16 h-16 object-cover rounded-xl border border-slate-100" />
            ) : (
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center">
                <ImageIcon className="w-8 h-8 text-slate-400" />
              </div>
            )}
            <div>
              <h4 className="font-bold text-slate-800 dark:text-white">{folder.name}</h4>
              <span className={`text-xs px-2 py-1 rounded-full ${folder.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                {folder.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {editingFolder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">Edit Reader Club</h3>
              <button onClick={() => setEditingFolder(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            
            <div className="flex border-b border-slate-100 dark:border-slate-800">
              <button 
                onClick={() => setActiveTab('info')}
                className={`flex-1 py-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'info' ? 'border-amber-500 text-amber-600 dark:text-amber-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                Basic Info
              </button>
              <button 
                onClick={() => setActiveTab('photos')}
                className={`flex-1 py-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'photos' ? 'border-amber-500 text-amber-600 dark:text-amber-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                Manage Photos
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50 dark:bg-slate-900/50">
              {activeTab === 'info' ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Club Name</label>
                      <input value={editingFolder.name || ''} onChange={e => setEditingFolder({...editingFolder, name: e.target.value})} className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-amber-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Status</label>
                      <select value={editingFolder.is_active ? 'true' : 'false'} onChange={e => setEditingFolder({...editingFolder, is_active: e.target.value === 'true'})} className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-amber-500">
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Description</label>
                    <textarea value={editingFolder.description || ''} onChange={e => setEditingFolder({...editingFolder, description: e.target.value})} rows={3} className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-amber-500" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-2">Club Logo</label>
                      <div className="flex flex-col items-center gap-3 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                        {editingFolder.logo ? (
                          <img src={editingFolder.logo} alt="Logo" className="w-20 h-20 object-cover rounded-xl" />
                        ) : (
                          <div className="w-20 h-20 bg-slate-100 dark:bg-slate-900 rounded-xl flex items-center justify-center"><ImageIcon className="w-6 h-6 text-slate-400" /></div>
                        )}
                        <label className="cursor-pointer text-xs font-semibold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg hover:bg-amber-100 transition-colors">
                          Upload Logo
                          <input type="file" className="hidden" accept="image/*" onChange={(e) => handleUploadImage(e, 'logo')} />
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-2">Cover Photo</label>
                      <div className="flex flex-col items-center gap-3 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                        {editingFolder.cover_image ? (
                          <img src={editingFolder.cover_image} alt="Cover" className="w-full h-20 object-cover rounded-xl" />
                        ) : (
                          <div className="w-full h-20 bg-slate-100 dark:bg-slate-900 rounded-xl flex items-center justify-center"><ImageIcon className="w-6 h-6 text-slate-400" /></div>
                        )}
                        <label className="cursor-pointer text-xs font-semibold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg hover:bg-amber-100 transition-colors">
                          Upload Cover
                          <input type="file" className="hidden" accept="image/*" onChange={(e) => handleUploadImage(e, 'cover_image')} />
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-2">Banner Image</label>
                      <div className="flex flex-col items-center gap-3 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                        {editingFolder.banner_image ? (
                          <img src={editingFolder.banner_image} alt="Banner" className="w-full h-20 object-cover rounded-xl" />
                        ) : (
                          <div className="w-full h-20 bg-slate-100 dark:bg-slate-900 rounded-xl flex items-center justify-center"><ImageIcon className="w-6 h-6 text-slate-400" /></div>
                        )}
                        <label className="cursor-pointer text-xs font-semibold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg hover:bg-amber-100 transition-colors">
                          Upload Banner
                          <input type="file" className="hidden" accept="image/*" onChange={(e) => handleUploadImage(e, 'banner_image')} />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div>
                      <h4 className="font-semibold text-slate-800 dark:text-white">Gallery Photos</h4>
                      <p className="text-xs text-slate-500">Upload and manage photos for this club.</p>
                    </div>
                    <label className="cursor-pointer px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-lg shadow transition-colors flex items-center gap-2">
                      <Upload className="w-4 h-4" /> Add Photo
                      <input type="file" className="hidden" accept="image/*" onChange={handleAddPhoto} />
                    </label>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {photos.map((photo, idx) => (
                      <div 
                        key={photo.id} 
                        draggable
                        onDragStart={(e) => handleDragStart(e, idx)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => handleDrop(e, idx)}
                        className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 aspect-square cursor-move"
                      >
                        <img src={photo.url} alt="" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button onClick={() => handleDeletePhoto(photo.id)} className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {photos.length === 0 && (
                      <div className="col-span-full py-12 text-center text-slate-500 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                        No photos added yet.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-end gap-3">
              <button onClick={() => setEditingFolder(null)} className="px-5 py-2.5 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                Cancel
              </button>
              {activeTab === 'info' && (
                <button onClick={handleSaveInfo} disabled={isSaving} className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl shadow-md transition-colors flex items-center gap-2">
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Changes
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
