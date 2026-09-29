'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function OemCatalogPage() {
  const params = useParams();
  const router = useRouter();
  const vin = params?.vin as string;
  const locale = params?.locale || 'en';

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [activeCategoryId, setActiveCategoryId] = useState('1');
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);

  useEffect(() => {
    if (!vin) return;
    fetchLaximoData(activeCategoryId);
  }, [vin, activeCategoryId]);

  const fetchLaximoData = async (catId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/laximo/diagram?vin=${vin}&categoryId=${catId}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleHotspotClick = (hotspotId: string) => {
    setActiveHotspot(hotspotId);
    // In a real app, this might scroll to the part in the list
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Header */}
      <header className="bg-indigo-900 text-white p-4 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push(`/${locale}`)} className="hover:text-indigo-200">
            ← Back to Marketplace
          </button>
          <h1 className="text-xl font-bold">OEM Parts Catalog (Laximo)</h1>
        </div>
        <div className="font-mono bg-indigo-950 px-4 py-1 rounded border border-indigo-700">
          VIN: {vin}
        </div>
      </header>

      {/* Main Interface */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Sidebar: Categories */}
        <div className="w-64 bg-white border-r border-slate-200 p-4 flex flex-col gap-2 overflow-y-auto">
          <h2 className="font-bold text-slate-700 mb-2 uppercase text-xs tracking-wider">Assembly Groups</h2>
          {loading && !data ? (
            <div className="animate-pulse flex flex-col gap-2">
              <div className="h-10 bg-slate-200 rounded"></div>
              <div className="h-10 bg-slate-200 rounded"></div>
              <div className="h-10 bg-slate-200 rounded"></div>
            </div>
          ) : (
            data?.categories?.map((cat: any) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategoryId(cat.id)}
                className={`p-3 text-left rounded-lg transition-colors font-medium text-sm ${
                  activeCategoryId === cat.id 
                    ? 'bg-indigo-50 border border-indigo-200 text-indigo-700' 
                    : 'hover:bg-slate-50 text-slate-600 border border-transparent'
                }`}
              >
                {cat.name}
              </button>
            ))
          )}
        </div>

        {/* Center: Diagram Viewer */}
        <div className="flex-1 bg-slate-100 p-6 relative flex flex-col">
          <h2 className="text-lg font-bold mb-4 text-slate-800">
            {data?.categories?.find((c:any) => c.id === activeCategoryId)?.name || 'Assembly Diagram'}
          </h2>
          
          <div className="flex-1 bg-white rounded-xl shadow-inner border border-slate-200 relative overflow-hidden flex items-center justify-center p-4">
            {loading ? (
              <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <div className="relative w-full h-full flex items-center justify-center">
                {/* 
                  In a real Laximo integration, we map real X/Y coordinates to hotspots.
                  Here we render a placeholder diagram and mock interactive absolute hotspots.
                */}
                <img 
                  src={data?.activeDiagram?.imageUrl} 
                  alt="OEM Diagram" 
                  className="max-w-full max-h-full object-contain drop-shadow-md rounded"
                />

                {/* Mock Hotspots over the image (positioned roughly for the 800x600 placeholder) */}
                {data?.activeDiagram?.parts?.map((part: any, idx: number) => {
                  // Fake positioning for demo purposes
                  const top = 30 + (idx * 20);
                  const left = 40 + (idx * 10);
                  const isActive = activeHotspot === part.hotspotId;
                  
                  return (
                    <button
                      key={part.hotspotId}
                      onClick={() => handleHotspotClick(part.hotspotId)}
                      className={`absolute w-8 h-8 -ml-4 -mt-4 rounded-full border-2 flex items-center justify-center font-bold text-xs shadow-lg transition-all z-10 ${
                        isActive 
                          ? 'bg-indigo-600 border-white text-white scale-125 z-20' 
                          : 'bg-white border-indigo-600 text-indigo-700 hover:scale-110 hover:bg-indigo-50'
                      }`}
                      style={{ top: `${top}%`, left: `${left}%` }}
                    >
                      {part.hotspotId}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar: Parts List */}
        <div className="w-96 bg-white border-l border-slate-200 flex flex-col">
          <div className="p-4 border-b border-slate-200 bg-slate-50">
            <h2 className="font-bold text-slate-800">Parts List</h2>
            <p className="text-xs text-slate-500">Select a hotspot on the diagram</p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2">
            {data?.activeDiagram?.parts?.map((part: any) => {
              const isActive = activeHotspot === part.hotspotId;
              
              return (
                <div 
                  key={part.hotspotId}
                  onClick={() => handleHotspotClick(part.hotspotId)}
                  className={`p-3 mb-2 rounded-lg border cursor-pointer transition-colors ${
                    isActive 
                      ? 'border-indigo-400 bg-indigo-50 shadow-sm' 
                      : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mt-0.5 ${
                      isActive ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {part.hotspotId}
                    </div>
                    <div className="flex-1">
                      <div className="font-mono font-bold text-slate-800 text-sm">{part.oemPartNumber}</div>
                      <div className="text-sm text-slate-600">{part.name}</div>
                      
                      {isActive && (
                        <div className="mt-3 pt-3 border-t border-indigo-100 flex gap-2">
                          <button className="flex-1 bg-indigo-600 text-white py-1.5 rounded text-xs font-semibold hover:bg-indigo-700">
                            Check Availability
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
