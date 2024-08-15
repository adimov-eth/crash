import { useCrashGame } from '@/contexts/CrashGameContext';
import GameCanvas from './GameCanvas';
import GameControls from './GameControls';
import GameHistory from './GameHistory';
import PlayerList from './PlayerList';

const CrashGame = () => {
  const { state } = useCrashGame();

  return (
    <div className="crash-game">
      <h1>Crash Game</h1>
      <GameCanvas />
      <GameControls />
      <GameHistory />
      <PlayerList />
    </div>
  );
};

export default CrashGame;