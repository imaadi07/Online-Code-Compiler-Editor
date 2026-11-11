import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import FileExplorer from '../components/FileExplorer';

describe('FileExplorer Component QA', () => {
  const sampleTree = [
    {
      id: 'f-main',
      name: 'main.py',
      type: 'file',
      path: 'main.py',
      isEntry: true,
      content: 'print("hello")',
    },
    {
      id: 'fold-utils',
      name: 'utils',
      type: 'folder',
      path: 'utils',
      isOpen: true,
      children: [
        {
          id: 'f-calc',
          name: 'calc.py',
          type: 'file',
          path: 'utils/calc.py',
          content: 'def add(a, b): return a + b',
        },
      ],
    },
  ];

  const defaultProps = {
    fileTree: sampleTree,
    activeFileId: 'f-main',
    onSelectFile: vi.fn(),
    onCreateFile: vi.fn(),
    onCreateFolder: vi.fn(),
    onDeleteNode: vi.fn(),
    isOpen: true,
    onToggleOpen: vi.fn(),
  };

  it('renders project files and folder structure', () => {
    render(<FileExplorer {...defaultProps} />);
    expect(screen.getByText('main.py')).toBeInTheDocument();
    expect(screen.getByText('utils')).toBeInTheDocument();
    expect(screen.getByText('calc.py')).toBeInTheDocument();
    expect(screen.getByText('ENTRY')).toBeInTheDocument();
  });

  it('triggers onSelectFile when clicking a file row', () => {
    render(<FileExplorer {...defaultProps} />);
    const calcFile = screen.getByText('calc.py');
    fireEvent.click(calcFile);

    expect(defaultProps.onSelectFile).toHaveBeenCalledWith('f-calc');
  });

  it('filters visible files when typing in search input', () => {
    render(<FileExplorer {...defaultProps} />);
    const searchInput = screen.getByPlaceholderText(/Filter workspace files/i);

    fireEvent.change(searchInput, { target: { value: 'calc' } });
    expect(screen.getByText('calc.py')).toBeInTheDocument();
    expect(screen.queryByText('main.py')).not.toBeInTheDocument();
  });

  it('creates a new file in root when clicking Add File and submitting', () => {
    render(<FileExplorer {...defaultProps} />);
    const addFileBtn = screen.getByRole('button', { name: /New File/i });
    fireEvent.click(addFileBtn);

    const input = screen.getByPlaceholderText('filename.ext');
    expect(input).toBeInTheDocument();

    fireEvent.change(input, { target: { value: 'test.py' } });
    fireEvent.submit(input.closest('form'));

    expect(defaultProps.onCreateFile).toHaveBeenCalledWith('test.py', null);
  });

  it('toggles sidebar collapse when clicking collapse button', () => {
    render(<FileExplorer {...defaultProps} />);
    const collapseBtn = screen.getByRole('button', { name: /Collapse Sidebar/i });
    fireEvent.click(collapseBtn);

    expect(defaultProps.onToggleOpen).toHaveBeenCalled();
  });
});

