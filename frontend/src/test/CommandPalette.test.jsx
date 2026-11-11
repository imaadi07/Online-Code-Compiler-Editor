import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CommandPalette from '../components/CommandPalette';

describe('CommandPalette Component QA', () => {
  const sampleFiles = [
    { id: 'f-main', name: 'main.py', path: 'main.py' },
    { id: 'f-helper', name: 'helpers.py', path: 'utils/helpers.py' },
  ];

  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    allFiles: sampleFiles,
    onSelectFile: vi.fn(),
    currentLanguage: 'python',
    onSelectLanguage: vi.fn(),
    onRun: vi.fn(),
    onResetCode: vi.fn(),
    onClearConsole: vi.fn(),
    theme: 'dark',
    onToggleTheme: vi.fn(),
    onToggleExplorer: vi.fn(),
    onViewChange: vi.fn(),
  };

  it('does not render when isOpen is false', () => {
    const { container } = render(<CommandPalette {...defaultProps} isOpen={false} />);
    expect(container.querySelector('.palette-dialog')).not.toBeInTheDocument();
  });

  it('renders search input and commands when open', () => {
    render(<CommandPalette {...defaultProps} />);
    const input = screen.getByPlaceholderText(/Type a command or search files/i);
    expect(input).toBeInTheDocument();
    expect(screen.getByText('Run Code')).toBeInTheDocument();
    expect(screen.getByText('Open main.py')).toBeInTheDocument();
  });

  it('filters actions when searching', () => {
    render(<CommandPalette {...defaultProps} />);
    const input = screen.getByPlaceholderText(/Type a command or search files/i);

    fireEvent.change(input, { target: { value: 'helpers' } });
    expect(screen.getByText('Open helpers.py')).toBeInTheDocument();
    expect(screen.queryByText('Open main.py')).not.toBeInTheDocument();
  });

  it('executes Run action when clicking Run Code', () => {
    render(<CommandPalette {...defaultProps} />);
    const runOption = screen.getByText('Run Code');
    fireEvent.click(runOption);

    expect(defaultProps.onViewChange).toHaveBeenCalledWith('compiler');
    expect(defaultProps.onRun).toHaveBeenCalled();
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('closes on Escape key press in dialog', () => {
    render(<CommandPalette {...defaultProps} />);
    const dialog = screen.getByRole('dialog');
    fireEvent.keyDown(dialog, { key: 'Escape' });

    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('navigates with ArrowDown and Enter key', () => {
    render(<CommandPalette {...defaultProps} />);
    const dialog = screen.getByRole('dialog');

    fireEvent.keyDown(dialog, { key: 'ArrowDown' });
    fireEvent.keyDown(dialog, { key: 'Enter' });

    expect(defaultProps.onClose).toHaveBeenCalled();
  });
});

