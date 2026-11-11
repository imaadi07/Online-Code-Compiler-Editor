import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Header from '../components/Header';

describe('Header Component QA', () => {
  const defaultProps = {
    currentView: 'compiler',
    onViewChange: vi.fn(),
    language: 'python',
    onLanguageChange: vi.fn(),
    fontSize: 14,
    onFontSizeChange: vi.fn(),
    isLoading: false,
    onRun: vi.fn(),
    onResetCode: vi.fn(),
    onClearConsole: vi.fn(),
    theme: 'dark',
    onToggleTheme: vi.fn(),
    onOpenCommandPalette: vi.fn(),
  };

  it('renders brand identity and triggers view change to dashboard on brand click', () => {
    render(<Header {...defaultProps} />);
    const brand = screen.getByRole('button', { name: /CodeCraft Dashboard/i });
    expect(brand).toBeInTheDocument();

    fireEvent.click(brand);
    expect(defaultProps.onViewChange).toHaveBeenCalledWith('dashboard');
  });

  it('switches views between Dashboard and Editor', () => {
    const { container } = render(<Header {...defaultProps} />);
    const dashboardBtn = container.querySelector('#nav-btn-dashboard');
    const editorBtn = container.querySelector('#nav-btn-compiler');

    expect(dashboardBtn).toBeInTheDocument();
    expect(editorBtn).toBeInTheDocument();

    fireEvent.click(dashboardBtn);
    expect(defaultProps.onViewChange).toHaveBeenCalledWith('dashboard');

    fireEvent.click(editorBtn);
    expect(defaultProps.onViewChange).toHaveBeenCalledWith('compiler');
  });

  it('triggers language change when selecting a different language', () => {
    render(<Header {...defaultProps} />);
    const select = screen.getByLabelText(/Programming Language/i);
    expect(select).toBeInTheDocument();

    fireEvent.change(select, { target: { value: 'java' } });
    expect(defaultProps.onLanguageChange).toHaveBeenCalledWith('java');
  });

  it('triggers Run execution and shows loading state when running', () => {
    const { rerender } = render(<Header {...defaultProps} />);
    const runBtn = screen.getByRole('button', { name: /Run Code/i });
    expect(runBtn).toBeInTheDocument();

    fireEvent.click(runBtn);
    expect(defaultProps.onRun).toHaveBeenCalled();

    // Re-render in loading state
    rerender(<Header {...defaultProps} isLoading={true} />);
    expect(screen.getByText(/Executing.../i)).toBeInTheDocument();
    const disabledRunBtn = screen.getByRole('button', { name: /Executing code in isolated container.../i });
    expect(disabledRunBtn).toBeDisabled();
  });

  it('opens Command Palette when clicking the palette trigger button', () => {
    render(<Header {...defaultProps} />);
    const cmdBtn = screen.getByRole('button', { name: /Open Command Palette/i });
    expect(cmdBtn).toBeInTheDocument();

    fireEvent.click(cmdBtn);
    expect(defaultProps.onOpenCommandPalette).toHaveBeenCalled();
  });

  it('toggles theme when clicking the theme toggle button', () => {
    render(<Header {...defaultProps} />);
    const themeBtn = screen.getByRole('button', { name: /Toggle Theme/i });
    expect(themeBtn).toBeInTheDocument();

    fireEvent.click(themeBtn);
    expect(defaultProps.onToggleTheme).toHaveBeenCalled();
  });
});
