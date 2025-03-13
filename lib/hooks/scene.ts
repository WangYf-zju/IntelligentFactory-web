import axios from 'axios';
import { FactoryScene } from '@/lib/generated_files/scene_pb';
import useAsync from '@/lib/hooks';

const useFactoryScene = (url: string) => {
  const fetchData = async (): Promise<FactoryScene.AsObject> => {
    const response = await axios.get(url, {
      responseType: 'arraybuffer'
    });
    const scene = FactoryScene.deserializeBinary(new Uint8Array(response.data));
    return scene.toObject();
  };
  return useAsync(fetchData);
};

export default useFactoryScene;