import React, { useState } from 'react';
import SuggestionsList from '@/components/suggestions/SuggestionsList';
import SuggestionForm from '@/components/suggestions/SuggestionForm';
import { Button } from '@/components/ui/button';

export default function SuggestionsPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'approved' | 'pending' | 'completed'>('all');
  const [showForm, setShowForm] = useState(false);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Suggestions</h1>
        <Button 
          onClick={() => setShowForm(!showForm)}
          className="bg-spring text-black px-6 py-2 rounded-full border-2 border-black"
        >
          {showForm ? 'Hide Form' : 'Submit Suggestion'}
        </Button>
      </div>
      
      {/* Suggestion form */}
      {showForm && (
        <div className="mb-12">
          <SuggestionForm onSuccess={() => setShowForm(false)} />
        </div>
      )}
      
      {/* Tabs for filtering */}
      <div className="flex border-b mb-8">
        <button
          className={`px-4 py-2 ${activeTab === 'all' ? 'border-b-2 border-blue-500 font-semibold' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All Suggestions
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'approved' ? 'border-b-2 border-blue-500 font-semibold' : ''}`}
          onClick={() => setActiveTab('approved')}
        >
          Approved
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'pending' ? 'border-b-2 border-blue-500 font-semibold' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          Pending
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'completed' ? 'border-b-2 border-blue-500 font-semibold' : ''}`}
          onClick={() => setActiveTab('completed')}
        >
          Completed
        </button>
      </div>
      
      {/* Suggestions list */}
      <SuggestionsList 
        status={activeTab === 'all' ? undefined : activeTab}
        limit={20}
      />
      
      {/* Additional information section */}
      <section className="mt-16 bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6">About Suggestions</h2>
        <p className="text-gray-700 mb-4">
          We value your input! Use this page to submit suggestions for improving our platform.
          Our team reviews all suggestions and will provide feedback on implementation plans.
        </p>
        <p className="text-gray-700 mb-4">
          Approved suggestions will be added to our development roadmap, and you'll be notified
          when your suggestion is implemented.
        </p>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border border-gray-200 rounded p-4">
            <h3 className="font-semibold mb-2">Submit</h3>
            <p className="text-sm text-gray-600">
              Share your ideas for new features or improvements to existing ones.
            </p>
          </div>
          <div className="border border-gray-200 rounded p-4">
            <h3 className="font-semibold mb-2">Review</h3>
            <p className="text-sm text-gray-600">
              Our team reviews all suggestions and provides feedback.
            </p>
          </div>
          <div className="border border-gray-200 rounded p-4">
            <h3 className="font-semibold mb-2">Implement</h3>
            <p className="text-sm text-gray-600">
              Approved suggestions are added to our development roadmap.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
} 