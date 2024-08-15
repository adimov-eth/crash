// src/services/crashApi.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export const getActiveGame = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/crash/active`);
    return response.data;
  } catch (error) {
    console.error('Error fetching active game:', error);
    throw error;
  }
};

export const placeBet = async (amount, autoCashoutAt = null) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/crash/bet`, { amount, autoCashoutAt });
    return response.data;
  } catch (error) {
    console.error('Error placing bet:', error);
    throw error;
  }
};

export const cashout = async (gameId) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/crash/cashout`, { gameId });
    return response.data;
  } catch (error) {
    console.error('Error cashing out:', error);
    throw error;
  }
};

export const getGameHistory = async (limit = 50) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/crash/history?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching game history:', error);
    throw error;
  }
};