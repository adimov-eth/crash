import React, { useState, useEffect } from 'react';
import { TextField, Button, Switch, FormControlLabel, Tooltip } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useCrashGame } from '../../contexts/CrashGameContext';
import { GAME_STATES } from '../../utils/constants';
import { formatCurrency } from '../../utils/formatters';

const ControlsContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
}));

const ButtonsContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
}));

const GameControls = () => {
  const {
    gameState,
    playerBet,
    placeBet,
    cashout,
    setAutoCashoutMultiplier,
    formattedMultiplier,
    formattedCashoutAmount,
  } = useCrashGame();

  const [betAmount, setBetAmount] = useState('');
  const [autoCashoutAt, setAutoCashoutAt] = useState('');
  const [isAutoBetting, setIsAutoBetting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (gameState === GAME_STATES.STARTING) {
      setError('');
    }
  }, [gameState]);

  const handlePlaceBet = async () => {
    try {
      setError('');
      await placeBet(parseFloat(betAmount), isAutoBetting ? parseFloat(autoCashoutAt) : null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCashout = async () => {
    try {
      setError('');
      await cashout();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAutoBetToggle = (event) => {
    setIsAutoBetting(event.target.checked);
    if (event.target.checked) {
      setAutoCashoutMultiplier(parseFloat(autoCashoutAt));
    } else {
      setAutoCashoutMultiplier(null);
    }
  };

  const isBettingPhase = gameState === GAME_STATES.STARTING;
  const isActiveGame = gameState === GAME_STATES.ACTIVE;
  const hasBet = !!playerBet;

  return (
    <ControlsContainer>
      <TextField
        label="Bet Amount"
        type="number"
        value={betAmount}
        onChange={(e) => setBetAmount(e.target.value)}
        disabled={!isBettingPhase || hasBet}
      />
      <FormControlLabel
        control={
          <Switch
            checked={isAutoBetting}
            onChange={handleAutoBetToggle}
            disabled={!isBettingPhase || hasBet}
          />
        }
        label="Auto Betting"
      />
      {isAutoBetting && (
        <TextField
          label="Auto Cashout At"
          type="number"
          value={autoCashoutAt}
          onChange={(e) => setAutoCashoutAt(e.target.value)}
          disabled={!isBettingPhase || hasBet}
        />
      )}
      <ButtonsContainer>
        {isBettingPhase && !hasBet && (
          <Button variant="contained" color="primary" onClick={handlePlaceBet} fullWidth>
            Place Bet
          </Button>
        )}
        {isActiveGame && hasBet && (
          <Tooltip title={`Cashout at ${formattedMultiplier}`}>
            <Button variant="contained" color="secondary" onClick={handleCashout} fullWidth>
              Cashout {formattedCashoutAmount}
            </Button>
          </Tooltip>
        )}
      </ButtonsContainer>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {hasBet && (
        <div>
          Current Bet: {formatCurrency(playerBet.amount)}
          {playerBet.autoCashoutAt && ` (Auto cashout at ${playerBet.autoCashoutAt}x)`}
        </div>
      )}
    </ControlsContainer>
  );
};

export default GameControls;