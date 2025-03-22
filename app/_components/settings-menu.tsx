import { useState, forwardRef, useImperativeHandle } from 'react';
import InputField from '@comp/ui/input-field';
import Button from '@comp/ui/button';
import { useGlobalState } from '../../lib/hooks/global-state';

const defaultServerAddress = 'localhost';
const defaultWebsocketPort = '8900';

interface SettingsMenuProps {
  onClickConnect?: (url: string) => void;
  icon?: React.ReactNode;
}

export interface SettingsMenuRef {
  open: () => void;
  close: () => void;
}

export const SettingsMenu = forwardRef<SettingsMenuRef, SettingsMenuProps>((props, ref) => {
  const {
    icon = null,
    onClickConnect: connect,
  } = props;
  const [isOpen, setIsOpen] = useState(false);
  const [showButton, setShowButton] = useState(true);
  const { dispatch } = useGlobalState();

  const [serverAddress, setServerAddress] = useState(defaultServerAddress);
  // const [httpPort, setHttpPort] = useState(defaultHttpPort);
  const [websocketPort, setWebsocketPort] = useState(defaultWebsocketPort);
  const onClickConnect = () => {
    // TODO: 检查数据是否合法
    const url = `ws://${serverAddress}:${websocketPort}`;
    connect?.(url);
  }

  useImperativeHandle(ref, () => ({
    open: () => openMenu(),
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
      {icon && showButton && (
        <button
          onClick={openMenu}
          className={`fixed top-4 right-4 h-10 w-10 p-1 rounded-full hover:bg-black/10
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
          <h2 className="text-lg font-semibold mb-4">设置</h2>
          <InputField label='服务端地址'
            value={serverAddress} defaultValue={defaultServerAddress}
            onChange={value => setServerAddress(value)} />
          <InputField label='WebSocket 端口号'
            value={websocketPort} defaultValue={defaultWebsocketPort}
            onChange={value => setWebsocketPort(value)} />
          <Button className='w-full' onClick={onClickConnect}>
            连接
          </Button>
        </div>
      </div>
    </div>
  );
});