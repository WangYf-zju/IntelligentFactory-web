'use client';

import styles from "./page.module.css";
import Canvas3d from "@comp/canvas-3d";
import SettingsMenu from "@comp/settings-menu";
import { GlobalStateProvider } from "@comp/global-state";

export default function Home() {
  return (
    <GlobalStateProvider>
      <div className={styles.page}>
        <SettingsMenu />
        <div className="w-screen h-screen">
          <Canvas3d />
        </div>
      </div>
    </GlobalStateProvider>
  );
}
