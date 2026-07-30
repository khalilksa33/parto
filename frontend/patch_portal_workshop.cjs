const fs = require('fs');
const content = fs.readFileSync('src/app/[locale]/portal/page.tsx', 'utf8');

let newContent = content;

// 1. In loadData, add fetch for dispatches and part requests if not present
if (!newContent.includes('fetch(`/api/dispatch?action=poll&tenant_id=')) {
  const orderResBlock = `        if (orderRes.ok) {
          const orderData = await orderRes.json();
          setOrders(orderData.orders || []);
        }`;
        
  const newFetches = `        if (orderRes.ok) {
          const orderData = await orderRes.json();
          setOrders(orderData.orders || []);
        }

        if (found.business_type === 'tow_company' || found.business_type === 'mobile_workshop') {
          const serviceType = found.business_type === 'tow_company' ? 'tow' : 'workshop';
          const dispatchRes = await fetch(\`/api/dispatch?action=poll&tenant_id=\${activeTenantId}&service_type=\${serviceType}\`);
          if (dispatchRes.ok) {
            const dispatchData = await dispatchRes.json();
            setDispatches(dispatchData.dispatches || []);
          }
        }

        if (found.business_type === 'used_auto_spare_parts') {
          const tashleehRes = await fetch(\`/api/tashleeh/request?tenant_id=\${activeTenantId}\`, {
            headers: { 'X-Tenant-ID': activeTenantId as string }
          });
          if (tashleehRes.ok) {
            const tashleehData = await tashleehRes.json();
            setPartRequests(tashleehData.requests || []);
          }
        }`;
  newContent = newContent.replace(orderResBlock, newFetches);
}

// 2. Add polling effect for dispatches and part requests
if (!newContent.includes('const pollInterval = setInterval(')) {
  const endOfLoadData = `    };

    loadData();
  }, [activeTenantId, locale]);`;
  
  const pollingEffect = `    };

    loadData();

    // Setup polling
    const pollInterval = setInterval(async () => {
      if (!tenant) return;
      if (tenant.business_type === 'tow_company' || tenant.business_type === 'mobile_workshop') {
        const serviceType = tenant.business_type === 'tow_company' ? 'tow' : 'workshop';
        const dispatchRes = await fetch(\`/api/dispatch?action=poll&tenant_id=\${activeTenantId}&service_type=\${serviceType}\`);
        if (dispatchRes.ok) {
          const dispatchData = await dispatchRes.json();
          setDispatches(dispatchData.dispatches || []);
        }
      }
      if (tenant.business_type === 'used_auto_spare_parts') {
        const tashleehRes = await fetch(\`/api/tashleeh/request?tenant_id=\${activeTenantId}\`, {
          headers: { 'X-Tenant-ID': activeTenantId as string }
        });
        if (tashleehRes.ok) {
          const tashleehData = await tashleehRes.json();
          setPartRequests(tashleehData.requests || []);
        }
      }
    }, 5000);

    return () => clearInterval(pollInterval);
  }, [activeTenantId, locale, tenant]);`;
  
  newContent = newContent.replace(endOfLoadData, pollingEffect);
}

// 3. Update handleUpdateDispatch to pass service_type
newContent = newContent.replace(
  'const dispatchRes = await fetch(`/api/dispatch?action=poll&tenant_id=${activeTenantId}`);',
  'const serviceType = tenant?.business_type === "tow_company" ? "tow" : "workshop";\n        const dispatchRes = await fetch(`/api/dispatch?action=poll&tenant_id=${activeTenantId}&service_type=${serviceType}`);'
);

// 4. Update the Active Towing Dispatches block to also show for mobile_workshop
newContent = newContent.replace(
  `{activeTab === 'orders' && tenant?.business_type === 'tow_company' && (`,
  `{activeTab === 'orders' && (tenant?.business_type === 'tow_company' || tenant?.business_type === 'mobile_workshop') && (`
);

// 5. Dynamic headers for tow vs workshop
newContent = newContent.replace(
  `<h3 className="text-lg font-bold text-white">Active Towing Dispatches</h3>`,
  `<h3 className="text-lg font-bold text-white">{tenant?.business_type === 'mobile_workshop' ? 'Active Mobile Workshop Requests' : 'Active Towing Dispatches'}</h3>`
);
newContent = newContent.replace(
  `<p className="text-[10px] text-slate-500">Live feed of consumer towing requests in your area.</p>`,
  `<p className="text-[10px] text-slate-500">Live feed of consumer {tenant?.business_type === 'mobile_workshop' ? 'workshop' : 'towing'} requests in your area.</p>`
);

fs.writeFileSync('src/app/[locale]/portal/page.tsx', newContent);
console.log('Modified portal/page.tsx successfully');
