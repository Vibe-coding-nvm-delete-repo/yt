import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BestPracticeModal } from '../BestPracticeModal';
import type { BestPracticeCategory, BestPracticeType } from '@/types';

const defaultFormData = {
  name: '',
  description: '',
  leonardoAiLanguage: '',
  images: [],
  importance: 5,
  type: 'mandatory' as BestPracticeType,
  typeExplanation: '',
  category: 'words-phrases' as BestPracticeCategory,
};

const defaultProps = {
  isOpen: true,
  isEditing: false,
  formData: defaultFormData,
  onClose: jest.fn(),
  onSave: jest.fn(),
  onFormChange: jest.fn(),
  onImageUpload: jest.fn(),
  onRemoveImage: jest.fn(),
};

describe('BestPracticeModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not render when isOpen is false', () => {
    const { container } = render(
      <BestPracticeModal {...defaultProps} isOpen={false} />
    );
    
    expect(container.firstChild).toBeNull();
  });

  it('should render create mode title', () => {
    render(<BestPracticeModal {...defaultProps} />);
    expect(screen.getByText('Create Best Practice')).toBeInTheDocument();
  });

  it('should render edit mode title', () => {
    render(<BestPracticeModal {...defaultProps} isEditing={true} />);
    expect(screen.getByText('Edit Best Practice')).toBeInTheDocument();
  });

  it('should call onClose when close button clicked', () => {
    render(<BestPracticeModal {...defaultProps} />);
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]);
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('should update name input', () => {
    render(<BestPracticeModal {...defaultProps} />);
    const input = screen.getByPlaceholderText(/enter best practice name/i);
    fireEvent.change(input, { target: { value: 'Test' } });
    expect(defaultProps.onFormChange).toHaveBeenCalledWith({ name: 'Test' });
  });

  it('should update importance slider', () => {
    render(<BestPracticeModal {...defaultProps} />);
    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '8' } });
    expect(defaultProps.onFormChange).toHaveBeenCalledWith({ importance: 8 });
  });

  it('should display importance value', () => {
    render(<BestPracticeModal {...defaultProps} formData={{ ...defaultFormData, importance: 7 }} />);
    expect(screen.getByText('7')).toBeInTheDocument();
  });

  it('should render all form sections', () => {
    render(<BestPracticeModal {...defaultProps} />);
    expect(screen.getByText('Category *')).toBeInTheDocument();
    expect(screen.getByText('Name *')).toBeInTheDocument();
    expect(screen.getByText('Images')).toBeInTheDocument();
  });

  it('should call onSave when save clicked with valid data', () => {
    render(<BestPracticeModal {...defaultProps} formData={{ ...defaultFormData, name: 'Test' }} />);
    const saveButton = screen.getByText('Create');
    fireEvent.click(saveButton);
    expect(defaultProps.onSave).toHaveBeenCalled();
  });

  it('should call onClose when cancel clicked', () => {
    render(<BestPracticeModal {...defaultProps} />);
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('should show importance indicators', () => {
    render(<BestPracticeModal {...defaultProps} formData={{ ...defaultFormData, importance: 9 }} />);
    expect(screen.getByText(/high importance/i)).toBeInTheDocument();
  });
});
