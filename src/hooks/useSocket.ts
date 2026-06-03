import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/store";

export function useSocket(conversationId?: string | null) {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    if (!token) return;

    const wsUrl = import.meta.env.VITE_WS_URL ?? "http://localhost:3000";
    
    // Connect to socket.io server
    const socket = io(wsUrl, {
      auth: {
        token: `Bearer ${token}`,
      },
      transports: ["websocket"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
      console.log("WebSocket connected!");
      if (conversationId) {
        socket.emit("join_room", { conversationId });
      }
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
      console.log("WebSocket disconnected!");
    });

    return () => {
      socket.disconnect();
    };
  }, [token, conversationId]);

  const joinRoom = (convId: string) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit("join_room", { conversationId: convId });
    }
  };

  const sendMessage = (convId: string, content: string) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit("send_message", {
        conversationId: convId,
        content,
      });
    }
  };

  const sendTyping = (convId: string, isTyping: boolean) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit("typing", {
        conversationId: convId,
        isTyping,
      });
    }
  };

  return {
    socket: socketRef.current,
    isConnected,
    joinRoom,
    sendMessage,
    sendTyping,
  };
}
