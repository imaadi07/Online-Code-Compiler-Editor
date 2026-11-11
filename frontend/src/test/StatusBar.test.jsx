import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import StatusBar from '../components/StatusBar';

describe('StatusBar Component QA', () => {
  const defaultProps = {
    language: 'python',
    isLoading: false,
    error: '',
    output: '',
    cursorPosition: { lineNumber: 5, column: 12 },
  };

  it('renders language and sandbox status correctly in standby', () => {
    render(<StatusBar {...defaultProps} />);
    expect(screen.getByText('Python 3')).toBeInTheDocument();
    expect(screen.getByText('Sandbox Standby')).toBeInTheDocument();
    expect(screen.getByText('Docker Sandbox Active')).toBeInTheDocument();
  });

  it('displays cursor line and column position', () => {
    render(<StatusBar {...defaultProps} />);
    expect(screen.getByText('Ln 5, Col 12')).toBeInTheDocument();
  });

  it('reflects executing status when isLoading is true', () => {
    render(<StatusBar {...defaultProps} isLoading={true} />);
    expect(screen.getByText('Executing...')).toBeInTheDocument();
  });

  it('reflects success status when output is present without error', () => {
    render(<StatusBar {...defaultProps} output="Executed successfully" />);
    expect(screen.getByText('Completed 0 Errors')).toBeInTheDocument();
  });

  it('reflects fault status when error is present', () => {
    render(<StatusBar {...defaultProps} error="Crash" />);
    expect(screen.getByText('Fault Occurred')).toBeInTheDocument();
  });
});

