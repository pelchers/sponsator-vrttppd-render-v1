import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { createSuggestion, SuggestionFormData } from '@/api/suggestions';

const categories = [
  { value: 'feature', label: 'New Feature' },
  { value: 'improvement', label: 'Improvement' },
  { value: 'bug', label: 'Bug Fix' },
  { value: 'design', label: 'Design Change' },
  { value: 'other', label: 'Other' }
];

interface SuggestionFormProps {
  onSuccess?: () => void;
}

export default function SuggestionForm({ onSuccess }: SuggestionFormProps) {
  const [formData, setFormData] = useState<SuggestionFormData>({
    title: '',
    description: '',
    category: 'feature',
    is_public: true
  });
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      await createSuggestion(formData);
      setSuccess(true);
      setFormData({
        title: '',
        description: '',
        category: 'feature',
        is_public: true
      });
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError('Failed to submit suggestion. Please try again.');
      console.error('Error submitting suggestion:', err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Submit a Suggestion</h2>
      
      {success ? (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          Thank you for your suggestion! Our team will review it soon.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Brief title for your suggestion"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={5}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Describe your suggestion in detail..."
            />
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_public"
              name="is_public"
              checked={formData.is_public}
              onChange={handleCheckboxChange}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
            <label htmlFor="is_public" className="ml-2 block text-sm text-gray-700">
              Make this suggestion visible to other users
            </label>
          </div>
          
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={loading}
              className="bg-spring text-black px-6 py-2 rounded-full border-2 border-black"
            >
              {loading ? 'Submitting...' : 'Submit Suggestion'}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
} 