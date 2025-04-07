import { createContext } from 'react';
import type { MessageInstance } from 'antd/es/message/interface'; // Import the type

export const MessageContext = createContext<MessageInstance | null>(null);
