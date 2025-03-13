import { forwardRef, useState, useImperativeHandle } from 'react';

interface DrawerProps {
  children?: React.ReactNode;
  icon?: React.ReactNode;
}

export interface DrawerRef {
  close: () => void;
}

const Drawer = forwardRef<DrawerRef, DrawerProps>((props, ref) => {
  const {
    children = null,
    icon = null,
  } = props;
  const [isOpen, setIsOpen] = useState(false);
  const [showButton, setShowButton] = useState(true);

  useImperativeHandle(ref, () => ({
    close: () => closeMenu(),
  }));

  const openMenu = () => {
    setShowButton(false);
    setTimeout(() => setIsOpen(true), 100);
  };

  const closeMenu = () => {
    setTimeout(() => setShowButton(true), 400);
    setIsOpen(false);
  };

  return (
    <div>
      {/* 悬浮设置按钮 */}
      {showButton && (
        <button
          onClick={openMenu}
          className={`fixed top-4 right-4 h-10 w-10 p-2 rounded-full hover:bg-black/10
            items-center justify-center flex z-50`}
        >
          {icon}
        </button>
      )}

      {/* 遮罩层 */}
      {isOpen && (
        <div
          onClick={closeMenu}
          className="fixed inset-0 opacity-0 z-40"
        />
      )}

      {/* 设置菜单 */}
      <div
        className={`fixed top-0 right-0 w-80 bg-white shadow-lg opacity-90
          overflow-hidden transition-all duration-300 ease-in-out z-50 
          ${isOpen ? 'h-screen' : 'h-0'}`}
      >
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
});

export default Drawer;