import { createContext, PropsWithChildren } from 'react';
import type { MessageInstance } from 'antd/es/message/interface';
import { message } from 'antd';

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
