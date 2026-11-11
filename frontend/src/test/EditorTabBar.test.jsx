import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import EditorTabBar from '../components/EditorTabBar';

describe('EditorTabBar Component QA', () => {
  const openFiles = [
    { id: 'f-1', name: 'main.py', path: 'main.py' },
    { id: 'f-2', name: 'helper.py', path: 'utils/helper.py' },
  ];

  const defaultProps = {
    openFiles,
    activeFileId: 'f-1',
    onSelectTab: vi.fn(),
    onCloseTab: vi.fn(),
    onToggleExplorer: vi.fn(),
    isExplorerOpen: true,
  };

  it('renders open file tabs with active tab indication', () => {
    const { container } = render(<EditorTabBar {...defaultProps} />);
    expect(screen.getByText('main.py')).toBeInTheDocument();
    expect(screen.getByText('helper.py')).toBeInTheDocument();

    const tabs = container.querySelectorAll('.file-tab-item');
    expect(tabs[0]).toHaveClass('active-tab');
  });

  it('selects tab when clicked', () => {
    render(<EditorTabBar {...defaultProps} />);
    const helperTab = screen.getByText('helper.py');
    fireEvent.click(helperTab);

    expect(defaultProps.onSelectTab).toHaveBeenCalledWith('f-2');
  });

  it('closes tab when clicking close button', () => {
    render(<EditorTabBar {...defaultProps} />);
    const closeBtn = screen.getByRole('button', { name: /Close helper.py/i });
    fireEvent.click(closeBtn);

    expect(defaultProps.onCloseTab).toHaveBeenCalledWith('f-2');
  });

  it('toggles file explorer when clicking the explorer button', () => {
    render(<EditorTabBar {...defaultProps} />);
    const toggleBtn = screen.getByRole('button', { name: /Hide File Explorer/i });
    fireEvent.click(toggleBtn);

    expect(defaultProps.onToggleExplorer).toHaveBeenCalled();
  });
});

