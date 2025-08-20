import React from 'react';
import { useInlineEdit, type UseInlineEditOptions } from '../../hooks/useInlineEdit';

export interface InlineEditFieldProps extends Omit<UseInlineEditOptions, 'onSave'> {
  value: string;
  onSave: (value: string) => void;
  placeholder?: string;
  className?: string;
  editClassName?: string;
  displayClassName?: string;
  style?: React.CSSProperties;
}

export const InlineEditField: React.FC<InlineEditFieldProps> = ({
  value,
  onSave,
  placeholder = 'クリックして編集',
  className = '',
  editClassName = '',
  displayClassName = '',
  style,
  ...options
}) => {
  const {
    isEditing,
    editValue,
    setEditValue,
    handleEdit,
    handleSave,
    handleKeyPress,
  } = useInlineEdit({
    ...options,
    onSave,
  });

  if (isEditing) {
    return (
      <input
        type="text"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onKeyDown={handleKeyPress}
        onBlur={handleSave}
        className={`${className} ${editClassName}`}
        autoFocus
        placeholder={placeholder}
      />
    );
  }

  return (
    <div
      onClick={() => handleEdit(value)}
      className={`${className} ${displayClassName} cursor-pointer`}
      style={style}
    >
      {value || placeholder}
    </div>
  );
};