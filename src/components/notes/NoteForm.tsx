import React from 'react';
import { useForm } from 'react-hook-form';
import { NoteType, Note } from '../../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, X } from 'lucide-react';

interface NoteFormProps {
  noteType: NoteType;
  initialValues?: Partial<Note>;
  onSubmit: (data: Record<string, any>) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const NoteForm: React.FC<NoteFormProps> = ({
  noteType,
  initialValues = {},
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: initialValues,
  });

  const renderField = (field: any) => {
    const fieldName = field.name as string;
    switch (field.type) {
      case 'text':
        return (
          <div key={field.id}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label}
            </label>
            <Input
              placeholder={field.placeholder}
              defaultValue={(initialValues as any)[fieldName] || field.defaultValue || ''}
              {...register(fieldName as any, { required: field.required ? `${field.label} is required` : false })}
            />
            {(errors as any)[fieldName] && (
              <p className="mt-1 text-sm text-red-600">{(errors as any)[fieldName]?.message}</p>
            )}
          </div>
        );
      case 'textarea':
        return (
          <div key={field.id}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label}
            </label>
            <Textarea
              placeholder={field.placeholder}
              defaultValue={(initialValues as any)[fieldName] || field.defaultValue || ''}
              {...register(fieldName as any, { required: field.required ? `${field.label} is required` : false })}
            />
            {(errors as any)[fieldName] && (
              <p className="mt-1 text-sm text-red-600">{(errors as any)[fieldName]?.message}</p>
            )}
          </div>
        );
      case 'select':
        return (
          <div key={field.id}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label}
            </label>
            <Select
              defaultValue={(initialValues as any)[fieldName] || field.defaultValue || ''}
              {...register(fieldName as any, { required: field.required ? `${field.label} is required` : false })}
            >
              <SelectTrigger>
                <SelectValue placeholder={field.placeholder || `Select ${field.label}`} />
              </SelectTrigger>
              <SelectContent>
                {(field.options || []).map((option: string) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {(errors as any)[fieldName] && (
              <p className="mt-1 text-sm text-red-600">{(errors as any)[fieldName]?.message}</p>
            )}
          </div>
        );
      case 'date':
        return (
          <div key={field.id}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label}
            </label>
            <Input
              type="date"
              defaultValue={(initialValues as any)[fieldName] || field.defaultValue || ''}
              {...register(fieldName as any, { required: field.required ? `${field.label} is required` : false })}
            />
            {(errors as any)[fieldName] && (
              <p className="mt-1 text-sm text-red-600">{(errors as any)[fieldName]?.message}</p>
            )}
          </div>
        );
      // Additional field types would be added here
      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="mb-4 pb-4 border-b border-gray-200">
          <h2 className="text-xl font-medium text-gray-900">{initialValues.id ? 'Edit' : 'New'} {noteType.name}</h2>
          <p className="text-sm text-gray-500">{noteType.description}</p>
        </div>

        <div className="space-y-4">
          {noteType.fields.map((field) => renderField(field))}
        </div>

        <div className="flex items-center justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            <X className="h-4 w-4" />
            Cancel
          </Button>
          <Button
            type="submit"
            variant="default"
            disabled={isSubmitting}
          >
            <Save className="h-4 w-4" />
            {isSubmitting ? 'Saving...' : 'Save Note'}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default NoteForm;