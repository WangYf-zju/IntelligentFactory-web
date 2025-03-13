import { useState, useMemo, useRef, useEffect } from 'react';
import InputField from '@comp/ui/input-field';
import Drawer, { DrawerRef } from '@comp/ui/drawer';
import Button from '@comp/ui/button';
import { useGlobalState } from './global-state';
import useFactoryScene from '@/lib/hooks/scene';

const defaultServerAddress = 'localhost';
const defaultHttpPort = '8900';
const defaultWebsocketPort = '8901';

export default function SettingsMenu() {
  const { dispatch } = useGlobalState();
  const drawerRef = useRef<DrawerRef>(null)

  const icon = <img src="/settings.svg" alt="Settings"
    className="h-6 w-6 filter invert-75" />
  const [serverAddress, setServerAddress] = useState(defaultServerAddress);
  const [httpPort, setHttpPort] = useState(defaultHttpPort);
  const [websocketPort, setWebsocketPort] = useState(defaultWebsocketPort);
  // TODO: 解决bug loading 在获取数据后到渲染完成这段时间无效
  const url = useMemo(() =>
    `http://${serverAddress}:${httpPort}/scene.pb`, [serverAddress, httpPort]);
  const { data, loading, error, execute } = useFactoryScene(url);
  const onClickConnect = () => {
    setTimeout(execute, 1000);
  }
  useEffect(() => {
    if (data && error === null) {
      dispatch({ type: "setScene", payload: data! });
      drawerRef.current?.close();
    }
  }, [data, error]);

  return (
    <Drawer icon={icon} ref={drawerRef} >
      <h2 className="text-lg font-semibold mb-4">设置</h2>
      <InputField label='服务端地址'
        value={serverAddress} defaultValue={defaultServerAddress}
        onChange={value => setServerAddress(value)} />
      <InputField label='HTTP 端口号'
        value={httpPort} defaultValue={defaultHttpPort}
        onChange={value => setHttpPort(value)} />
      <InputField label='WebSocket 端口号'
        value={websocketPort} defaultValue={defaultWebsocketPort}
        onChange={value => setWebsocketPort(value)} />
      <Button className='w-full' onClick={onClickConnect} loading={loading}>
        连接
      </Button>
    </Drawer>
  )
}