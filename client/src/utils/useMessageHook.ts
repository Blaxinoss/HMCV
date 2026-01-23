// src/utils/useMessageHook.ts

import { useCallback } from 'react';
import { showMessage, MessageOptions } from './Message';

const useMessage = () => {
  const success = useCallback(
    (message: string, duration?: number) => {
      showMessage({ message, type: 'success', duration });
    },
    []
  );

  const error = useCallback(
    (message: string, duration?: number) => {
      showMessage({ message, type: 'error', duration });
    },
    []
  );

  const warning = useCallback(
    (message: string, duration?: number) => {
      showMessage({ message, type: 'warning', duration });
    },
    []
  );

  const info = useCallback(
    (message: string, duration?: number) => {
      showMessage({ message, type: 'info', duration });
    },
    []
  );

  return { success, error, warning, info };
};

export default useMessage;
