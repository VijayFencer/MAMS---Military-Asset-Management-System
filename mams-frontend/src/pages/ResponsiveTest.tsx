import React from "react";

const ResponsiveTest: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Responsive Test Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 lg:p-6">
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">Responsive Design Test</h1>
        <p className="text-sm lg:text-base text-gray-600">This page tests the responsive design across different screen sizes</p>
      </div>

      {/* Responsive Grid Test */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 lg:p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Grid Layout Test</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
            <div key={item} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="font-medium text-gray-900 mb-2">Card {item}</h3>
              <p className="text-sm text-gray-600">This card should adapt to different screen sizes</p>
            </div>
          ))}
        </div>
      </div>

      {/* Responsive Text Test */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 lg:p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Text Responsiveness Test</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm lg:text-base font-medium text-gray-900 mb-2">Small Text</h3>
            <p className="text-xs lg:text-sm text-gray-600">This text should be smaller on mobile devices</p>
          </div>
          <div>
            <h3 className="text-base lg:text-lg font-medium text-gray-900 mb-2">Medium Text</h3>
            <p className="text-sm lg:text-base text-gray-600">This text should be medium sized</p>
          </div>
          <div>
            <h3 className="text-lg lg:text-xl font-medium text-gray-900 mb-2">Large Text</h3>
            <p className="text-base lg:text-lg text-gray-600">This text should be larger on desktop</p>
          </div>
        </div>
      </div>

      {/* Responsive Button Test */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 lg:p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Button Responsiveness Test</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <button className="px-3 lg:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm lg:text-base">
            Small Button
          </button>
          <button className="px-4 lg:px-6 py-2 lg:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm lg:text-base">
            Medium Button
          </button>
          <button className="px-6 lg:px-8 py-3 lg:py-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-base lg:text-lg">
            Large Button
          </button>
        </div>
      </div>

      {/* Responsive Form Test */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 lg:p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Form Responsiveness Test</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Input 1</label>
            <input
              type="text"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-sm lg:text-base"
              placeholder="Responsive input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Input 2</label>
            <input
              type="text"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-sm lg:text-base"
              placeholder="Responsive input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Input 3</label>
            <input
              type="text"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-sm lg:text-base"
              placeholder="Responsive input"
            />
          </div>
        </div>
      </div>

      {/* Screen Size Indicator */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 lg:p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Screen Size</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-red-100 p-3 rounded-lg">
            <p className="text-sm font-medium text-red-800">Mobile (xs)</p>
            <p className="text-xs text-red-600">Hidden on larger screens</p>
          </div>
          <div className="bg-yellow-100 p-3 rounded-lg">
            <p className="text-sm font-medium text-yellow-800">Small (sm)</p>
            <p className="text-xs text-yellow-600">640px and up</p>
          </div>
          <div className="bg-green-100 p-3 rounded-lg">
            <p className="text-sm font-medium text-green-800">Large (lg)</p>
            <p className="text-xs text-green-600">1024px and up</p>
          </div>
          <div className="bg-blue-100 p-3 rounded-lg">
            <p className="text-sm font-medium text-blue-800">Extra Large (xl)</p>
            <p className="text-xs text-blue-600">1280px and up</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResponsiveTest;
