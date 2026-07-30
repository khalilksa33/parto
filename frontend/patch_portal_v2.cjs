const fs = require('fs');

let content = fs.readFileSync('src/app/[locale]/portal/page.tsx', 'utf8');

// 1. Add dispatches state
if (!content.includes('const [dispatches, setDispatches]')) {
  content = content.replace(
    'const [orders, setOrders] = useState<any[]>([]);',
    'const [orders, setOrders] = useState<any[]>([]);\n  const [dispatches, setDispatches] = useState<any[]>([]);'
  );
}

// 2. Fetch dispatches
if (!content.includes('const dispatchRes = await fetch(`/api/dispatch?action=poll&tenant_id=')) {
  const fetchOrdersStr = `        // Fetch orders isolated by this tenant (passes X-Tenant-ID to enforce RLS)
        const orderRes = await fetch(\`\${API_URL}/api/orders\`, {
          headers: {
            'X-Tenant-ID': activeTenantId
          }
        });
        if (orderRes.ok) {
          const orderData = await orderRes.json();
          setOrders(orderData.orders || []);
        }`;
        
  const fetchDispatchesStr = `        // Fetch orders isolated by this tenant (passes X-Tenant-ID to enforce RLS)
        const orderRes = await fetch(\`\${API_URL}/api/orders\`, {
          headers: {
            'X-Tenant-ID': activeTenantId
          }
        });
        if (orderRes.ok) {
          const orderData = await orderRes.json();
          setOrders(orderData.orders || []);
        }

        // Fetch dispatches if tow_company
        if (found.business_type === 'tow_company') {
          const dispatchRes = await fetch(\`/api/dispatch?action=poll&tenant_id=\${activeTenantId}\`);
          if (dispatchRes.ok) {
            const dispatchData = await dispatchRes.json();
            setDispatches(dispatchData.dispatches || []);
          }
        }`;
        
  content = content.replace(fetchOrdersStr, fetchDispatchesStr);
}

// 3. handleUpdateDispatch logic
if (!content.includes('handleUpdateDispatch')) {
  const handleLogoutStr = `  const handleLogout = () => {`;
  const handleUpdateDispatchStr = `  const handleUpdateDispatch = async (dispatchId: string, status: string) => {
    try {
      const res = await fetch(\`/api/dispatch?id=\${dispatchId}\`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'X-Tenant-ID': activeTenantId as string },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        // Refresh dispatches
        const dispatchRes = await fetch(\`/api/dispatch?action=poll&tenant_id=\${activeTenantId}\`);
        if (dispatchRes.ok) {
          const dispatchData = await dispatchRes.json();
          setDispatches(dispatchData.dispatches || []);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {`;
  content = content.replace(handleLogoutStr, handleUpdateDispatchStr);
}

// 4. Update clear state on logout
if (!content.includes('setDispatches([]);')) {
  const setOrdersStr = `    setOrders([]);`;
  content = content.replace(setOrdersStr, `    setOrders([]);\n    setDispatches([]);`);
}

// 5. Replace Dashboard Tabs
if (!content.includes('tenant.business_type === \'tow_company\' ? \'Service Config\'')) {
  const tabsStr = `            {/* Dashboard Tabs */}
            <div className="flex border-b border-slate-850 gap-2">
              {(['dashboard', 'products', 'orders'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={\`px-6 py-3 text-sm font-bold border-b-2 transition-all duration-200 \${
                    activeTab === tab 
                      ? 'border-indigo-500 text-indigo-400' 
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }\`}
                >
                  {tab === 'dashboard' ? t.activeTabDashboard : tab === 'products' ? t.activeTabProducts : t.activeTabOrders}
                </button>
              ))}
            </div>`;
  const newTabsStr = `            {/* Dashboard Tabs */}
            <div className="flex border-b border-slate-850 gap-2">
              {(['dashboard', 'products', 'orders'] as const).map((tab) => {
                let tabLabel = '';
                if (tab === 'dashboard') tabLabel = t.activeTabDashboard;
                if (tab === 'products') tabLabel = tenant?.business_type === 'tow_company' ? 'Service Config' : t.activeTabProducts;
                if (tab === 'orders') tabLabel = tenant?.business_type === 'tow_company' ? 'Active Dispatches' : t.activeTabOrders;
                return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={\`px-6 py-3 text-sm font-bold border-b-2 transition-all duration-200 \${
                    activeTab === tab 
                      ? 'border-indigo-500 text-indigo-400' 
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }\`}
                >
                  {tabLabel}
                </button>
              )})}
            </div>`;
  content = content.replace(tabsStr, newTabsStr);
}

// 6. Replace Orders Content
if (!content.includes('Active Towing Dispatches')) {
  // Using string split & join to replace the entire orders tab content
  const startMarker = `            {/* TAB CONTENT: ORDERS (RLS PROOF) */}`;
  const endMarker = `          </div>
        </div>
      </main>
    </div>
  );
}`;
  
  const beforeOrders = content.substring(0, content.indexOf(startMarker));
  const afterOrders = endMarker;
  
  const dispatchesTabStr = `            {/* TAB CONTENT: ORDERS (RLS PROOF) OR DISPATCHES */}
            {activeTab === 'orders' && tenant?.business_type !== 'tow_company' && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-emerald-400">🛡️</span>
                  <div>
                    <h3 className="text-lg font-bold text-white">{locale === 'ar' ? 'طلبات متجرك' : 'Isolated Store Orders'}</h3>
                    <p className="text-[10px] text-slate-500">
                      {locale === 'ar' 
                        ? 'تُظهر هذه القائمة فقط الطلبات التي تمت تصفيتها عبر سياسة RLS لمتجرك بقاعدة البيانات.' 
                        : 'PostgreSQL engine enforces table-level filtering. Orders belonging to other vendors are strictly invisible.'}
                    </p>
                  </div>
                </div>

                {orders.length > 0 ? (
                  <div className="overflow-x-auto border border-slate-850 rounded-2xl bg-slate-900/10">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-850 text-slate-400 font-semibold uppercase tracking-wider">
                          <th className="py-3 px-4">{t.orderNum}</th>
                          <th className="py-3">{t.orderAmount}</th>
                          <th className="py-3">{t.orderStatus}</th>
                          <th className="py-3 px-4">{t.orderDate}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850/50 font-mono">
                        {orders.map((order) => (
                          <tr key={order.id} className="hover:bg-slate-900/20 transition-colors">
                            <td className="py-4 px-4 font-bold text-indigo-400">{order.order_number}</td>
                            <td className="py-4 font-semibold text-white">
                              {order.total_amount} {order.currency}
                            </td>
                            <td className="py-4">
                              <span className={\`px-2 py-0.5 rounded text-[10px] font-bold uppercase \${
                                order.status === 'completed' 
                                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/20' 
                                  : 'bg-amber-950 text-amber-400 border border-amber-500/20'
                              }\`}>
                                {order.status}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-slate-400">
                              {new Date(order.created_at).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12 border border-dashed border-slate-850 rounded-2xl text-slate-400 text-xs">
                    {t.noOrders}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'orders' && tenant?.business_type === 'tow_company' && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-amber-400">🛻</span>
                  <div>
                    <h3 className="text-lg font-bold text-white">Active Towing Dispatches</h3>
                    <p className="text-[10px] text-slate-500">Live feed of consumer towing requests in your area.</p>
                  </div>
                </div>

                {dispatches.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {dispatches.map(dispatch => (
                      <div key={dispatch.id} className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3">
                        <div className="flex justify-between items-start">
                           <div>
                             <h4 className="font-bold text-white text-sm">{dispatch.customerName}</h4>
                             <span className="text-xs text-slate-400">{dispatch.customerPhone}</span>
                           </div>
                           <span className={\`px-2 py-1 rounded text-[10px] font-bold uppercase \${dispatch.status === 'pending' ? 'bg-indigo-950 text-indigo-400' : 'bg-emerald-950 text-emerald-400'}\`}>
                             {dispatch.status}
                           </span>
                        </div>
                        <div className="bg-slate-950 rounded-lg p-3 text-xs flex flex-col gap-2">
                          <div className="flex gap-2"><span className="text-slate-500">Pickup:</span><span className="text-slate-200">{dispatch.pickupLocation}</span></div>
                          <div className="flex gap-2"><span className="text-slate-500">Dropoff:</span><span className="text-slate-200">{dispatch.dropoffLocation}</span></div>
                          <div className="flex gap-2"><span className="text-slate-500">Vehicle:</span><span className="text-slate-200">{dispatch.vehicleDetails}</span></div>
                        </div>
                        
                        {dispatch.status === 'pending' && (
                          <button onClick={() => handleUpdateDispatch(dispatch.id, 'accepted')} className="w-full mt-2 bg-indigo-650 hover:bg-indigo-600 text-white font-bold py-2 rounded-xl text-xs transition-colors">
                            Accept Dispatch
                          </button>
                        )}
                        {dispatch.status === 'accepted' && dispatch.acceptedBy === tenant.id && (
                          <button onClick={() => handleUpdateDispatch(dispatch.id, 'en_route')} className="w-full mt-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-xl text-xs transition-colors">
                            Mark En Route
                          </button>
                        )}
                        {dispatch.status === 'en_route' && dispatch.acceptedBy === tenant.id && (
                          <button onClick={() => handleUpdateDispatch(dispatch.id, 'arrived')} className="w-full mt-2 bg-amber-600 hover:bg-amber-500 text-white font-bold py-2 rounded-xl text-xs transition-colors">
                            Mark Arrived
                          </button>
                        )}
                        {dispatch.status === 'arrived' && dispatch.acceptedBy === tenant.id && (
                          <button onClick={() => handleUpdateDispatch(dispatch.id, 'completed')} className="w-full mt-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-xl text-xs transition-colors">
                            Complete Job
                          </button>
                        )}
                        {dispatch.status === 'completed' && dispatch.acceptedBy === tenant.id && (
                          <div className="w-full mt-2 text-center text-emerald-400 font-bold text-xs py-2">
                            Job Completed
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 border border-dashed border-slate-850 rounded-2xl text-slate-400 text-xs">
                    No active dispatches right now.
                  </div>
                )}
              </div>
            )}
`;
  content = beforeOrders + dispatchesTabStr + "\n" + afterOrders;
}

fs.writeFileSync('src/app/[locale]/portal/page.tsx', content);
console.log('Modified portal/page.tsx heavily');
