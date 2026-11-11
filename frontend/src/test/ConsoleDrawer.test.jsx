import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ConsoleDrawer from '../components/ConsoleDrawer';

describe('ConsoleDrawer Component QA', () => {
  const defaultProps = {
    activeTab: 'output',
    onTabChange: vi.fn(),
    input: '',
    onInputChange: vi.fn(),
    output: '',
    error: '',
    isLoading: false,
    executionTime: null,
    onClear: vi.fn(),
  };

  it('renders terminal tabs and empty standby state when no output', () => {
    render(<ConsoleDrawer {...defaultProps} />);
    expect(screen.getByRole('tab', { name: /Terminal/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Input/i })).toBeInTheDocument();
    expect(screen.getByText(/Sandbox ready for execution/i)).toBeInTheDocument();
  });

  it('shows loading state during execution', () => {
    render(<ConsoleDrawer {...defaultProps} isLoading={true} />);
    expect(screen.getByText(/Executing in isolated micro-sandbox/i)).toBeInTheDocument();
  });

  it('renders stdout program output and success badge', () => {
    render(<ConsoleDrawer {...defaultProps} output="Hello World\nExecution completed." />);
    expect(screen.getByText(/Success/i)).toBeInTheDocument();
    expect(screen.getByText(/Hello World/i)).toBeInTheDocument();
  });

  it('renders stderr error diagnostic and error badge with alert role', () => {
    render(<ConsoleDrawer {...defaultProps} error="SyntaxError: invalid syntax" />);
    expect(screen.getAllByText(/Error/i).length).toBeGreaterThan(0);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/SyntaxError: invalid syntax/i)).toBeInTheDocument();
  });

  it('copies output to clipboard when clicking copy button', async () => {
    render(<ConsoleDrawer {...defaultProps} output="Test Output" />);
    const copyBtn = screen.getByRole('button', { name: /Copy output to clipboard/i });
    expect(copyBtn).toBeInTheDocument();

    fireEvent.click(copyBtn);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Test Output');
  });

  it('renders execution time badge when executionTime is provided', () => {
    render(<ConsoleDrawer {...defaultProps} executionTime={42} />);
    expect(screen.getByText('42 ms')).toBeInTheDocument();
  });

  it('switches to input tab and updates stdin textarea', () => {
    render(
      <ConsoleDrawer
        {...defaultProps}
        activeTab="input"
        input="42\nDeveloper"
      />
    );

    const textarea = screen.getByRole('textbox', { name: /Standard Input Buffer/i });
    expect(textarea).toBeInTheDocument();
    expect(textarea.value).toContain('42');
    expect(textarea.value).toContain('Developer');

    fireEvent.change(textarea, { target: { value: 'New Input' } });
    expect(defaultProps.onInputChange).toHaveBeenCalledWith('New Input');
  });

  it('triggers clear action when clicking clear/reset button', () => {
    render(<ConsoleDrawer {...defaultProps} />);
    const clearBtn = screen.getByRole('button', { name: /Clear output/i });
    fireEvent.click(clearBtn);

    expect(defaultProps.onClear).toHaveBeenCalled();
  });
});
