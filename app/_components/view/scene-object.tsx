import React, { JSX, useMemo, useState } from "react";
import * as THREE from "three";
import { useGlobalState } from "@hooks/global-state";

function isObjectInFrustum(object: THREE.Object3D, camera: THREE.Camera): boolean {
  const frustum = new THREE.Frustum();
  const matrix = new THREE.Matrix4().multiplyMatrices(
    camera.projectionMatrix,
    camera.matrixWorldInverse
  );
  frustum.setFromProjectionMatrix(matrix);

  const box = new THREE.Box3().setFromObject(object);
  return frustum.intersectsBox(box);
}

const SceneObjectNode: React.FC<{
  object: THREE.Object3D;
  camera: THREE.Camera;
  level: number;
}> = ({ object, camera, level }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => setIsExpanded(!isExpanded);

  const isInFrustum = isObjectInFrustum(object, camera);
  const inFrustumText = isInFrustum ? "✅ 在渲染范围内" : "❌ 不在渲染范围内";

  return (
    <div style={{ marginLeft: `${level * 20}px` }}>
      <div onClick={toggleExpand} style={{ cursor: "pointer" }}>
        {object.children.length > 0 ? (isExpanded ? "▼" : "▶") : ""}{" "}
        {`[${object.type}]${object.name}`} - {inFrustumText}
      </div>
      {isExpanded &&
        object.children.map((child) => (
          <SceneObjectNode
            key={child.uuid}
            object={child}
            camera={camera}
            level={level + 1}
          />
        ))}
    </div>
  );
};


const SceneObjectTree: React.FC = () => {
  const { state: { nodes } } = useGlobalState();
  const options = useMemo(() => {
    return Object.values(nodes).filter(n => n.camera && n.scene);
  }, [nodes]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [refreshKey, setRefreshKey] = useState(0); // 用于强制刷新

  const handleNodeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedIndex = event.target.selectedIndex;
    setSelectedIndex(selectedIndex);
  };

  const handleRefresh = () => {
    setRefreshKey((prevKey) => prevKey + 1); // 更新 refreshKey 以触发重新渲染
  };

  return (
    <div>
      <div>
        <label htmlFor="node-select">选择窗口: </label>
        <select id="node-select" onChange={handleNodeChange}>
          {options.map((option, index) => (
            <option key={index} value={index}>
              {option.id}
            </option>
          ))}
        </select>
        <button onClick={handleRefresh}>刷新</button>
      </div>
      {
        options[selectedIndex]?.scene && options[selectedIndex]?.camera &&
        <div key={refreshKey}>
          <SceneObjectNode object={options[selectedIndex].scene}
            camera={options[selectedIndex].camera} level={0} />
        </div>
      }
    </div>
  );
};

export default SceneObjectTree;