const fs = require('fs');
let content = fs.readFileSync('src/app/[locale]/portal/page.tsx', 'utf8');

// 1. Add partRequests and quoteForm state
if (!content.includes('const [partRequests, setPartRequests] = useState<any[]>([]);')) {
  content = content.replace(
    'const [dispatches, setDispatches] = useState<any[]>([]);',
    'const [dispatches, setDispatches] = useState<any[]>([]);\n  const [partRequests, setPartRequests] = useState<any[]>([]);\n  const [quoteForms, setQuoteForms] = useState<Record<string, any>>({});'
  );
}

// 2. Fetch part requests if used_auto_spare_parts
if (!content.includes('const tashleehRes = await fetch(`/api/tashleeh/request?tenant_id=')) {
  const fetchDispatchesStr = `        // Fetch dispatches if tow_company
        if (found.business_type === 'tow_company') {
          const dispatchRes = await fetch(\`/api/dispatch?action=poll&tenant_id=\${activeTenantId}\`);
          if (dispatchRes.ok) {
            const dispatchData = await dispatchRes.json();
            setDispatches(dispatchData.dispatches || []);
          }
        }`;
        
  const fetchTashleehStr = `        // Fetch dispatches if tow_company
        if (found.business_type === 'tow_company') {
          const dispatchRes = await fetch(\`/api/dispatch?action=poll&tenant_id=\${activeTenantId}\`);
          if (dispatchRes.ok) {
            const dispatchData = await dispatchRes.json();
            setDispatches(dispatchData.dispatches || []);
          }
        }
        
        // Fetch part requests if tashleeh
        if (found.business_type === 'used_auto_spare_parts') {
          const tashleehRes = await fetch(\`/api/tashleeh/request?tenant_id=\${activeTenantId}\`, {
            headers: { 'X-Tenant-ID': activeTenantId }
          });
          if (tashleehRes.ok) {
            const tashleehData = await tashleehRes.json();
            setPartRequests(tashleehData.requests || []);
          }
        }`;
        
  content = content.replace(fetchDispatchesStr, fetchTashleehStr);
}

// 3. handleSubmitQuote logic
if (!content.includes('handleSubmitQuote')) {
  const handleLogoutStr = `  const handleLogout = () => {`;
  const handleSubmitQuoteStr = `  const handleSubmitQuote = async (requestId: string) => {
    try {
      const q = quoteForms[requestId];
      if (!q || !q.price || !q.condition) return;
      const res = await fetch('/api/tashleeh/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Tenant-ID': activeTenantId as string },
        body: JSON.stringify({ requestId, price: q.price, condition: q.condition, notes: q.notes })
      });
      if (res.ok) {
        // Refresh part requests
        const tashleehRes = await fetch(\`/api/tashleeh/request?tenant_id=\${activeTenantId}\`, {
          headers: { 'X-Tenant-ID': activeTenantId as string }
        });
        if (tashleehRes.ok) {
          const tashleehData = await tashleehRes.json();
          setPartRequests(tashleehData.requests || []);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {`;
  content = content.replace(handleLogoutStr, handleSubmitQuoteStr);
}

// 4. Update clear state on logout
if (!content.includes('setPartRequests([]);')) {
  const setDispatchesStr = `    setDispatches([]);`;
  content = content.replace(setDispatchesStr, `    setDispatches([]);\n    setPartRequests([]);`);
}

// 5. Replace Dashboard Tabs label for tashleeh
if (!content.includes('tenant?.business_type === \'used_auto_spare_parts\' ? \'Part Requests\'')) {
  const oldOrdersLabel = `if (tab === 'orders') tabLabel = tenant?.business_type === 'tow_company' ? 'Active Dispatches' : t.activeTabOrders;`;
  const newOrdersLabel = `if (tab === 'orders') tabLabel = tenant?.business_type === 'tow_company' ? 'Active Dispatches' : tenant?.business_type === 'used_auto_spare_parts' ? 'Part Requests' : t.activeTabOrders;`;
  content = content.replace(oldOrdersLabel, newOrdersLabel);
}

// 6. Replace Orders Content for Tashleeh
if (!content.includes('Active Part Requests')) {
  const endOfTowStr = `              </div>
            )}
`;
  const tashleehTabStr = `
            {activeTab === 'orders' && tenant?.business_type === 'used_auto_spare_parts' && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-amber-400">⚙️</span>
                  <div>
                    <h3 className="text-lg font-bold text-white">Active Part Requests</h3>
                    <p className="text-[10px] text-slate-500">Live feed of consumer part requests. Submit your quotes.</p>
                  </div>
                </div>

                {partRequests.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {partRequests.map(req => (
                      <div key={req.id} className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3">
                        <div className="flex justify-between items-start">
                           <div>
                             <h4 className="font-bold text-white text-sm">{req.partName}</h4>
                             <span className="text-xs text-slate-400">{req.vehicleYear} {req.vehicleMake} {req.vehicleModel}</span>
                           </div>
                           <span className={\`px-2 py-1 rounded text-[10px] font-bold uppercase bg-indigo-950 text-indigo-400\`}>
                             {req.status}
                           </span>
                        </div>
                        <div className="bg-slate-950 rounded-lg p-3 text-xs flex flex-col gap-2">
                          <div className="flex gap-2"><span className="text-slate-500">Customer:</span><span className="text-slate-200">{req.customerName} ({req.customerPhone})</span></div>
                        </div>
                        
                        <div className="flex flex-col gap-2 mt-2 border-t border-slate-800 pt-3">
                          <label className="text-[10px] font-bold text-slate-500 uppercase">Submit Quote</label>
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="number"
                              placeholder="Price (SAR)"
                              value={quoteForms[req.id]?.price || ''}
                              onChange={(e) => setQuoteForms({...quoteForms, [req.id]: {...quoteForms[req.id], price: e.target.value}})}
                              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                            />
                            <select
                              value={quoteForms[req.id]?.condition || ''}
                              onChange={(e) => setQuoteForms({...quoteForms, [req.id]: {...quoteForms[req.id], condition: e.target.value}})}
                              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                            >
                              <option value="" disabled>Condition</option>
                              <option value="Like New">Like New</option>
                              <option value="Good">Good</option>
                              <option value="Fair">Fair</option>
                              <option value="Needs Repair">Needs Repair</option>
                            </select>
                          </div>
                          <input
                            type="text"
                            placeholder="Notes (Optional)"
                            value={quoteForms[req.id]?.notes || ''}
                            onChange={(e) => setQuoteForms({...quoteForms, [req.id]: {...quoteForms[req.id], notes: e.target.value}})}
                            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                          />
                          <button onClick={() => handleSubmitQuote(req.id)} className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-2 rounded-xl text-xs transition-colors">
                            Submit Quote
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 border border-dashed border-slate-850 rounded-2xl text-slate-400 text-xs">
                    No active part requests right now.
                  </div>
                )}
              </div>
            )}
`;
  content = content.replace(endOfTowStr, endOfTowStr + tashleehTabStr);
}

fs.writeFileSync('src/app/[locale]/portal/page.tsx', content);
console.log('Modified portal/page.tsx for Tashleeh');
