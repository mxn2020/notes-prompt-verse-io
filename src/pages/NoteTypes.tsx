import React, { useState, useEffect } from 'react';
import { Plus, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { NoteType } from '../types';
import { toast } from 'sonner';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { systemNoteTypes, basicNoteType } from '../data/systemNoteTypes';

const NoteTypes: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [noteTypes, setNoteTypes] = useState<NoteType[]>([]);

  useEffect(() => {
    const fetchNoteTypes = async () => {
      try {
        setIsLoading(true);
        
        // In a real app, we'd fetch from the API
        // For demo, use system note types with a delay to simulate API call
        setTimeout(() => {
          const allNoteTypes = [
            basicNoteType,
            ...systemNoteTypes
          ] as NoteType[];
          
          setNoteTypes(allNoteTypes);
          setIsLoading(false);
        }, 500);
      } catch (error) {
        console.error('Error fetching note types:', error);
        toast.error('Failed to fetch note types. Please try again.');
        setIsLoading(false);
      }
    };

    fetchNoteTypes();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Note Types</h1>
          <p className="text-gray-500">Manage and customize your note templates</p>
        </div>

        <div className="mt-4 sm:mt-0">
          <Button>
            <Plus className="h-4 w-4" />
            Create Custom Type
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">System Note Types</h2>
          <p className="text-gray-500 text-sm">
            These pre-defined note types are available to all users
          </p>
        </div>

        <div className="divide-y divide-gray-200">
          {noteTypes
            .filter(type => type.isSystem)
            .map((noteType) => (
              <div key={noteType.id} className="p-4 sm:p-6 hover:bg-gray-50">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                  <div className="flex items-start">
                    <div className="p-2 rounded-md bg-primary-50 text-primary-600 mr-3">
                      {/* In a real app, we'd render the actual icon */}
                      <Settings className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{noteType.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">{noteType.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex mt-4 sm:mt-0 space-x-2">
                    <Link to={`/notes/new?type=${noteType.id}`}>
                      <Button variant="outline" size="sm">
                        Use Template
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Custom Note Types</h2>
          <p className="text-gray-500 text-sm">
            Your custom note types that you've created
          </p>
        </div>

        <div className="p-8 text-center">
          <div className="text-gray-400 mb-4">
            <Plus className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No custom note types yet
          </h3>
          <p className="text-gray-500 mb-4">
            Create your first custom note type to customize your note-taking experience
          </p>
          <Button>Create Custom Type</Button>
        </div>
      </div>
    </div>
  );
};

export default NoteTypes;