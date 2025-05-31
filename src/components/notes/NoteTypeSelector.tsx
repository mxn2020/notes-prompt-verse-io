import React from 'react';
import { NoteType } from '../../types';
import { Layers, FilePlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface NoteTypeSelectorProps {
  noteTypes: NoteType[];
  onSelect: (noteType: NoteType) => void;
}

const NoteTypeSelector: React.FC<NoteTypeSelectorProps> = ({ noteTypes, onSelect }) => {
  const navigate = useNavigate();

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-neutral-900">Choose Note Type</h2>
        <button
          onClick={() => navigate('/note-types')}
          className="text-primary-600 text-sm font-medium hover:text-primary-700 flex items-center"
        >
          <Layers className="h-4 w-4 mr-1" />
          Manage Types
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {noteTypes.map((noteType) => (
          <div
            key={noteType.id}
            onClick={() => onSelect(noteType)}
            className="p-4 border border-neutral-200 rounded-lg cursor-pointer hover:border-primary-500 hover:shadow-sm transition-all duration-200 bg-white"
          >
            <div className="flex items-start mb-2">
              <div className="p-2 rounded-md bg-primary-50 text-primary-600 mr-3">
                {/* Lucide icon would be dynamically generated in a real app */}
                <FilePlus className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium text-neutral-900">{noteType.name}</h3>
                <p className="text-xs text-neutral-500">{noteType.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NoteTypeSelector;