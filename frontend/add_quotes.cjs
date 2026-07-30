const fs = require('fs');
let content = fs.readFileSync('src/app/[locale]/portal/page.tsx', 'utf8');

// 1. Add quotes state
if (!content.includes('const [quotes, setQuotes] = useState<Record<string, string>>({});')) {
  content = content.replace(
    'const [dispatches, setDispatches] = useState<any[]>([]);',
    'const [dispatches, setDispatches] = useState<any[]>([]);\n  const [quotes, setQuotes] = useState<Record<string, string>>({});'
  );
}

// 2. Update handleUpdateDispatch
if (!content.includes('body: JSON.stringify({ status, quote: quotes[dispatchId] })')) {
  content = content.replace(
    `  const handleUpdateDispatch = async (dispatchId: string, status: string) => {
    try {
      const res = await fetch(\`/api/dispatch?id=\${dispatchId}\`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'X-Tenant-ID': activeTenantId as string },
        body: JSON.stringify({ status })
      });`,
    `  const handleUpdateDispatch = async (dispatchId: string, status: string) => {
    try {
      const res = await fetch(\`/api/dispatch?id=\${dispatchId}\`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'X-Tenant-ID': activeTenantId as string },
        body: JSON.stringify({ status, quote: quotes[dispatchId] })
      });`
  );
}

// 3. Update the button to include a quote input
const acceptButtonStr = `                        {dispatch.status === 'pending' && (
                          <button onClick={() => handleUpdateDispatch(dispatch.id, 'accepted')} className="w-full mt-2 bg-indigo-650 hover:bg-indigo-600 text-white font-bold py-2 rounded-xl text-xs transition-colors">
                            Accept Dispatch
                          </button>
                        )}`;
const acceptButtonNew = `                        {dispatch.status === 'pending' && (
                          <div className="flex flex-col gap-2 mt-2">
                            <input
                              type="text"
                              placeholder="Price Quote (e.g., 150 SAR)"
                              value={quotes[dispatch.id] || ''}
                              onChange={(e) => setQuotes({...quotes, [dispatch.id]: e.target.value})}
                              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                            />
                            <button onClick={() => handleUpdateDispatch(dispatch.id, 'accepted')} className="w-full bg-indigo-650 hover:bg-indigo-600 text-white font-bold py-2 rounded-xl text-xs transition-colors">
                              Accept Dispatch
                            </button>
                          </div>
                        )}`;
if (content.includes(acceptButtonStr)) {
  content = content.replace(acceptButtonStr, acceptButtonNew);
}

fs.writeFileSync('src/app/[locale]/portal/page.tsx', content);
console.log('Modified portal/page.tsx with quotes');
