import React from 'react';
import CrashGame from '@/components/CrashGame/CrashGame';
import { CrashGameProvider } from '@/contexts/CrashGameContext';

const CrashPage = () => {
  return (
    <CrashGameProvider>
      <CrashGame />
    </CrashGameProvider>
  );
};

export default CrashPage;