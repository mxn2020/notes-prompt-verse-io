import React from 'react';
import { useForm } from 'react-hook-form';
import { NoteType, Note } from '../../types';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Select from '../ui/Select';
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
    switch (field.type) {
      case 'text':
        return (
          <Input
            key={field.id}
            label={field.label}
            placeholder={field.placeholder}
            defaultValue={initialValues[field.name] || field.defaultValue || ''}
            error={errors[field.name]?.message}
            {...register(field.name, { required: field.required ? `${field.label} is required` : false })}
          />
        );
      case 'textarea':
        return (
          <Textarea
            key={field.id}
            label={field.label}
            placeholder={field.placeholder}
            defaultValue={initialValues[field.name] || field.defaultValue || ''}
            error={errors[field.name]?.message}
            {...register(field.name, { required: field.required ? `${field.label} is required` : false })}
          />
        );
      case 'select':
        return (
          <Select
            key={field.id}
            label={field.label}
            options={field.options || []}
            defaultValue={initialValues[field.name] || field.defaultValue || ''}
            error={errors[field.name]?.message}
            {...register(field.name, { required: field.required ? `${field.label} is required` : false })}
          />
        );
      case 'date':
        return (
          <Input
            key={field.id}
            type="date"
            label={field.label}
            defaultValue={initialValues[field.name] || field.defaultValue || ''}
            error={errors[field.name]?.message}
            {...register(field.name, { required: field.required ? `${field.label} is required` : false })}
          />
        );
      // Additional field types would be added here
      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-4 sm:p-6">
        <div className="mb-4 pb-4 border-b border-neutral-200">
          <h2 className="text-xl font-medium text-neutral-900">{initialValues.id ? 'Edit' : 'New'} {noteType.name}</h2>
          <p className="text-sm text-neutral-500">{noteType.description}</p>
        </div>

        <div className="space-y-4">
          {noteType.fields.map((field) => renderField(field))}
        </div>

        <div className="flex items-center justify-end space-x-3 mt-6 pt-4 border-t border-neutral-200">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            icon={<X className="h-4 w-4" />}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            icon={<Save className="h-4 w-4" />}
          >
            Save Note
          </Button>
        </div>
      </div>
    </form>
  );
};

export default NoteForm;