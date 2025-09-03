import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { letterApi } from '../lib/api';
import { Group, LetterRequest } from '../types';

interface LetterModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: Group;
}

export default function LetterModal({ isOpen, onClose, group }: LetterModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLetter, setGeneratedLetter] = useState<string>('');
  const [showLetter, setShowLetter] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<LetterRequest>({
    defaultValues: {
      groupId: group.groupId,
      capPct: 3,
      termMonths: 24,
      noticeDays: 30,
      contactEmail: '',
      contactPhone: ''
    }
  });

  const onSubmit = async (data: LetterRequest) => {
    setIsGenerating(true);
    try {
      const response = await letterApi.generateLetter(data);
      if (response.ok && response.data) {
        setGeneratedLetter(response.data.generatedText);
        setShowLetter(true);
        toast.success('Letter generated successfully!');
      } else {
        toast.error(response.message || 'Failed to generate letter');
      }
    } catch (error) {
      console.error('Error generating letter:', error);
      toast.error('Failed to generate letter. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClose = () => {
    setShowLetter(false);
    setGeneratedLetter('');
    reset();
    onClose();
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedLetter);
      toast.success('Letter copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy:', error);
      toast.error('Failed to copy letter');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Generate Proposal Letter
            </h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <span className="sr-only">Close</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {!showLetter ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-md">
                <h4 className="font-medium text-gray-900 mb-2">Group: {group.label}</h4>
                <p className="text-sm text-gray-600">
                  {group.groupSize} households • Avg rent: {new Intl.NumberFormat('ko-KR').format(group.avgRentKrw)} KRW
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Cap Percentage *
                  </label>
                  <input
                    type="number"
                    {...register('capPct', { 
                      required: 'Cap percentage is required',
                      min: { value: 0, message: 'Must be non-negative' },
                      max: { value: 100, message: 'Must not exceed 100%' }
                    })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                  {errors.capPct && (
                    <p className="mt-1 text-sm text-red-600">{errors.capPct.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Term (Months) *
                  </label>
                  <input
                    type="number"
                    {...register('termMonths', { 
                      required: 'Term is required',
                      min: { value: 1, message: 'Must be at least 1 month' }
                    })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                  {errors.termMonths && (
                    <p className="mt-1 text-sm text-red-600">{errors.termMonths.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Notice Days *
                </label>
                <input
                  type="number"
                  {...register('noticeDays', { 
                    required: 'Notice days is required',
                    min: { value: 1, message: 'Must be at least 1 day' }
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
                {errors.noticeDays && (
                  <p className="mt-1 text-sm text-red-600">{errors.noticeDays.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Contact Email *
                </label>
                <input
                  type="email"
                  {...register('contactEmail', { 
                    required: 'Contact email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="team@hack.com"
                />
                {errors.contactEmail && (
                  <p className="mt-1 text-sm text-red-600">{errors.contactEmail.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Contact Phone *
                </label>
                <input
                  type="tel"
                  {...register('contactPhone', { required: 'Contact phone is required' })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="010-0000-0000"
                />
                {errors.contactPhone && (
                  <p className="mt-1 text-sm text-red-600">{errors.contactPhone.message}</p>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? 'Generating...' : 'Generate Letter'}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-md">
                <h4 className="font-medium text-gray-900 mb-2">Generated Letter</h4>
                <div className="whitespace-pre-wrap text-sm text-gray-700 bg-white p-4 rounded border max-h-96 overflow-y-auto">
                  {generatedLetter}
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={copyToClipboard}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Copy Letter
                </button>
                <button
                  onClick={() => setShowLetter(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Edit Parameters
                </button>
                <button
                  onClick={handleClose}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}