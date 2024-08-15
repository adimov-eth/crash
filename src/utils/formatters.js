// src/utils/formatters.js
import numeral from 'numeral';

export const formatCurrency = (amount, format = '0,0.00') => {
    return numeral(amount).format(format);
};

export const formatMultiplier = (multiplier) => {
    return `${numeral(multiplier).format('0,0.00')}x`;
};

export const formatElapsedTime = (elapsed) => {
    return `${(elapsed / 1000).toFixed(2)}s`;
};

export const formatLargeNumber = (number) => {
    const formats = ['0a', '0.0a', '0.00a'];
    const format = formats.find(f => numeral(number).format(f) !== '0');
    return numeral(number).format(format || '0,0');
};

export const formatDecimal = (number, decimals = 2) => {
    return number.toFixed(decimals);
};

export const formatPercentage = (number) => {
    return `${(number * 100).toFixed(2)}%`;
};

export const formatDate = (date) => {
    return date.toLocaleString();
};

export const truncateString = (str, maxLength) => {
    if (str.length <= maxLength) return str;
    return str.slice(0, maxLength - 3) + '...';
};