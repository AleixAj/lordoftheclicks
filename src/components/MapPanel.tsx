import { useState } from 'react';
import { MapView } from './MapView';
import { Modal } from './Modal';
import { Panel } from './Panel';
import styles from '@/styles/map.module.css';

export function MapPanel() {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <Panel className={styles.map} title="Mapa de la Tierra Media" bodyClassName="p-0">
        <MapView onExpand={() => setExpanded(true)} />
      </Panel>

      <Modal
        open={expanded}
        onClose={() => setExpanded(false)}
        title="Mapa de la Tierra Media"
        size="xl"
      >
        <div className="h-[80vh]">
          <MapView onClose={() => setExpanded(false)} />
        </div>
      </Modal>
    </>
  );
}
