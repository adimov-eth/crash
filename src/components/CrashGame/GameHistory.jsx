import React, { useState, useEffect } from 'react';
import { List, ListItem, ListItemText, Paper, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useCrashGame } from '@/contexts/CrashGameContext';
import { formatMultiplier } from '@/utils/formatters';


const HistoryContainer = styled(Paper)(({ theme }) => ({
  maxHeight: 300,
  overflow: 'auto',
  marginTop: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
}));

const HistoryItem = styled(ListItem)(({ theme, crashPoint }) => ({
  padding: theme.spacing(1, 2),
  color: getCrashPointColor(crashPoint),
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
  animation: 'fadeIn 0.5s ease-in',
  '@keyframes fadeIn': {
    '0%': { opacity: 0, transform: 'translateY(-10px)' },
    '100%': { opacity: 1, transform: 'translateY(0)' },
  },
}));

const getCrashPointColor = (crashPoint) => {
  if (crashPoint < 1.5) return '#ff4d4d'; // Red for low crash points
  if (crashPoint < 3) return '#ffff4d'; // Yellow for medium crash points
  return '#4dff4d'; // Green for high crash points
};

const GameHistory = () => {
  const { gameHistory, gameState } = useCrashGame();
  const [displayHistory, setDisplayHistory] = useState([]);

  useEffect(() => {
    if (gameHistory.length > displayHistory.length) {
      setDisplayHistory(gameHistory.slice(0, 10)); // Display last 10 games
    }
  }, [gameHistory, gameState]);

  return (
    <HistoryContainer>
      <Typography variant="h6" align="center" gutterBottom>
        Game History
      </Typography>
      <List>
        {displayHistory.map((game, index) => (
          <HistoryItem key={game.id || index} crashPoint={game.crashPoint}>
            <ListItemText
              primary={`${formatMultiplier(game.crashPoint)}x`}
              secondary={`Game #${game.id}`}
            />
          </HistoryItem>
        ))}
      </List>
    </HistoryContainer>
  );
};

export default GameHistory;