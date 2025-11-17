import React, { useState } from 'react';

function App() {
  const [currentPage, setCurrentPage] = useState<string>('welcome');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-center" style={{ color: '#CC0000' }}>
          Campus Night Market
        </h1>
        <p className="text-center text-gray-600 mt-4">
          Current Page: {currentPage}
        </p>
      </div>
    </div>
  );
}

export default App;