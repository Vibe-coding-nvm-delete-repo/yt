import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import PromptMetrics from '../PromptMetrics';
import type { DetailedGenerationCost } from '@/types';

const mockCost: DetailedGenerationCost = {
  inputCost: 0.001234,
  outputCost: 0.002345,
  totalCost: 0.003579,
};

const mockProps = {
  modelName: 'gpt-4-vision-preview',
  promptText: 'This is a test prompt with exactly 50 characters!',
  cost: mockCost,
};

describe('PromptMetrics', () => {
  it('renders all metric sections', () => {
    render(<PromptMetrics {...mockProps} />);
    
    expect(screen.getByText('Generation Metrics')).toBeInTheDocument();
    expect(screen.getByText('Model')).toBeInTheDocument();
    expect(screen.getByText('Text Stats')).toBeInTheDocument();
    expect(screen.getByText('Input Cost')).toBeInTheDocument();
    expect(screen.getByText('Output Cost')).toBeInTheDocument();
    expect(screen.getByText('Total Generation Cost')).toBeInTheDocument();
  });

  it('displays model name correctly', () => {
    render(<PromptMetrics {...mockProps} />);
    
    expect(screen.getByText('gpt-4-vision-preview')).toBeInTheDocument();
  });

  it('calculates and displays text statistics correctly', () => {
    render(<PromptMetrics {...mockProps} />);
    
    // Character count: 50 characters
    // Token estimate: Math.ceil(50 / 3.75) = 14 tokens
    expect(screen.getByText('50 chars • 14 tokens')).toBeInTheDocument();
  });

  it('formats costs with 6 decimal places', () => {
    render(<PromptMetrics {...mockProps} />);
    
    expect(screen.getByText('$0.001234')).toBeInTheDocument(); // Input cost
    expect(screen.getByText('$0.002345')).toBeInTheDocument(); // Output cost
    expect(screen.getByText('$0.003579')).toBeInTheDocument(); // Total cost
  });

  it('handles zero costs correctly', () => {
    const zeroCost: DetailedGenerationCost = {
      inputCost: 0,
      outputCost: 0,
      totalCost: 0,
    };
    
    render(<PromptMetrics {...mockProps} cost={zeroCost} />);
    
    const zeroElements = screen.getAllByText('$0.000000');
    expect(zeroElements).toHaveLength(3); // Input, output, and total
  });

  it('handles large numbers in text stats', () => {
    const longText = 'a'.repeat(10000);
    
    render(<PromptMetrics {...mockProps} promptText={longText} />);
    
    // Should format numbers with commas
    expect(screen.getByText('10,000 chars • 2,667 tokens')).toBeInTheDocument();
  });

  it('handles very small costs', () => {
    const smallCost: DetailedGenerationCost = {
      inputCost: 0.000001,
      outputCost: 0.000002,
      totalCost: 0.000003,
    };
    
    render(<PromptMetrics {...mockProps} cost={smallCost} />);
    
    expect(screen.getByText('$0.000001')).toBeInTheDocument();
    expect(screen.getByText('$0.000002')).toBeInTheDocument();
    expect(screen.getByText('$0.000003')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <PromptMetrics {...mockProps} className="custom-class" />
    );
    
    const metricsDiv = container.firstChild as HTMLElement;
    expect(metricsDiv).toHaveClass('custom-class');
  });

  it('truncates long model names with title attribute', () => {
    const longModelName = 'very-long-model-name-that-should-be-truncated-in-display';
    
    render(<PromptMetrics {...mockProps} modelName={longModelName} />);
    
    const modelElement = screen.getByTitle(longModelName);
    expect(modelElement).toBeInTheDocument();
    expect(modelElement).toHaveClass('truncate');
  });

  it('calculates token estimation correctly for various text lengths', () => {
    const testCases = [
      { text: 'a', expectedTokens: 1 }, // Math.ceil(1 / 3.75) = 1
      { text: 'a'.repeat(3), expectedTokens: 1 }, // Math.ceil(3 / 3.75) = 1
      { text: 'a'.repeat(4), expectedTokens: 2 }, // Math.ceil(4 / 3.75) = 2
      { text: 'a'.repeat(100), expectedTokens: 27 }, // Math.ceil(100 / 3.75) = 27
    ];

    testCases.forEach(({ text, expectedTokens }) => {
      const { rerender } = render(<PromptMetrics {...mockProps} promptText={text} />);
      
      expect(screen.getByText(new RegExp(`${expectedTokens} tokens`))).toBeInTheDocument();
      
      // Clean up for next iteration
      rerender(<div />);
    });
  });

  it('displays input + output helper text', () => {
    render(<PromptMetrics {...mockProps} />);
    
    expect(screen.getByText('Input + Output')).toBeInTheDocument();
  });
});
