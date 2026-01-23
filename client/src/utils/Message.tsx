// src/utils/Message.tsx

import React, { useEffect, useState } from 'react';

export type MessageType = 'success' | 'error' | 'warning' | 'info';

export interface MessageOptions {
  message: string;
  type: MessageType;
  duration?: number;
}

interface MessageState {
  message: string;
  type: MessageType;
  visible: boolean;
}

let messageCallback: ((state: MessageState) => void) | null = null;

export const showMessage = (options: MessageOptions) => {
  const { message, type, duration = 3000 } = options;

  if (messageCallback) {
    messageCallback({
      message,
      type,
      visible: true,
    });

    setTimeout(() => {
      if (messageCallback) {
        messageCallback({
          message: '',
          type: 'info',
          visible: false,
        });
      }
    }, duration);
  }
};

interface MessageProps {
  onStateChange: (state: MessageState) => void;
}

const Message: React.FC<MessageProps> = ({ onStateChange }) => {
  const [state, setState] = useState<MessageState>({
    message: '',
    type: 'info',
    visible: false,
  });

  messageCallback = setState;

  useEffect(() => {
    onStateChange(state);
  }, [state]);

  if (!state.visible) return null;

  const bgColor = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500',
  }[state.type];

  return (
    <div
      className={`fixed top-4 right-4 px-6 py-3 rounded shadow-lg text-white font-semibold ${bgColor} z-50 animate-pulse`}
    >
      {state.message}
    </div>
  );
};

export default Message;
