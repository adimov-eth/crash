// src/components/CrashGame/PlayerList.jsx
import React, { useState, useEffect } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Typography,
  TableSortLabel
} from '@mui/material';
import { styled } from '@mui/system';
import { useCrashGame } from '@/contexts/CrashGameContext';
import { formatCurrency, formatMultiplier } from '@/utils/formatters';
import { GAME_STATES } from '@/utils/constants';

const ListContainer = styled(Paper)(({ theme }) => ({
  maxHeight: 400,
  overflow: 'auto',
  marginTop: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
}));

const StyledTableRow = styled(TableRow)(({ theme, status }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  backgroundColor: 
    status === 'cashed_out' ? theme.palette.success.light :
    status === 'busted' ? theme.palette.error.light :
    'inherit',
  transition: 'background-color 0.3s',
}));

const PlayerList = () => {
  const { bets, gameState, currentMultiplier } = useCrashGame();
  const [sortedBets, setSortedBets] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'betAmount', direction: 'desc' });

  useEffect(() => {
    const betsArray = Object.values(bets);
    const sorted = [...betsArray].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
    setSortedBets(sorted);
  }, [bets, sortConfig]);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getPlayerStatus = (bet) => {
    if (gameState === GAME_STATES.ACTIVE) {
      return bet.cashedOut ? 'cashed_out' : 'active';
    }
    if (gameState === GAME_STATES.OVER) {
      return bet.cashedOut ? 'cashed_out' : 'busted';
    }
    return 'betting';
  };

  return (
    <ListContainer>
      <Typography variant="h6" align="center" gutterBottom>
        Player List
      </Typography>
      <TableContainer>
        <Table stickyHeader aria-label="player list">
          <TableHead>
            <TableRow>
              <TableCell>Player</TableCell>
              <TableCell sortDirection={sortConfig.key === 'betAmount' ? sortConfig.direction : false}>
                <TableSortLabel
                  active={sortConfig.key === 'betAmount'}
                  direction={sortConfig.key === 'betAmount' ? sortConfig.direction : 'asc'}
                  onClick={() => requestSort('betAmount')}
                >
                  Bet Amount
                </TableSortLabel>
              </TableCell>
              <TableCell>Multiplier / Profit</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedBets.map((bet) => {
              const status = getPlayerStatus(bet);
              const multiplier = bet.cashedOut ? bet.cashoutMultiplier : currentMultiplier;
              const profit = bet.betAmount * (multiplier - 1);

              return (
                <StyledTableRow key={bet.userId} status={status}>
                  <TableCell>{bet.user?.name || 'Anonymous'}</TableCell>
                  <TableCell>{formatCurrency(bet.betAmount)}</TableCell>
                  <TableCell>
                    {status === 'cashed_out' && `${formatMultiplier(bet.cashoutMultiplier)}x / ${formatCurrency(profit)}`}
                    {status === 'active' && `${formatMultiplier(currentMultiplier)}x / ${formatCurrency(profit)}`}
                    {status === 'busted' && 'BUST'}
                    {status === 'betting' && 'Betting...'}
                  </TableCell>
                </StyledTableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </ListContainer>
  );
};

export default PlayerList;