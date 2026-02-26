/**
 * FormIconSelector Tests
 * TDD approach: Write tests first, then implement
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormIconSelector } from './FormIconSelector';
import type { FormWidgetPosition } from '../../types/investigator-form';

describe('FormIconSelector', () => {
  const mockCogPosition: FormWidgetPosition = {
    x: 100,
    y: 100,
    width: 50,
    height: 50,
  };

  const mockBrainPosition: FormWidgetPosition = {
    x: 200,
    y: 100,
    width: 50,
    height: 50,
  };

  it('renders two clickable buttons for COG and BRAIN', () => {
    const onChange = vi.fn();
    render(
      <FormIconSelector
        cogPosition={mockCogPosition}
        brainPosition={mockBrainPosition}
        value={null}
        onChange={onChange}
      />
    );

    const cogButton = screen.getByLabelText(/robot.*cog/i);
    const brainButton = screen.getByLabelText(/human.*brain/i);

    expect(cogButton).toBeInTheDocument();
    expect(brainButton).toBeInTheDocument();
  });

  it('calls onChange with "robot" when COG button is clicked', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(
      <FormIconSelector
        cogPosition={mockCogPosition}
        brainPosition={mockBrainPosition}
        value={null}
        onChange={onChange}
      />
    );

    const cogButton = screen.getByLabelText(/robot.*cog/i);
    await user.click(cogButton);

    expect(onChange).toHaveBeenCalledWith('robot');
  });

  it('calls onChange with "human" when BRAIN button is clicked', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(
      <FormIconSelector
        cogPosition={mockCogPosition}
        brainPosition={mockBrainPosition}
        value={null}
        onChange={onChange}
      />
    );

    const brainButton = screen.getByLabelText(/human.*brain/i);
    await user.click(brainButton);

    expect(onChange).toHaveBeenCalledWith('human');
  });

  it('shows hand-drawn circle only when COG (robot) is selected', () => {
    const onChange = vi.fn();
    const { container } = render(
      <FormIconSelector
        cogPosition={mockCogPosition}
        brainPosition={mockBrainPosition}
        value="robot"
        onChange={onChange}
      />
    );

    const circles = container.querySelectorAll('svg');
    expect(circles).toHaveLength(1);
  });

  it('shows hand-drawn circle only when BRAIN (human) is selected', () => {
    const onChange = vi.fn();
    const { container } = render(
      <FormIconSelector
        cogPosition={mockCogPosition}
        brainPosition={mockBrainPosition}
        value="human"
        onChange={onChange}
      />
    );

    const circles = container.querySelectorAll('svg');
    expect(circles).toHaveLength(1);
  });

  it('shows no circle when nothing is selected', () => {
    const onChange = vi.fn();
    const { container } = render(
      <FormIconSelector
        cogPosition={mockCogPosition}
        brainPosition={mockBrainPosition}
        value={null}
        onChange={onChange}
      />
    );

    const circles = container.querySelectorAll('svg');
    expect(circles).toHaveLength(0);
  });

  it('positions COG button correctly', () => {
    const onChange = vi.fn();
    render(
      <FormIconSelector
        cogPosition={mockCogPosition}
        brainPosition={mockBrainPosition}
        value={null}
        onChange={onChange}
      />
    );

    const cogButton = screen.getByLabelText(/robot.*cog/i);
    expect(cogButton).toHaveStyle({
      position: 'absolute',
      left: '100px',
      top: '100px',
      width: '50px',
      height: '50px',
    });
  });

  it('positions BRAIN button correctly', () => {
    const onChange = vi.fn();
    render(
      <FormIconSelector
        cogPosition={mockCogPosition}
        brainPosition={mockBrainPosition}
        value={null}
        onChange={onChange}
      />
    );

    const brainButton = screen.getByLabelText(/human.*brain/i);
    expect(brainButton).toHaveStyle({
      position: 'absolute',
      left: '200px',
      top: '100px',
      width: '50px',
      height: '50px',
    });
  });

  it('disables buttons when disabled prop is true', () => {
    const onChange = vi.fn();
    render(
      <FormIconSelector
        cogPosition={mockCogPosition}
        brainPosition={mockBrainPosition}
        value={null}
        onChange={onChange}
        disabled={true}
      />
    );

    const cogButton = screen.getByLabelText(/robot.*cog/i);
    const brainButton = screen.getByLabelText(/human.*brain/i);

    expect(cogButton).toBeDisabled();
    expect(brainButton).toBeDisabled();
  });

  it('buttons are visible and interactive (not transparent)', () => {
    const onChange = vi.fn();
    render(
      <FormIconSelector
        cogPosition={mockCogPosition}
        brainPosition={mockBrainPosition}
        value={null}
        onChange={onChange}
      />
    );

    const cogButton = screen.getByLabelText(/robot.*cog/i);
    const brainButton = screen.getByLabelText(/human.*brain/i);

    // Buttons should be button elements (not divs) and be enabled
    expect(cogButton.tagName).toBe('BUTTON');
    expect(brainButton.tagName).toBe('BUTTON');
    expect(cogButton).not.toBeDisabled();
    expect(brainButton).not.toBeDisabled();
  });
});
