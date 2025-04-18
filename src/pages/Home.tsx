
import React from 'react';
import MainLayout from '@/components/Layout/MainLayout';

const Home = () => {
  return (
    <MainLayout>
      <div className="space-y-8">
        <h1 className="text-4xl font-bold">Welcome to AdGenesis AI</h1>
        <p className="text-xl text-gray-600">
          Generate high-performing ads with the power of AI
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-medium mb-2">Create Content</h3>
            <p className="text-gray-600">Generate ad content optimized for your business</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-medium mb-2">Connect Platforms</h3>
            <p className="text-gray-600">Integrate with your advertising platforms</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-medium mb-2">Analyze Performance</h3>
            <p className="text-gray-600">Track and optimize your ad performance</p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Home;
