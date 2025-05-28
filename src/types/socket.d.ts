// src/types/socket.d.ts
import { Socket } from 'socket.io';

declare module 'socket.io' {
  interface Socket {
    decodedToken?: any; // You can specify a more specific type here based on your decoded token
  }
}
