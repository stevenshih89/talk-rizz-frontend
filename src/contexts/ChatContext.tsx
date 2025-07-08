import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";
import { wsService, ChatMessage, ChatRoom } from "../services/WebSocketService";
import { useAuth } from "./AuthContext";
import axiosInstance from "../config/axios";
import { useHistory } from "react-router-dom";

interface ChatContextType {
  messages: { [roomId: string]: ChatMessage[] };
  rooms: ChatRoom[];
  currentRoom: string | null;
  chatLoading: boolean;
  setMessages: (messages: { [roomId: string]: ChatMessage[] }) => void;
  joinRoom: (roomId: string) => void;
  sendMessage: (content: string, roomId: string) => void;
  sendNewRoom: (room: {
    participants: string[];
    type: string;
    category: string;
  }) => void;
  leaveRoom: (roomId: string) => void;
  markMessagesAsRead: (roomId: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [messages, setMessages] = useState<{ [roomId: string]: ChatMessage[] }>(
    {}
  );
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);
  const { user, session } = useAuth();
  const [chatLoading, setChatLoading] = useState(false);
  const history = useHistory();
  const processedMessageIds = useRef<Set<string>>(new Set());
  const wsInitialized = useRef<boolean>(false);

  // Setup WebSocket connection when user is authenticated
  useEffect(() => {
    if (user && session?.access_token) {
      console.log("Connecting to WebSocket with token");
      wsService.connect(session.access_token);

      return () => {
        console.log("Disconnecting WebSocket on auth change");
        wsService.disconnect();
      };
    }
  }, [user, session?.access_token]);

  // Setup message listeners and fetch rooms
  useEffect(() => {
    const setupMessageHandlers = async () => {
      if (!session?.access_token) return;

      setChatLoading(true);

      try {
        // Fetch rooms first
        const response = await axiosInstance.get("/chat/rooms");
        setRooms(response.data);

        // Only set up WebSocket listeners if not already done
        if (!wsInitialized.current) {
          console.log("Setting up WebSocket message handlers");

          // Listen for new messages
          wsService.onMessage((message: { _doc: ChatMessage; sender: any }) => {
            console.log(
              "New message received in ChatContext:",
              message._doc._id
            );

            // Check if we've already processed this message
            if (processedMessageIds.current.has(message._doc._id)) {
              console.log(
                "Message already processed, skipping:",
                message._doc._id
              );
              return;
            }

            // Add to processed set
            processedMessageIds.current.add(message._doc._id);

            setMessages((prev) => {
              // Double-check if message already exists in state
              const existingMessages = prev[message._doc.roomId] || [];
              const messageExists = existingMessages.some(
                (msg) => msg._id === message._doc._id
              );

              if (messageExists) {
                console.log(
                  "Message already in state, skipping:",
                  message._doc._id
                );
                return prev;
              }

              console.log("Adding new message to state:", message._doc._id);
              return {
                ...prev,
                [message._doc.roomId]: [
                  ...(prev[message._doc.roomId] || []),
                  { ...message._doc, sender: message.sender },
                ],
              };
            });
          });

          // Listen for message read updates
          wsService.onMarkAsRead(
            (data: { roomId: string; senderId: string }) => {
              setMessages((prev) => {
                const roomMessages = prev[data.roomId];
                if (
                  !roomMessages?.some(
                    (msg) =>
                      msg.read === false && msg.senderId !== data.senderId
                  )
                ) {
                  return prev;
                }
                return {
                  ...prev,
                  [data.roomId]: roomMessages.map((msg) => ({
                    ...msg,
                    read: msg.senderId !== data.senderId ? true : msg.read,
                  })),
                };
              });
            }
          );

          // Listen for room updates
          wsService.socket?.on("rooms_update", (updatedRooms: ChatRoom[]) => {
            setRooms(updatedRooms);
          });

          // Listen for new rooms
          wsService.onNewRoom((room: ChatRoom) => {
            console.log("new room created", room);
            setRooms((prev) => [...prev, room]);
            if (room.participants[1] === user?.id) {
              history.push(`/app/chat/${room._id}`);
            }
          });

          wsInitialized.current = true;
        }
      } catch (error) {
        console.error("Error setting up chat:", error);
      } finally {
        setChatLoading(false);
      }
    };

    if (user && session?.access_token) {
      setupMessageHandlers();
    }

    return () => {
      // Only disconnect if component is unmounting completely
      if (!user) {
        console.log("Cleaning up WebSocket on ChatContext unmount");
        wsService.disconnect();
        wsInitialized.current = false;
      }
    };
  }, [user, session?.access_token, history]);

  const joinRoom = (roomId: string) => {
    console.log("Joining room:", roomId);
    wsService.joinRoom(roomId);
    setCurrentRoom(roomId);
  };

  const leaveRoom = (roomId: string) => {
    console.log("Leaving room:", roomId);
    wsService.leaveRoom(roomId);
    if (currentRoom === roomId) {
      setCurrentRoom(null);
    }
  };

  const sendMessage = (content: string, roomId: string) => {
    if (!user) return;

    console.log("Sending message in room:", roomId);
    wsService.sendMessage({
      content,
      roomId,
      senderId: user.id,
    });
  };

  const sendNewRoom = (room: {
    participants: string[];
    type: string;
    category: string;
  }) => {
    if (!user) return;

    wsService.sendNewRoom({
      participants: room.participants,
      type: room.type,
      category: room.category,
    });
  };

  const markMessagesAsRead = async (roomId: string) => {
    if (!user) return;

    try {
      wsService.markAsRead(roomId);
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };

  const value = {
    messages,
    rooms,
    currentRoom,
    chatLoading,
    setMessages,
    joinRoom,
    sendMessage,
    sendNewRoom,
    leaveRoom,
    markMessagesAsRead,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};
