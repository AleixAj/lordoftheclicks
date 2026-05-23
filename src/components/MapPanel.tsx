import { useState } from 'react';
import { LOCATIONS } from '@/data';
import { useGameStore } from '@/engine/store';
import { MapView } from './MapView';
import { Modal } from './Modal';
import { Panel } from './Panel';
import styles from '@/styles/map.module.css';

export function MapPanel() {
  const [expanded, setExpanded] = useState(false);
  const locIdx = useGameStore((s) => s.state.locIdx);
  const loc = LOCATIONS[locIdx];
  const title = loc?.name ?? 'Tierra Media';

  return (
    <>
      <Panel className={styles.map} title={title} bodyClassName="p-0">
        <MapView onExpand={() => setExpanded(true)} />
      </Panel>

      <Modal open={expanded} onClose={() => setExpanded(false)} title={title} size="xl">
        <div className="h-[80vh]">
          <MapView onClose={() => setExpanded(false)} />
        </div>
      </Modal>
    </>
  );
}
