import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import ModelViewer from './components/ModelViewer';

// Vite's base URL (will be '/peterkumar/' on GitHub Pages if configured in vite.config.js)
const baseUrl = import.meta.env.BASE_URL;

// 1. Initial Local Data - updated with baseUrl!
const INITIAL_DATA = [
  { id: '1', title: 'Arduino', author: 'Peter Kumar', likes: 120, url: `${baseUrl}arduino.glb`, sizeMB: 4.2, vertices: 15400, category: 'Electronics' },
  { id: '2', title: 'Desktop', author: 'Peter Kumar', likes: 85, url: `${baseUrl}desk.glb`, sizeMB: 12.8, vertices: 42000, category: 'Furniture' },
  { id: '3', title: 'Div Container', author: 'Peter Kumar', likes: 340, url: `${baseUrl}div.glb`, sizeMB: 1.5, vertices: 850, category: 'Abstract' },
  { id: '4', title: 'Logo', author: 'Peter Kumar', likes: 210, url: `${baseUrl}inner_logo.glb`, sizeMB: 0.8, vertices: 320, category: 'Branding' },
  { id: '5', title: 'Raspberry Pi', author: 'Peter Kumar', likes: 55, url: `${baseUrl}raspi.glb`, sizeMB: 6.4, vertices: 28900, category: 'Electronics' },
  { id: '6', title: 'Circuit Board', author: 'Peter Kumar', likes: 890, url: `${baseUrl}trans.glb`, sizeMB: 3.1, vertices: 12050, category: 'Electronics' },
];

const CATEGORIES = ['All', 'Electronics', 'Furniture', 'Abstract', 'Branding', 'Props', 'Toys', 'Food'];

// External models pool
const EXTERNAL_POOL = [
  { title: 'Avocado', author: 'Khronos Group', url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Avocado/glTF-Binary/Avocado.glb', cat: 'Food' },
  { title: 'Rubber Duck', author: 'Khronos Group', url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Duck/glTF-Binary/Duck.glb', cat: 'Toys' },
  { title: 'Damaged Helmet', author: 'Khronos Group', url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/DamagedHelmet/glTF-Binary/DamagedHelmet.glb', cat: 'Props' },
  { title: 'Antique Lantern', author: 'Khronos Group', url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Lantern/glTF-Binary/Lantern.glb', cat: 'Props' },
];

function App() {
  const [models, setModels] = useState(INITIAL_DATA);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  
  // New State: Global 3D Lighting Environment
  const [sceneEnvironment, setSceneEnvironment] = useState('city');
  
  // New State: Toast Notifications
  const [toast, setToast] = useState({ visible: false, message: '' });

  // Infinite Scroll & Upload State
  const [isFetching, setIsFetching] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [previewFileUrl, setPreviewFileUrl] = useState(null);

  // Show Toast Helper
  const showToast = (message) => {
    setToast({ visible: true, message });
    setTimeout(() => setToast({ visible: false, message: '' }), 3000);
  };

  // Interactive Feature: Like a model
  const handleLike = (id) => {
    setModels(prevModels => 
      prevModels.map(model => 
        model.id === id ? { ...model, likes: model.likes + 1 } : model
      )
    );
  };

  // Interactive Feature: Share a model
  const handleShare = (title) => {
    navigator.clipboard.writeText(window.location.href);
    showToast(`Link to ${title} copied to clipboard!`);
  };

  // Filter models
  const filteredModels = useMemo(() => {
    return models.filter((model) => {
      const matchesSearch = model.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = activeCategory === 'All' || model.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [models, searchTerm, activeCategory]);

  const totalStorageSize = useMemo(() => {
    return filteredModels.reduce((total, model) => total + model.sizeMB, 0).toFixed(2);
  }, [filteredModels]);

  // Infinite Scroll
  const loadMoreModels = useCallback(() => {
    if (isFetching || !hasMore || searchTerm !== '' || activeCategory !== 'All') return;
    setIsFetching(true);
    
    setTimeout(() => {
      const newModels = Array.from({ length: 3 }).map((_, i) => {
        const randomAsset = EXTERNAL_POOL[Math.floor(Math.random() * EXTERNAL_POOL.length)];
        return {
          id: `ext-${Date.now()}-${i}`,
          title: `${randomAsset.title} V${page}`,
          author: randomAsset.author,
          likes: Math.floor(Math.random() * 5000),
          url: randomAsset.url,
          sizeMB: parseFloat((Math.random() * 4 + 0.1).toFixed(1)),
          vertices: Math.floor(Math.random() * 15000) + 500,
          category: randomAsset.cat
        };
      });

      setModels(prev => [...prev, ...newModels]);
      setPage(prev => prev + 1);
      setIsFetching(false);
      if (page >= 10) setHasMore(false);
    }, 1000);
  }, [isFetching, hasMore, page, searchTerm, activeCategory]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting && !isFetching && hasMore) loadMoreModels(); },
      { threshold: 0.1 }
    );
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => { if (loaderRef.current) observer.disconnect(); };
  }, [loadMoreModels, isFetching, hasMore]);

  // Download logic
  const handleDownload = async (e, url, title) => {
    e.preventDefault();
    if (!url) return alert("File not found!");
    showToast(`Starting download for ${title}...`);
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${title.replace(/\s+/g, '_').toLowerCase()}.glb`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      alert("Failed to download. It might be blocked by CORS.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 font-sans text-gray-200 relative">
      
      {/* Toast Notification */}
      <div className={`fixed bottom-5 right-5 z-50 transition-all duration-300 transform ${toast.visible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}>
        <div className="bg-indigo-600 text-white px-6 py-3 rounded-lg shadow-2xl flex items-center gap-3 font-medium">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
          {toast.message}
        </div>
      </div>

      {/* Navigation */}
      <nav className="bg-gray-900 border-b border-gray-800 p-4 sticky top-0 z-20 shadow-xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-cyan-400">
            Peter 3D Hub
          </h1>
          
          <div className="w-full md:w-1/3">
            <input 
              type="text" 
              placeholder="Search models..." 
              className="w-full bg-gray-800 border border-gray-700 rounded-md px-4 py-2 text-sm focus:outline-none focus:border-indigo-500 transition"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button onClick={() => setIsUploadOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-md font-medium transition shadow-lg shadow-indigo-500/20 w-full md:w-auto">
            Upload & Preview
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        
        {/* Advanced Controls Bar */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8 bg-gray-900 p-4 rounded-xl border border-gray-800 shadow-md">
          
          {/* Categories */}
          <div className="flex gap-2 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0 hide-scrollbar scroll-smooth">
            {CATEGORIES.map(category => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
                  activeCategory === category 
                  ? 'bg-indigo-600 text-white font-medium shadow-md shadow-indigo-900/50' 
                  : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Settings & Stats */}
          <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto justify-between lg:justify-end">
            <div className="text-sm text-gray-400 hidden sm:block">
              Size: <span className="text-indigo-400 font-mono">{totalStorageSize} MB</span>
            </div>
            
            {/* Lighting Environment Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 font-medium">Lighting:</span>
              <select 
                className="bg-gray-800 border border-gray-700 text-sm rounded-md px-3 py-1.5 focus:outline-none focus:border-indigo-500 text-white cursor-pointer"
                value={sceneEnvironment}
                onChange={(e) => setSceneEnvironment(e.target.value)}
              >
                <option value="city">City (Default)</option>
                <option value="studio">Studio</option>
                <option value="sunset">Sunset</option>
                <option value="forest">Forest</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Grid Layout */}
        {filteredModels.length === 0 ? (
          <div className="text-center py-20 text-gray-500">No models found. Try clearing filters.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredModels.map((model) => (
              <div key={model.id} className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800 hover:border-indigo-500 transition-all duration-300 shadow-lg flex flex-col group relative">
                
                {/* 3D Canvas */}
                <div className="h-64 bg-gray-800 relative z-0">
                  <ModelViewer modelUrl={model.url} environment={sceneEnvironment} />
                  
                  <div className="absolute top-3 left-3 flex gap-2 pointer-events-none">
                    <span className="bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[10px] font-mono text-cyan-300 border border-cyan-900/50">
                      {model.vertices ? model.vertices.toLocaleString() : 'N/A'} Verts
                    </span>
                  </div>
                  <div className="absolute top-3 right-3 bg-indigo-600/80 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-white pointer-events-none">
                    {model.sizeMB} MB
                  </div>
                </div>

                {/* Details & Actions */}
                <div className="p-5 flex flex-col flex-grow justify-between z-10 bg-gray-900">
                  <div>
                    <div className="flex justify-between items-start">
                      <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors truncate pr-2">{model.title}</h3>
                      {model.category && <span className="text-[10px] uppercase tracking-wider bg-gray-800 text-gray-400 px-2 py-1 rounded shrink-0">{model.category}</span>}
                    </div>
                    <p className="text-sm text-gray-400 mt-1">by <span className="text-gray-300">{model.author}</span></p>
                  </div>
                  
                  <div className="flex flex-col gap-4 mt-5">
                    {/* Interactive Action Bar */}
                    <div className="flex justify-between items-center pt-4 border-t border-gray-800">
                      <button 
                        onClick={() => handleLike(model.id)}
                        className="text-sm text-gray-400 flex items-center gap-1.5 hover:text-red-400 transition transform active:scale-95"
                      >
                        ❤️ <span>{model.likes.toLocaleString()}</span>
                      </button>
                      
                      <button 
                        onClick={() => handleShare(model.title)}
                        className="text-sm text-gray-400 hover:text-indigo-400 font-medium transition flex items-center gap-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
                        Share
                      </button>
                    </div>

                    <button onClick={(e) => handleDownload(e, model.url, model.title)} className="w-full flex justify-center items-center gap-2 bg-gray-800 hover:bg-indigo-600 text-white py-2 rounded-lg transition-colors font-medium text-sm border border-gray-700 hover:border-indigo-500">
                      Download .GLB
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Infinite Scroll Loader Target */}
        {searchTerm === '' && activeCategory === 'All' && (
          <div ref={loaderRef} className="w-full py-16 flex flex-col items-center justify-center">
            {isFetching ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-gray-400 text-sm animate-pulse">Loading more 3D models...</span>
              </div>
            ) : !hasMore ? (
              <span className="text-gray-500 text-sm">You've reached the end of the repository!</span>
            ) : null}
          </div>
        )}
      </main>

      {/* Upload Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col h-[80vh]">
            <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-950">
              <h2 className="text-xl font-bold text-white">Upload & Preview Model</h2>
              <button onClick={() => { setIsUploadOpen(false); setPreviewFileUrl(null); }} className="text-gray-400 hover:text-white text-2xl leading-none">&times;</button>
            </div>
            <div className="flex-grow flex flex-col md:flex-row relative">
              <div className="w-full md:w-2/3 h-64 md:h-full bg-gray-800 relative">
                {previewFileUrl ? <ModelViewer modelUrl={previewFileUrl} environment={sceneEnvironment} /> : <div className="absolute inset-0 flex items-center justify-center text-gray-500"><p>No model selected</p></div>}
              </div>
              <div className="w-full md:w-1/3 p-6 bg-gray-900 flex flex-col gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Select a .GLB file</label>
                  <input type="file" accept=".glb,.gltf" onChange={(e) => { const file = e.target.files[0]; if(file) setPreviewFileUrl(URL.createObjectURL(file)); }} className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 transition cursor-pointer" />
                </div>
                <button disabled={!previewFileUrl} className={`w-full py-3 mt-auto rounded-lg font-bold transition ${previewFileUrl ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-gray-800 text-gray-600 cursor-not-allowed'}`}>Publish Model</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;