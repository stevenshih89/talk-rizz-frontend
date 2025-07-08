import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  IonContent,
  IonFooter,
  IonToolbar,
  IonInput,
  IonButton,
  IonIcon,
  IonList,
  IonItem,
  IonLabel,
  IonAvatar,
} from "@ionic/react";
import { sendOutline, checkmark, checkmarkDone } from "ionicons/icons";
import { useChat } from "../../contexts/ChatContext";
import { useAuth } from "../../contexts/AuthContext";
import { format } from "date-fns";
import { wsService, ChatMessage } from "../../services/WebSocketService";
import axiosInstance from "../../config/axios";
import { useHistory } from "react-router-dom";
import "./ChatRoom.css";

interface ChatRoomProps {
  roomId: string;
}

const ChatRoom: React.FC<ChatRoomProps> = ({ roomId }) => {
  const [message, setMessage] = useState("");
  const { messages, sendMessage, setMessages, markMessagesAsRead } = useChat();
  const roomMessages = useMemo(
    () => messages[roomId] || [],
    [messages, roomId]
  );
  const { user, session } = useAuth();
  const contentRef = useRef<HTMLDivElement>(null);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const history = useHistory();
  const hasJoinedRoom = useRef(false);

  // Fetch message history when component mounts
  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        console.log(`Fetching chat history for room: ${roomId}`);
        const response = await axiosInstance.get<ChatMessage[]>(
          `/chat/rooms/${roomId}/messages?page=1&limit=50`
        );

        // Check if we already have messages for this room
        if (messages[roomId] && messages[roomId].length > 0) {
          console.log(`Room ${roomId} already has messages, not overwriting`);
          return;
        }

        // Update messages in context with new data
        console.log(
          `Setting ${response.data.length} messages for room ${roomId}`
        );
        const updatedMessages = {
          ...messages,
          [roomId]: response.data,
        };
        setMessages(updatedMessages);
      } catch (error) {
        console.error("Error fetching chat history:", error);
        history.push("/app/chat");
      }
    };

    fetchChatHistory();
  }, [roomId, messages, setMessages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [
    roomMessages.length,
    roomMessages.filter((msg) => msg.read === false).length,
  ]);

  // Join room and set up typing events
  useEffect(() => {
    if (!wsService.socket || !session?.access_token) {
      console.log("No socket connection, reconnecting...");
      wsService.connect(session?.access_token || "");
    }

    if (!hasJoinedRoom.current) {
      console.log(`Joining room ${roomId} from ChatRoom component`);
      wsService.joinRoom(roomId);
      hasJoinedRoom.current = true;

      // Mark messages as read when joining
      wsService.markAsRead(roomId);
    }

    // Listen for typing events
    wsService.onTyping((data) => {
      if (data.userId !== user?.id && data.roomId === roomId) {
        setIsTyping(true);
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
          setIsTyping(false);
        }, 3000);
      }
    });

    // Cleanup function
    return () => {
      console.log(`Leaving room ${roomId} from ChatRoom component`);
      wsService.leaveRoom(roomId);
      hasJoinedRoom.current = false;
      clearTimeout(typingTimeoutRef.current);
    };
  }, [roomId, user?.id, session?.access_token]);

  // Mark messages as read when component mounts
  useEffect(() => {
    if (roomId && markMessagesAsRead) {
      markMessagesAsRead(roomId);
    }
  }, [roomId, markMessagesAsRead]);

  const handleSend = () => {
    if (message.trim() && user) {
      sendMessage(message, roomId);
      setMessage("");
      if (contentRef.current) {
        contentRef.current.scrollTop = contentRef.current.scrollHeight;
      }
    }
  };

  const handleTyping = () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    wsService.emitTyping(roomId);
    typingTimeoutRef.current = setTimeout(() => {
      // Clear typing timeout
    }, 3000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSend();
    } else {
      handleTyping();
    }
  };

  return (
    <div
      className="chat-container"
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "#0B141A",
      }}
    >
      <IonContent className="chat-content" scrollEvents={true}>
        <div
          ref={contentRef}
          className="messages-container"
          style={{
            height: "100%",
            overflowY: "auto",
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          {roomMessages.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center"
              style={{ height: "calc(100% - 20px)" }}
            >
              <IonLabel className="text-xl" style={{ color: "#8696A0" }}>
                No messages yet
              </IonLabel>
            </div>
          ) : (
            roomMessages.map((msg, index) => (
              <div
                key={msg._id || index}
                className={`message-wrapper ${
                  msg.senderId === user?.id ? "sent" : "received"
                }`}
                style={{
                  display: "flex",
                  justifyContent:
                    msg.senderId === user?.id ? "flex-end" : "flex-start",
                  marginBottom: "8px",
                }}
              >
                <div
                  className={`message-bubble ${
                    msg.senderId === user?.id ? "sent" : "received"
                  }`}
                  style={{
                    maxWidth: "65%",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    backgroundColor:
                      msg.senderId === user?.id ? "#005C4B" : "#202C33",
                    color: "#E9EDF0",
                  }}
                >
                  <div
                    className="message-content"
                    style={{ marginBottom: "4px" }}
                  >
                    {msg.content}
                  </div>
                  <div
                    className="message-meta"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      justifyContent: "flex-end",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "11px",
                        color: "#8696A0",
                        marginRight: msg.senderId === user?.id ? "4px" : "0",
                      }}
                    >
                      {format(new Date(msg.timestamp), "HH:mm")}
                    </span>
                    {msg.senderId === user?.id && (
                      <IonIcon
                        icon={msg.read ? checkmarkDone : checkmark}
                        style={{
                          fontSize: "14px",
                          color: msg.read ? "#53BDEB" : "#8696A0",
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
          {isTyping && (
            <div
              className="typing-indicator"
              style={{ color: "#8696A0", fontSize: "14px", padding: "8px" }}
            >
              Someone is typing...
            </div>
          )}
        </div>
      </IonContent>
      <IonFooter className="chat-footer" style={{ backgroundColor: "#202C33" }}>
        <div
          style={{ display: "flex", alignItems: "center", padding: "8px 16px" }}
        >
          <div
            style={{
              position: "relative",
              width: "100%",
              display: "flex",
              alignItems: "center",
              backgroundColor: "#2A3942",
              borderRadius: "8px",
              padding: "6px 12px",
            }}
          >
            <IonInput
              value={message}
              placeholder="Message"
              onIonInput={(e) => setMessage(e.detail.value || "")}
              onKeyDown={handleKeyPress}
              style={{
                "--placeholder-color": "#8696A0",
                "--color": "#E9EDF0",
              }}
            />
            <IonButton
              onClick={handleSend}
              disabled={!message.trim()}
              fill="clear"
              style={{
                margin: 0,
                "--color": "#00A884",
                "--padding-start": "8px",
                "--padding-end": "8px",
              }}
            >
              <IonIcon icon={sendOutline} style={{ fontSize: "24px" }} />
            </IonButton>
          </div>
        </div>
      </IonFooter>
    </div>
  );
};

export default ChatRoom;
