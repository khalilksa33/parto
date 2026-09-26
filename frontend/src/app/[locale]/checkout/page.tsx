'use client';

import React, { useState } from 'react';

export default function CheckoutPage() {
  const [address, setAddress] = useState({
    name: '',
    street1: '',
    city: '',
    state: '',
    zip: '',
    country: 'SA'
  });

  const [rates, setRates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedRate, setSelectedRate] = useState('');

  // Mock cart items (in a real app, fetch from Context/LocalStorage)
  const cartItems = [
    { productId: 'mock-uuid-1234', name: 'Brake Pads', quantity: 2, price: 45.99 },
    { productId: 'mock-uuid-5678', name: 'Oil Filter', quantity: 5, price: 12.50 }
  ];

  const handleCalculateShipping = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/shipping/rates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          addressTo: address,
          cartItems: cartItems
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch shipping rates');
      }

      setRates(data.rates || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Secure Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Column: Address Form */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
          <form onSubmit={handleCalculateShipping} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input required type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" 
                     value={address.name} onChange={e => setAddress({...address, name: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Street Address</label>
              <input required type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" 
                     value={address.street1} onChange={e => setAddress({...address, street1: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">City</label>
                <input required type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" 
                       value={address.city} onChange={e => setAddress({...address, city: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">State / Province</label>
                <input required type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" 
                       value={address.state} onChange={e => setAddress({...address, state: e.target.value})} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">ZIP / Postal Code</label>
                <input required type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" 
                       value={address.zip} onChange={e => setAddress({...address, zip: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Country Code (e.g. SA, AE, US)</label>
                <input required type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" 
                       value={address.country} onChange={e => setAddress({...address, country: e.target.value.toUpperCase()})} />
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition font-medium mt-6">
              {loading ? 'Calculating rates...' : 'Calculate Shipping'}
            </button>
          </form>
        </div>

        {/* Right Column: Order Summary & Shipping Rates */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-8">
            {cartItems.map((item, idx) => (
              <div key={idx} className="flex justify-between py-2 border-b last:border-0 border-gray-300">
                <span>{item.quantity}x {item.name}</span>
                <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="flex justify-between py-4 mt-2 border-t border-gray-300 font-bold">
              <span>Total Items</span>
              <span>${cartItems.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0).toFixed(2)}</span>
            </div>
          </div>

          <h2 className="text-xl font-semibold mb-4">Shipping Method</h2>
          {error && <div className="text-red-500 mb-4 p-3 bg-red-50 rounded border border-red-200">{error}</div>}
          
          {!loading && rates.length === 0 && !error && (
            <p className="text-gray-500 italic bg-gray-50 p-4 rounded-lg">Enter your address and click Calculate Shipping to see available rates.</p>
          )}

          {rates.length > 0 && (
            <div className="space-y-3">
              {rates.map((rate, idx) => (
                <label key={idx} className={`block p-4 border rounded-lg cursor-pointer transition ${selectedRate === rate.object_id ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-gray-200 hover:border-blue-300'}`}>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <input 
                        type="radio" 
                        name="shipping_rate" 
                        value={rate.object_id} 
                        checked={selectedRate === rate.object_id}
                        onChange={() => setSelectedRate(rate.object_id)}
                        className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500" 
                      />
                      <div>
                        <p className="font-medium text-gray-900">{rate.provider} - {rate.servicelevel.name}</p>
                        <p className="text-sm text-gray-500">Estimated transit: {rate.estimated_days || '?'} days</p>
                      </div>
                    </div>
                    <div className="text-lg font-bold text-gray-900">
                      {rate.amount} {rate.currency}
                    </div>
                  </div>
                </label>
              ))}
              
              <button disabled={!selectedRate} className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 transition font-bold mt-6 disabled:opacity-50 disabled:cursor-not-allowed">
                Complete Order
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
