const fs = require('fs');
let content = fs.readFileSync('src/app/[locale]/tashleeh/page.tsx', 'utf8');

if (!content.includes('const searchParams = useSearchParams();')) {
  // Add useSearchParams to imports
  content = content.replace(
    `import { useRouter, useParams } from 'next/navigation';`,
    `import { useRouter, useParams, useSearchParams } from 'next/navigation';`
  );

  // Initialize inside component
  content = content.replace(
    `const params = useParams();`,
    `const params = useParams();\n  const searchParams = useSearchParams();`
  );

  // Update formData initial state to use search params if available
  const oldState = `const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    vehicleMake: '',
    vehicleModel: '',
    vehicleYear: '',
    partName: ''
  });`;

  const newState = `const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    vehicleMake: searchParams.get('make') || '',
    vehicleModel: searchParams.get('model') || '',
    vehicleYear: searchParams.get('year') || '',
    partName: searchParams.get('partName') || ''
  });`;

  content = content.replace(oldState, newState);
  
  fs.writeFileSync('src/app/[locale]/tashleeh/page.tsx', content);
  console.log('Modified tashleeh page to accept URL params');
} else {
  console.log('Already modified');
}
