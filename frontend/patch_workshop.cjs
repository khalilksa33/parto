const fs = require('fs');
let content = fs.readFileSync('src/app/[locale]/workshop/page.tsx', 'utf8');

// Replace Text
content = content.replace(/Towing & Roadside Assistance/g, 'Mobile Workshop & On-site Repair');
content = content.replace(/Request a tow truck or roadside help instantly/g, 'Request a mobile mechanic to your location instantly');
content = content.replace(/Where is your vehicle\\?/g, 'Where is your vehicle located?');
content = content.replace(/Where do you need the vehicle towed to\\?/g, "Describe the issue (e.g. Flat tire, dead battery, engine won't start)");
content = content.replace(/Request Tow Truck/g, 'Request Mobile Mechanic');
content = content.replace(/Finding a tow truck nearby\\.\\.\\./g, 'Finding a mobile mechanic nearby...');
content = content.replace(/Driver En Route/g, 'Mechanic En Route');
content = content.replace(/The tow truck is on its way\\./g, 'The mobile mechanic is on their way.');
content = content.replace(/Tow driver has arrived\\./g, 'The mechanic has arrived at your location.');
content = content.replace(/Towing Complete/g, 'Service Complete');
content = content.replace(/Your vehicle has been successfully towed/g, 'Your repair service has been completed');
content = content.replace(/Sattahat/g, 'Workshop');
content = content.replace(/Tow Company/g, 'Mobile Workshop');
content = content.replace(/Tow Truck/g, 'Mobile Mechanic');
content = content.replace(/Tow driver/g, 'Mechanic');

// In payload, add serviceType: 'workshop'
const payloadSearch = `        const payload = {
          customerName: formData.name,
          customerPhone: formData.phone,
          pickupLocation: formData.pickup,
          dropoffLocation: formData.dropoff,
          vehicleDetails: formData.vehicle,
        };`;
const payloadReplace = `        const payload = {
          customerName: formData.name,
          customerPhone: formData.phone,
          pickupLocation: formData.pickup,
          dropoffLocation: formData.dropoff,
          vehicleDetails: formData.vehicle,
          serviceType: 'workshop'
        };`;
content = content.replace(payloadSearch, payloadReplace);

fs.writeFileSync('src/app/[locale]/workshop/page.tsx', content);
console.log('Modified workshop/page.tsx');
