
import React from 'react';
import { useParams } from 'react-router-dom';
import MainLayout from '@/components/Layout/MainLayout';

const Content = () => {
  const { businessId } = useParams<{ businessId: string }>();

  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Content for Business {businessId}</h1>
        <div className="bg-white shadow overflow-hidden rounded-lg p-6">
          <p className="text-gray-600 mb-4">
            This page displays content for the selected business.
          </p>
          <div className="mt-6 border-t border-gray-200 pt-4">
            <h3 className="text-lg font-medium">Example Content</h3>
            <ul className="mt-3 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((id) => (
                <li key={id} className="col-span-1 bg-white rounded-lg shadow divide-y divide-gray-200">
                  <div className="p-4">
                    <h4 className="text-md font-medium">Content Item {id}</h4>
                    <p className="text-sm text-gray-500">Example content description</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Content;
