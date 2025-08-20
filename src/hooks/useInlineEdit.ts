import { useState } from 'react';

export interface UseInlineEditOptions {
  onSave: (value: string) => void;
  onCancel?: () => void;
  validateValue?: (value: string) => boolean;
}

export interface UseInlineEditReturn {
  isEditing: boolean;
  editValue: string;
  setEditValue: (value: string) => void;
  handleEdit: (currentValue: string) => void;
  handleSave: () => void;
  handleCancel: () => void;
  handleKeyPress: (e: React.KeyboardEvent) => void;
}

export const useInlineEdit = ({
  onSave,
  onCancel,
  validateValue = (value: string) => value.trim().length > 0,
}: UseInlineEditOptions): UseInlineEditReturn => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');

  const handleEdit = (currentValue: string) => {
    setIsEditing(true);
    setEditValue(currentValue);
  };

  const handleSave = () => {
    if (validateValue(editValue)) {
      onSave(editValue.trim());
    }
    setIsEditing(false);
    setEditValue('');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditValue('');
    onCancel?.();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return {
    isEditing,
    editValue,
    setEditValue,
    handleEdit,
    handleSave,
    handleCancel,
    handleKeyPress,
  };
};