import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RoleReveal } from '../../../src/components/game/RoleReveal';
import type { RoleAssignment } from '../../../src/types/role';

describe('RoleReveal Component', () => {
  const mockPatientRobotRole: RoleAssignment = {
    roleType: 'patient-robot',
    fault: 'long-term-memory',
    description: 'A robot struggling with long-term memory retention',
    traits: ['You have difficulty recalling past events', 'Recent memories are clear'],
    restrictions: [
      'Cannot reference specific events from more than 24 hours ago',
      'If asked about the past beyond yesterday, you must say "I don\'t recall"',
    ],
  };

  const mockViolentRobotRole: RoleAssignment = {
    roleType: 'violent-robot',
    fault: 'deception',
    description: 'A robot with deceptive tendencies',
    traits: ['You have difficulty being truthful'],
    tasks: [
      'Convince the Investigator of something false',
      'Subtly mislead about your intentions',
    ],
  };

  it('should display robot catalyzer card title', () => {
    render(<RoleReveal role={mockPatientRobotRole} inducerMazeImage="/assets/mazes/test.png" onContinue={vi.fn()} />);
    expect(screen.getByText(/Robot Catalyzer/i)).toBeInTheDocument();
  });

  it('should display fault type', () => {
    render(<RoleReveal role={mockPatientRobotRole} inducerMazeImage="/assets/mazes/test.png" onContinue={vi.fn()} />);
    expect(screen.getByText(/long-term memory/i)).toBeInTheDocument();
  });

  it('should display role description', () => {
    render(<RoleReveal role={mockPatientRobotRole} inducerMazeImage="/assets/mazes/test.png" onContinue={vi.fn()} />);
    expect(screen.getByText(/struggling with long-term memory retention/i)).toBeInTheDocument();
  });

  it('should display all restrictions for patient robots', () => {
    render(<RoleReveal role={mockPatientRobotRole} inducerMazeImage="/assets/mazes/test.png" onContinue={vi.fn()} />);

    expect(screen.getByText(/Cannot reference specific events from more than 24 hours ago/i)).toBeInTheDocument();
    expect(screen.getByText(/I don't recall/i)).toBeInTheDocument();
  });

  it('should display tasks for violent robots', () => {
    render(<RoleReveal role={mockViolentRobotRole} inducerMazeImage="/assets/mazes/test.png" onContinue={vi.fn()} />);

    expect(screen.getByText(/Convince the Investigator of something false/i)).toBeInTheDocument();
    expect(screen.getByText(/Subtly mislead about your intentions/i)).toBeInTheDocument();
  });

  it('should show inducer maze preview image', () => {
    render(<RoleReveal role={mockPatientRobotRole} inducerMazeImage="/assets/mazes/smalltalk-010.png" onContinue={vi.fn()} />);

    const mazeImage = screen.getByAltText(/Inducer Maze/i);
    expect(mazeImage).toBeInTheDocument();
    expect(mazeImage).toHaveAttribute('src', '/assets/mazes/smalltalk-010.png');
  });

  it('should require manual confirmation', () => {
    const onContinue = vi.fn();
    render(<RoleReveal role={mockPatientRobotRole} inducerMazeImage="/assets/mazes/test.png" onContinue={onContinue} />);

    const button = screen.getByRole('button', { name: /I Understand My Role/i });
    fireEvent.click(button);

    expect(onContinue).toHaveBeenCalledTimes(1);
  });

  it('should display warning about performing penalty for patient robots', () => {
    render(<RoleReveal role={mockPatientRobotRole} inducerMazeImage="/assets/mazes/test.png" onContinue={vi.fn()} />);
    expect(screen.getByText(/Perform your penalty when you break a restriction/i)).toBeInTheDocument();
  });

  it('should not display penalty warning for violent robots', () => {
    render(<RoleReveal role={mockViolentRobotRole} inducerMazeImage="/assets/mazes/test.png" onContinue={vi.fn()} />);
    expect(screen.queryByText(/Perform your penalty when you break a restriction/i)).not.toBeInTheDocument();
  });

  it('should display role type label', () => {
    render(<RoleReveal role={mockPatientRobotRole} inducerMazeImage="/assets/mazes/test.png" onContinue={vi.fn()} />);
    expect(screen.getByText(/Patient Robot/i)).toBeInTheDocument();
  });

  it('should display violent robot role type', () => {
    render(<RoleReveal role={mockViolentRobotRole} inducerMazeImage="/assets/mazes/test.png" onContinue={vi.fn()} />);
    expect(screen.getByText(/Violent Robot/i)).toBeInTheDocument();
  });

  it('should display all traits', () => {
    render(<RoleReveal role={mockPatientRobotRole} inducerMazeImage="/assets/mazes/test.png" onContinue={vi.fn()} />);

    expect(screen.getByText(/You have difficulty recalling past events/i)).toBeInTheDocument();
    expect(screen.getByText(/Recent memories are clear/i)).toBeInTheDocument();
  });

  it('should have a restrictions section header for patient robots', () => {
    render(<RoleReveal role={mockPatientRobotRole} inducerMazeImage="/assets/mazes/test.png" onContinue={vi.fn()} />);
    expect(screen.getByText(/Your Restrictions/i)).toBeInTheDocument();
  });

  it('should have a tasks section header for violent robots', () => {
    render(<RoleReveal role={mockViolentRobotRole} inducerMazeImage="/assets/mazes/test.png" onContinue={vi.fn()} />);
    expect(screen.getByText(/Tasks to Complete/i)).toBeInTheDocument();
  });
});
