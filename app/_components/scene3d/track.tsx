import { useMemo, ReactNode, useEffect, useRef } from "react";
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { FactoryScene } from '@/lib/generated_files/scene_pb';
import { useFactoryTrack } from "@hooks/factory-core";
import { useGlobalState } from "@hooks/global-state";
import { useSharedState } from "@hooks/shared-state";

interface LineTrackProps {
  id?: number;
  start: [x: number, y: number, z: number];
  end: [x: number, y: number, z: number];
  size?: [w: number, h: number];
  space?: number;
  material?: THREE.Material;
}

interface ArcProps {
  center: [x: number, y: number, z: number];
  radius: number;
  angle0: number;
  angle1: number;
  dire: boolean;
}

type Arc3dProps = ArcProps & {
  children?: ReactNode;
  size: [w: number, h: number];
};

type ArcTrackProps = ArcProps & {
  id?: number;
  size?: [w: number, h: number];
  space?: number;
  material?: THREE.Material;
};

const defaultTrackSize = [0.2, 0.1]
const defualtTrackSpace = 0.6
const defaultTrackMaterial = new THREE.MeshStandardMaterial({ color: '#fff1b8', metalness: 0.1, roughness: 0.3 });

function LineTrans(start: THREE.Vector3, end: THREE.Vector3) {
  const dire = end.clone().sub(start).normalize();
  const scale = start.distanceTo(end);
  const pos = new THREE.Vector3().addVectors(start, end).divideScalar(2);
  const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(1, 0, 0), dire);
  return { scale, pos, quat };
}

function LineTrackGeometries(props: LineTrackProps) {
  const {
    start,
    end,
    space = defualtTrackSpace,
    size: [w, h] = defaultTrackSize,
  } = props;
  const { scale, pos, quat } = LineTrans(new THREE.Vector3(...start), new THREE.Vector3(...end));
  const pos1 = new THREE.Vector3(0, -space / 2, 0).applyQuaternion(quat).add(pos);
  const pos2 = new THREE.Vector3(0, space / 2, 0).applyQuaternion(quat).add(pos);
  const box1 = new THREE.BoxGeometry(scale, w, h);
  const box2 = new THREE.BoxGeometry(scale, w, h);
  box1.applyQuaternion(quat);
  box1.translate(pos1.x, pos1.y, pos1.z);
  box2.applyQuaternion(quat);
  box2.translate(pos2.x, pos2.y, pos2.z);
  return [box1, box2];
}

export function LineTrackPathGeometry(props: LineTrackProps) {
  const {
    start,
    end,
    size: [w, h] = defaultTrackSize,
  } = props;
  const start1 = [start[0], start[1], start[2] + 1e-3];
  const end1 = [end[0], end[1], end[2] + 1e-3];
  const { scale, pos, quat } = LineTrans(new THREE.Vector3(...start1), new THREE.Vector3(...end1));
  const box = new THREE.BoxGeometry(scale, w, h);
  box.applyQuaternion(quat);
  box.translate(pos.x, pos.y, pos.z);
  return box;
}

const Arc3dGeometry = (props: Arc3dProps) => {
  const { size, center, radius, angle0, angle1, dire } = props;
  const division = 10 // Math.ceil(Math.abs((angle0 - angle1) / 10)) + 1;
  const w = size[0] / 2;
  const h = size[1] / 2;
  const outlinePoints = [[h, w], [-h, w], [-h, -w], [h, -w]].map(p => new THREE.Vector2(...p));
  const outline = new THREE.Shape(outlinePoints);
  const startAngle = angle0 * Math.PI / 180;
  const endAngle = angle1 * Math.PI / 180;
  const arc = new THREE.Path().absarc(0, 0, radius, startAngle, endAngle, dire);
  const pathPoints = arc.getPoints(division).map(p => new THREE.Vector3(p.x, p.y, 0));
  const extrudePath = new THREE.CatmullRomCurve3(pathPoints);
  const extrudeSettings: THREE.ExtrudeGeometryOptions = { steps: division, bevelEnabled: false, extrudePath };
  const geometry = new THREE.ExtrudeGeometry(outline, extrudeSettings);
  geometry.translate(...center);
  return geometry;
}

function ArcTrackGeometries(props: ArcTrackProps) {
  const {
    radius,
    space = defualtTrackSpace,
    size = defaultTrackSize,
    material,
    ...otherProps
  } = props;
  const radius1 = radius + space / 2;
  const radius2 = radius - space / 2;
  const size1: [w: number, h: number] = [size[0], size[1] + 1e-3];
  const arc1 = Arc3dGeometry({ ...otherProps, size: size1, radius: radius1 });
  const arc2 = radius2 > 0 ? Arc3dGeometry({ ...otherProps, size: size1, radius: radius2 }) : null;
  return arc2 ? [arc1, arc2] : [arc1];
}

export function ArcTrackPathGeometry(props: ArcTrackProps) {
  const {
    space = defualtTrackSpace,
    size = defaultTrackSize,
    center,
    material,
    ...otherProps
  } = props;
  const size1: [w: number, h: number] = [size[0], size[1] + 1e-3];
  const center1: [x: number, y: number, z: number] = [center[0], center[1], center[2] + 1e-3];
  const arc = Arc3dGeometry({ ...otherProps, size: size1, center: center1 });
  return arc;
}

export function LineTrack(props: LineTrackProps) {
  const {
    material = defaultTrackMaterial,
    ...otherProps
  } = props;
  const geometries = LineTrackGeometries(otherProps);
  return (
    <>
      <mesh geometry={geometries[0]} material={material} ></mesh>
      <mesh geometry={geometries[1]} material={material} ></mesh>
    </>
  );
}

export function ArcTrack(props: ArcTrackProps) {
  const {
    material = defaultTrackMaterial,
    ...otherProps
  } = props;
  const geometries = ArcTrackGeometries(otherProps);
  return (
    <>
      {geometries[0] && <mesh geometry={geometries[0]} material={material}></mesh>}
      {geometries[1] && <mesh geometry={geometries[1]} material={material}></mesh>}
    </>
  );
}

export function FactoryTracks({ scene, material = defaultTrackMaterial }:
  { scene: FactoryScene.AsObject, material?: THREE.Material }) {
  const { lineTracks, arcTracks } = useFactoryTrack(scene);
  const geometries = useMemo(() => {
    const lineGeometries = lineTracks.map(LineTrackGeometries).flat();
    const arcGeometries = arcTracks.map(ArcTrackGeometries).flat();
    return [mergeGeometries([...lineGeometries]), mergeGeometries([...arcGeometries])];
  }, [lineTracks, arcTracks]);
  return (
    <>
      <mesh geometry={geometries[0]} material={material} ></mesh>
      <mesh geometry={geometries[1]} material={material} ></mesh>
    </>
  );
}

export function useTrackRender() {
  const { state: { scene: sceneState } } = useGlobalState();
  const [_, setSharedState] = useSharedState();
  const { lineTracks, arcTracks } = useFactoryTrack(sceneState);
  const lineMesh = useRef<THREE.Mesh>(null);
  const arcMesh = useRef<THREE.Mesh>(null);
  const geometries = useMemo(() => {
    const lineGeometries = lineTracks.map(LineTrackGeometries).flat();
    const arcGeometries = arcTracks.map(ArcTrackGeometries).flat();
    return [lineGeometries.length ? mergeGeometries(lineGeometries) : null,
    arcGeometries.length ? mergeGeometries(arcGeometries) : null];
  }, [lineTracks, arcTracks]);
  useEffect(() => { setSharedState({ tracks: { lineTracks, arcTracks } }) }, [lineTracks, arcTracks]);
  const needUpdate = useRef(true);
  useEffect(() => { needUpdate.current = true; }, [sceneState]);

  const updateFrame = (scene: THREE.Scene, dt: number) => {
    if (!needUpdate.current || !scene || !sceneState) return;
    needUpdate.current = false;
    if (lineMesh.current) scene.remove(lineMesh.current);
    if (arcMesh.current) scene.remove(arcMesh.current);
    lineMesh.current = geometries[0] ? new THREE.Mesh(geometries[0], defaultTrackMaterial) : null;
    arcMesh.current = geometries[1] ? new THREE.Mesh(geometries[1], defaultTrackMaterial) : null;
    lineMesh.current && scene.add(lineMesh.current);
    arcMesh.current && scene.add(arcMesh.current);
  };
  return { updateFrame };
}