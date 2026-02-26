import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { InducerPuzzleDisplay } from '../../../src/components/game/InducerPuzzleDisplay';

describe('InducerPuzzleDisplay Component', () => {
  const mockInducerProps = {
    mazeImage: '/assets/mazes/smalltalk-010.png',
    question: 'What is the solution path through the maze?',
    expectedSolution: 'ABCD',
  };

  it('should display maze image', () => {
    render(<InducerPuzzleDisplay {...mockInducerProps} />);

    const img = screen.getByAltText(/Inducer Pattern/i);
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/assets/mazes/smalltalk-010.png');
  });

  it('should show puzzle question', () => {
    render(<InducerPuzzleDisplay {...mockInducerProps} />);
    expect(screen.getByText(/What is the solution path through the maze/i)).toBeInTheDocument();
  });

  it('should have solution input field', () => {
    render(<InducerPuzzleDisplay {...mockInducerProps} />);

    const input = screen.getByLabelText(/Your Solution/i);
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'text');
  });

  it('should accept solution input', () => {
    render(<InducerPuzzleDisplay {...mockInducerProps} />);

    const input = screen.getByLabelText(/Your Solution/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'ABCD' } });

    expect(input.value).toBe('ABCD');
  });

  it('should have a submit button', () => {
    render(<InducerPuzzleDisplay {...mockInducerProps} />);

    const submitButton = screen.getByRole('button', { name: /Submit/i });
    expect(submitButton).toBeInTheDocument();
  });

  it('should validate correct solution', () => {
    render(<InducerPuzzleDisplay {...mockInducerProps} />);

    const input = screen.getByLabelText(/Your Solution/i);
    fireEvent.change(input, { target: { value: 'ABCD' } });

    const submitButton = screen.getByRole('button', { name: /Submit/i });
    fireEvent.click(submitButton);

    expect(screen.getByText(/Correct/i)).toBeInTheDocument();
  });

  it('should show feedback for incorrect solution', () => {
    render(<InducerPuzzleDisplay {...mockInducerProps} />);

    const input = screen.getByLabelText(/Your Solution/i);
    fireEvent.change(input, { target: { value: 'WXYZ' } });

    const submitButton = screen.getByRole('button', { name: /Submit/i });
    fireEvent.click(submitButton);

    expect(screen.getByText(/Incorrect/i)).toBeInTheDocument();
  });

  it('should be case-insensitive for solution validation', () => {
    render(<InducerPuzzleDisplay {...mockInducerProps} />);

    const input = screen.getByLabelText(/Your Solution/i);
    fireEvent.change(input, { target: { value: 'abcd' } });

    const submitButton = screen.getByRole('button', { name: /Submit/i });
    fireEvent.click(submitButton);

    expect(screen.getByText(/Correct/i)).toBeInTheDocument();
  });

  it('should call onSolutionSubmit callback when solution is submitted', () => {
    const onSolutionSubmit = vi.fn();
    render(<InducerPuzzleDisplay {...mockInducerProps} onSolutionSubmit={onSolutionSubmit} />);

    const input = screen.getByLabelText(/Your Solution/i);
    fireEvent.change(input, { target: { value: 'ABCD' } });

    const submitButton = screen.getByRole('button', { name: /Submit/i });
    fireEvent.click(submitButton);

    expect(onSolutionSubmit).toHaveBeenCalledWith('ABCD', true);
  });

  it('should call onSolutionSubmit with isCorrect=false for wrong answers', () => {
    const onSolutionSubmit = vi.fn();
    render(<InducerPuzzleDisplay {...mockInducerProps} onSolutionSubmit={onSolutionSubmit} />);

    const input = screen.getByLabelText(/Your Solution/i);
    fireEvent.change(input, { target: { value: 'WRONG' } });

    const submitButton = screen.getByRole('button', { name: /Submit/i });
    fireEvent.click(submitButton);

    expect(onSolutionSubmit).toHaveBeenCalledWith('WRONG', false);
  });

  it('should display title "Inducer Pattern"', () => {
    render(<InducerPuzzleDisplay {...mockInducerProps} />);
    expect(screen.getByText(/Inducer Pattern/i)).toBeInTheDocument();
  });

  it('should allow multiple submission attempts', () => {
    render(<InducerPuzzleDisplay {...mockInducerProps} />);

    const input = screen.getByLabelText(/Your Solution/i);
    const submitButton = screen.getByRole('button', { name: /Submit/i });

    // First attempt - wrong
    fireEvent.change(input, { target: { value: 'WXYZ' } });
    fireEvent.click(submitButton);
    expect(screen.getByText(/Incorrect/i)).toBeInTheDocument();

    // Second attempt - correct
    fireEvent.change(input, { target: { value: 'ABCD' } });
    fireEvent.click(submitButton);
    expect(screen.getByText(/Correct/i)).toBeInTheDocument();
  });

  it('should clear previous feedback when submitting new solution', () => {
    render(<InducerPuzzleDisplay {...mockInducerProps} />);

    const input = screen.getByLabelText(/Your Solution/i);
    const submitButton = screen.getByRole('button', { name: /Submit/i });

    // First submission
    fireEvent.change(input, { target: { value: 'WXYZ' } });
    fireEvent.click(submitButton);
    expect(screen.getByText(/Incorrect/i)).toBeInTheDocument();

    // Second submission should replace feedback
    fireEvent.change(input, { target: { value: 'ABCD' } });
    fireEvent.click(submitButton);

    // Should show new feedback
    expect(screen.getByText(/Correct/i)).toBeInTheDocument();
    // Old feedback should be replaced (only one feedback element)
    const feedbackElements = screen.queryAllByText(/Correct|Incorrect/i);
    expect(feedbackElements.length).toBe(1);
  });

  it('should not submit empty solution', () => {
    const onSolutionSubmit = vi.fn();
    render(<InducerPuzzleDisplay {...mockInducerProps} onSolutionSubmit={onSolutionSubmit} />);

    const submitButton = screen.getByRole('button', { name: /Submit/i });
    fireEvent.click(submitButton);

    // Should not call callback with empty string
    expect(onSolutionSubmit).not.toHaveBeenCalled();
  });
});
