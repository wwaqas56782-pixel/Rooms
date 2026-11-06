import { useState } from 'react';
import { useRoom } from './hooks/useRoom.js';
import Participant from './components/Participant.jsx';

// Everyone who opens the site lands in this one room.
const ROOM_ID = import.meta.env.VITE_ROOM_NAME || 'main';

function getGuestName() {
  let name = sessionStorage.getItem('openline:name');
  if (!name) {
    name = `Guest ${Math.floor(100 + Math.random() * 900)}`;
    sessionStorage.setItem('openline:name', name);
  }
  return name;
}

export default function App() {
  const room = useRoom();
  const [name] = useState(getGuestName);
  const { status, error, peers, localStream, muted, maxUsers, join, leave, toggleMute } = room;

  const joined = status === 'joined';
  const joining = status === 'joining';
  const others = Object.values(peers);

  return (
    <main className="page">
      <header className="page-head">
        <h1 className="brand">Open Line</h1>
        <p className="count">
          {joined ? `${others.length + 1} of ${maxUsers} in the room` : 'One room. Everyone talks.'}
        </p>
      </header>

      {error && (
        <p className="alert banner" role="alert">
          {error}
        </p>
      )}

      {!joined && (
        <button className="btn primary big" onClick={() => join(ROOM_ID, name)} disabled={joining}>
          {joining ? 'Connecting…' : 'Join chat room'}
        </button>
      )}

      {joined && (
        <>
          <ul className="grid">
            <Participant name={name} stream={localStream} muted={muted} isSelf />
            {others.map((p) => (
              <Participant
                key={p.id}
                name={p.name}
                stream={p.stream}
                muted={p.muted}
                connState={p.connState}
              />
            ))}
          </ul>

          {others.length === 0 && <p className="empty">You are the only one here so far.</p>}

          <footer className="controls">
            <button
              className={`btn ${muted ? 'danger' : 'primary'}`}
              onClick={toggleMute}
              aria-pressed={muted}
            >
              {muted ? 'Unmute microphone' : 'Mute microphone'}
            </button>
            <button className="btn ghost" onClick={leave}>
              Leave room
            </button>
          </footer>
        </>
      )}
    </main>
  );
}
