import React, { useState, useEffect } from 'react';
import { Plus, Settings, Edit, Trash, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { NoteType, NoteTypeField } from '../types';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { systemNoteTypes, basicNoteType } from '../data/systemNoteTypes';
import { api } from '../utils/api';

const FIELD_TYPES = [
  { value: 'text', label: 'Text' },
  { value: 'textarea', label: 'Text Area' },
  { value: 'select', label: 'Select' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'date', label: 'Date' },
  { value: 'number', label: 'Number' },
  { value: 'radio', label: 'Radio' },
  { value: 'color', label: 'Color' },
];

const ICONS = [
  'file-text',
  'calendar-check',
  'users',
  'bug',
  'lightbulb',
  'book-open',
  'target',
  'message-square',
  'presentation',
  'briefcase',
  'shopping-cart',
  'map',
  'palette',
];

const NoteTypes: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [noteTypes, setNoteTypes] = useState<NoteType[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customNoteTypes, setCustomNoteTypes] = useState<NoteType[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: 'file-text',
    fields: [] as NoteTypeField[],
  });

  useEffect(() => {
    const fetchNoteTypes = async () => {
      try {
        setIsLoading(true);
        
        // Fetch custom note types from API
        const response = await api.get('/note-types');
        
        if (response.data.success) {
          setCustomNoteTypes(response.data.data);
        }
        
        // Add system note types
        const allNoteTypes = [
          basicNoteType,
          ...systemNoteTypes
        ] as NoteType[];
        
        setNoteTypes(allNoteTypes);
      } catch (error) {
        console.error('Error fetching note types:', error);
        toast.error('Failed to fetch note types. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchNoteTypes();
  }, []);

  const addField = () => {
    const newField: NoteTypeField = {
      id: crypto.randomUUID(),
      name: '',
      label: '',
      type: 'text',
      placeholder: '',
      required: false,
    };

    setFormData(prev => ({
      ...prev,
      fields: [...prev.fields, newField],
    }));
  };

  const removeField = (fieldId: string) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.filter(field => field.id !== fieldId),
    }));
  };

  const updateField = (fieldId: string, updates: Partial<NoteTypeField>) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.map(field => 
        field.id === fieldId ? { ...field, ...updates } : field
      ),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Note type name is required');
      return;
    }

    if (formData.fields.length === 0) {
      toast.error('At least one field is required');
      return;
    }

    // Validate fields
    const invalidFields = formData.fields.filter(
      field => !field.name.trim() || !field.label.trim()
    );

    if (invalidFields.length > 0) {
      toast.error('All fields must have a name and label');
      return;
    }

    try {
      setIsSubmitting(true);

      const noteTypeData = {
        ...formData,
        id: crypto.randomUUID(),
        isSystem: false,
      };

      const response = await api.post('/note-types', noteTypeData);

      if (response.data.success) {
        setCustomNoteTypes(prev => [...prev, response.data.data]);
        setShowCreateForm(false);
        setFormData({
          name: '',
          description: '',
          icon: 'file-text',
          fields: [],
        });
        toast.success('Note type created successfully');
      } else {
        toast.error(response.data.error || 'Failed to create note type');
      }
    } catch (error) {
      console.error('Error creating note type:', error);
      toast.error('Failed to create note type. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (noteTypeId: string) => {
    if (!window.confirm('Are you sure you want to delete this note type? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await api.delete(`/note-types/${noteTypeId}`);

      if (response.data.success) {
        setCustomNoteTypes(prev => 
          prev.filter(type => type.id !== noteTypeId)
        );
        toast.success('Note type deleted successfully');
      } else {
        toast.error(response.data.error || 'Failed to delete note type');
      }
    } catch (error) {
      console.error('Error deleting note type:', error);
      toast.error('Failed to delete note type. Please try again.');
    }
  };

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
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4" />
            Create Custom Type
          </Button>
        </div>
      </div>

      {showCreateForm && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-medium text-gray-900">Create Custom Note Type</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCreateForm(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="name">Note Type Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Project Update"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="icon">Icon</Label>
                <Select
                  value={formData.icon}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, icon: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an icon" />
                  </SelectTrigger>
                  <SelectContent>
                    {ICONS.map((icon) => (
                      <SelectItem key={icon} value={icon}>
                        {icon}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the purpose of this note type..."
                className="mt-1"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <Label>Fields</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addField}
                >
                  <Plus className="h-4 w-4" />
                  Add Field
                </Button>
              </div>

              <div className="space-y-4">
                {formData.fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="bg-gray-50 p-4 rounded-md border border-gray-200"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="text-sm font-medium text-gray-700">
                        Field {index + 1}
                      </h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeField(field.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`field-${field.id}-name`}>Field Name</Label>
                        <Input
                          id={`field-${field.id}-name`}
                          value={field.name}
                          onChange={(e) => updateField(field.id, { name: e.target.value })}
                          placeholder="e.g., status"
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor={`field-${field.id}-label`}>Display Label</Label>
                        <Input
                          id={`field-${field.id}-label`}
                          value={field.label}
                          onChange={(e) => updateField(field.id, { label: e.target.value })}
                          placeholder="e.g., Status"
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor={`field-${field.id}-type`}>Field Type</Label>
                        <Select
                          value={field.type}
                          onValueChange={(value) => updateField(field.id, { type: value as any })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select field type" />
                          </SelectTrigger>
                          <SelectContent>
                            {FIELD_TYPES.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor={`field-${field.id}-placeholder`}>Placeholder</Label>
                        <Input
                          id={`field-${field.id}-placeholder`}
                          value={field.placeholder || ''}
                          onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                          placeholder="Enter placeholder text..."
                          className="mt-1"
                        />
                      </div>

                      {(field.type === 'select' || field.type === 'radio') && (
                        <div className="md:col-span-2">
                          <Label htmlFor={`field-${field.id}-options`}>Options</Label>
                          <Textarea
                            id={`field-${field.id}-options`}
                            value={field.options?.join('\n') || ''}
                            onChange={(e) => updateField(field.id, {
                              options: e.target.value.split('\n').map(opt => opt.trim()).filter(Boolean)
                            })}
                            placeholder="Enter options, one per line..."
                            className="mt-1"
                          />
                        </div>
                      )}

                      <div className="md:col-span-2">
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={field.required || false}
                            onChange={(e) => updateField(field.id, { required: e.target.checked })}
                            className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                          />
                          <span className="text-sm text-gray-700">Required field</span>
                        </label>
                      </div>
                    </div>
                  </div>
                ))}

                {formData.fields.length === 0 && (
                  <div className="text-center py-8 bg-gray-50 rounded-md border border-dashed border-gray-200">
                    <p className="text-gray-500">No fields added yet</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addField}
                      className="mt-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add First Field
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateForm(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating...' : 'Create Note Type'}
              </Button>
            </div>
          </form>
        </div>
      )}

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

        {customNoteTypes.length === 0 ? (
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
            <Button onClick={() => setShowCreateForm(true)}>
              Create Custom Type
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {customNoteTypes.map((noteType) => (
              <div key={noteType.id} className="p-4 sm:p-6 hover:bg-gray-50">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                  <div className="flex items-start">
                    <div className="p-2 rounded-md bg-primary-50 text-primary-600 mr-3">
                      <Settings className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{noteType.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">{noteType.description}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {noteType.fields.map((field) => (
                          <span
                            key={field.id}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                          >
                            {field.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex mt-4 sm:mt-0 space-x-2">
                    <Link to={`/notes/new?type=${noteType.id}`}>
                      <Button variant="outline" size="sm">
                        Use Template
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(noteType.id)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NoteTypes;