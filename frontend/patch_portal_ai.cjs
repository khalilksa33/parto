const fs = require('fs');
let content = fs.readFileSync('src/app/[locale]/portal/page.tsx', 'utf8');

// 1. Add description and compatibility to newProduct state
const oldState = `  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    category: 'auto_parts',
    image: '',
    featured: false
  });`;

const newState = `  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    category: 'auto_parts',
    description: '',
    compatibility: [],
    image: '',
    featured: false
  });
  const [isEnriching, setIsEnriching] = useState(false);`;

if (!content.includes('description: \'\',')) {
  content = content.replace(oldState, newState);
}

// 2. Add handleEnrich function
if (!content.includes('const handleEnrich')) {
  const enrichFunc = `
  const handleEnrich = async () => {
    if (!newProduct.name) return;
    setIsEnriching(true);
    try {
      const res = await fetch('/api/ai/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productName: newProduct.name, action: 'enrich' })
      });
      if (res.ok) {
        const data = await res.json();
        setNewProduct(prev => ({
          ...prev,
          name: data.name || prev.name,
          category: data.category || prev.category,
          description: data.description || '',
          compatibility: data.compatibility || []
        }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsEnriching(false);
    }
  };
`;
  content = content.replace('const handleAddProduct = async (e: React.FormEvent) => {', enrichFunc + '\n  const handleAddProduct = async (e: React.FormEvent) => {');
}

// 3. Add description and compatibility to payload in handleAddProduct
if (!content.includes('description: newProduct.description')) {
  const oldPayload = `        const payload = {
          name: newProduct.name,
          price: parseFloat(newProduct.price),
          category: newProduct.category,
          image: newProduct.image,
          featured: newProduct.featured
        };`;
  const newPayload = `        const payload = {
          name: newProduct.name,
          price: parseFloat(newProduct.price),
          category: newProduct.category,
          description: newProduct.description,
          compatibility: newProduct.compatibility,
          image: newProduct.image,
          featured: newProduct.featured
        };`;
  content = content.replace(oldPayload, newPayload);
}

// 4. Handle Compliance Error
if (!content.includes('throw new Error(errorData.reason || \'Failed to save\')')) {
  const oldResCheck = `        if (!res.ok) {
          throw new Error('Failed to save product/service.');
        }`;
  const newResCheck = `        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.reason || 'Failed to save product/service.');
        }`;
  content = content.replace(oldResCheck, newResCheck);
}

// 5. Reset description and compatibility
if (!content.includes('description: \'\',\n          compatibility: []')) {
  const oldReset = `        setNewProduct({
          name: '',
          price: '',
          category: 'auto_parts',
          image: '',
          featured: false
        });`;
  const newReset = `        setNewProduct({
          name: '',
          price: '',
          category: 'auto_parts',
          description: '',
          compatibility: [],
          image: '',
          featured: false
        });`;
  content = content.replace(oldReset, newReset);
}

// 6. Add ✨ Enrich button to the form
if (!content.includes('Auto-Enrich Listing')) {
  const nameInputStr = `                  <input
                    type="text"
                    required
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500"
                    placeholder="Product Name"
                  />`;
  const enhancedNameInput = `                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500"
                      placeholder="Product Name (e.g. camry front light)"
                    />
                    <button 
                      type="button" 
                      onClick={handleEnrich}
                      disabled={isEnriching || !newProduct.name}
                      className="px-4 py-2 bg-indigo-900/40 text-indigo-300 border border-indigo-500/30 rounded-xl text-xs font-bold hover:bg-indigo-900/80 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {isEnriching ? '...' : '✨ Auto-Enrich'}
                    </button>
                  </div>`;
  content = content.replace(nameInputStr, enhancedNameInput);
}

// 7. Add Description and Compatibility inputs
if (!content.includes('value={newProduct.description}')) {
  const afterCategoryStr = `                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500"
                  >
                    <option value="auto_parts">Auto Parts</option>
                    <option value="tires">Tires & Wheels</option>
                    <option value="accessories">Accessories</option>
                    <option value="services">Services</option>
                  </select>
                </div>`;
                
  const extraInputs = `
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Description (Optional)</label>
                  <textarea
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 h-24"
                    placeholder="Professional description..."
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Compatibility (Optional)</label>
                  <input
                    type="text"
                    value={newProduct.compatibility.join(', ')}
                    onChange={(e) => setNewProduct({...newProduct, compatibility: e.target.value.split(',').map(s=>s.trim()).filter(Boolean)})}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500"
                    placeholder="e.g. Toyota Camry 2018, Honda Accord 2020"
                  />
                </div>`;
                
  content = content.replace(afterCategoryStr, afterCategoryStr + extraInputs);
}

fs.writeFileSync('src/app/[locale]/portal/page.tsx', content);
console.log('Modified portal/page.tsx for AI Enrich');
