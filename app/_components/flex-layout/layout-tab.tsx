import { useEffect, useRef, useState } from 'react';
import { TabNode } from 'flexlayout-react';

export interface LayoutTabMenuItem {
  key: string,
  label: string,
  component: string,
  onClick?: () => void,
}

interface LayoutTabContentProps {
  node: TabNode,
  menuItems: LayoutTabMenuItem[],
  onClickMenu?: (node: TabNode, item: LayoutTabMenuItem) => void,
}

const LayoutTabContent = ({ node, menuItems, onClickMenu }: LayoutTabContentProps) => {
  const [open, setOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (triggerRef.current && menuRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const menuRect = menuRef.current.getBoundingClientRect();
      let top = triggerRect.bottom + window.scrollY;
      let left = triggerRect.left + window.scrollX;
      // 判断是否超出屏幕右侧
      if (left + menuRect.width > window.innerWidth) {
        left = window.innerWidth - menuRect.width;
      }
      // 判断是否超出屏幕底部
      if (top + menuRect.height > window.innerHeight + window.scrollY) {
        top = triggerRect.top + window.scrollY - menuRect.height; // 显示在上方
      }
      setMenuPosition({ top, left });
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className='-my-1 -ml-2 -mr-7 cursor-default'>
      <div className='py-1 pl-2 pr-7 flex items-center' ref={triggerRef}>
        <div
          onClick={() => setOpen(!open)}
          onDoubleClick={(e) => e.stopPropagation()}
          className="inline-block pr-1"
        >
          ▼
        </div>
        <span>{node.getName()}</span>
        {node.getComponent() === 'canvas3d' &&
          <span className='ml-2 inline-block'>
            <div className='flexlayout__tab_button_trailing h-4 w-4'>
              <img src='/icons/camera-reset.svg' />
            </div>
          </span>
        }
      </div>
      <div
        ref={menuRef}
        className="fixed w-30 bg-white border border-gray-200 shadow-lg z-2000"
        style={{
          top: menuPosition.top,
          left: menuPosition.left,
          display: open ? 'block' : 'none',
        }}
      >
        {menuItems.map((item) =>
          <div key={item.key} className="px-1 py-0.25 hover:bg-gray-100 cursor-pointer"
            onClick={() => {
              item.onClick?.();
              onClickMenu?.(node, item);
              setOpen(false);
            }}>
            {item.label}
          </div>
        )}
      </div>

    </div>
  );
}

export default LayoutTabContent;