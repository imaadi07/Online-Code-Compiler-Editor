import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Dashboard from '../components/Dashboard';

describe('Dashboard Component QA', () => {
  const onLaunch = vi.fn();

  it('renders hero title and badge', () => {
    render(<Dashboard onLaunch={onLaunch} />);
    expect(screen.getByText(/Next-Generation Multi-File Cloud Compiler/i)).toBeInTheDocument();
    expect(screen.getByText(/Architect, edit, and run code/i)).toBeInTheDocument();
  });

  it('launches workspace when clicking Hero primary CTA button', () => {
    render(<Dashboard onLaunch={onLaunch} />);
    const launchBtn = screen.getByRole('button', { name: /Launch Cloud Workspace/i });
    expect(launchBtn).toBeInTheDocument();

    fireEvent.click(launchBtn);
    expect(onLaunch).toHaveBeenCalledWith('python');
  });

  it('simulates quick execution in the interactive preview window', () => {
    vi.useFakeTimers();
    render(<Dashboard onLaunch={onLaunch} />);

    const testRunBtn = screen.getByRole('button', { name: /Test Run/i });
    expect(testRunBtn).toBeInTheDocument();

    act(() => {
      fireEvent.click(testRunBtn);
    });
    expect(screen.getByText(/Compiling code/i)).toBeInTheDocument();

    act(() => {
      vi.runAllTimers();
    });
    expect(screen.getByText(/Process finished with exit code 0/i)).toBeInTheDocument();

    vi.useRealTimers();
  });

  it('renders all 5 runtime environment cards with launch buttons', () => {
    render(<Dashboard onLaunch={onLaunch} />);

    expect(screen.getByText('Python 3')).toBeInTheDocument();
    expect(screen.getByText('Java 17')).toBeInTheDocument();
    expect(screen.getByText('JavaScript')).toBeInTheDocument();
    expect(screen.getByText('C++ (g++)')).toBeInTheDocument();
    expect(screen.getByText('C (gcc)')).toBeInTheDocument();

    const launchJavaBtn = screen.getByRole('button', { name: /Launch Java 17 Workspace/i });
    fireEvent.click(launchJavaBtn);
    expect(onLaunch).toHaveBeenCalledWith('java');
  });

  it('renders container isolation architecture visualizer and stats', () => {
    render(<Dashboard onLaunch={onLaunch} />);
    expect(screen.getByText(/Ephemeral Container Isolation/i)).toBeInTheDocument();
    expect(screen.getByText(/< 250ms/i)).toBeInTheDocument();
    expect(screen.getByText(/100 MB/i)).toBeInTheDocument();
  });

  it('renders keyboard shortcuts guidance section', () => {
    render(<Dashboard onLaunch={onLaunch} />);
    expect(screen.getByText(/Keyboard Shortcuts:/i)).toBeInTheDocument();
    expect(screen.getByText('Ctrl+Enter')).toBeInTheDocument();
    expect(screen.getAllByText('Ctrl+K').length).toBeGreaterThan(0);
  });
});
