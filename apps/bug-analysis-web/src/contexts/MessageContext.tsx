import { createContext, PropsWithChildren, useCallback, useState } from 'react';
import type { MessageInstance } from 'antd/es/message/interface';
import { AppTheme } from '../utils/types';
import { message } from 'antd';
import { AuthProvider } from './AuthContext';
import { LoginRequestDto, SignupRequestDto } from '../api/auth';
import { MaybePromise } from '../utils/promises'; // Import the type

export const MessageContext = createContext<MessageInstance | null>(null);

export const MessageProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [messageApi, contextHolder] = message.useMessage();

  return (
    <MessageContext.Provider value={messageApi}>
      {contextHolder}
      {children}
    </MessageContext.Provider>
  );
};
