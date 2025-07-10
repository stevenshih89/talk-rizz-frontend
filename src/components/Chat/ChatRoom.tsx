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
import { Capacitor } from "@capacitor/core";

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
  const { user } = useAuth();
  const contentRef = useRef<HTMLDivElement>(null);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  // const [roomMessages, setRoomMessages] = useState<ChatMessage[]>([]);
  const history = useHistory();

  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        const response = await axiosInstance.get<ChatMessage[]>(
          `/chat/rooms/${roomId}/messages?page=1&limit=50`
        );
        setMessages({
          ...messages,
          [roomId]: response.data,
        });
      } catch (error) {
        history.push("/app/chat");
        console.error("Error fetching chat history:", error);
      }
    };
    fetchChatHistory();
  }, []);

  // useEffect(() => {
  //   if (messages[roomId]) {
  //     setRoomMessages(messages[roomId]);
  //   }
  // }, [messages]);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [
    roomMessages.length,
    roomMessages.filter((msg) => msg.read === false).length,
  ]);

  useEffect(() => {
    let timerId: NodeJS.Timeout;
    wsService.onTyping(({ userId, roomId: typingRoomId }) => {
      if (roomId === typingRoomId && userId !== user?.id) {
        console.log("typing...");
        // Clear any existing timeout
        if (timerId) {
          clearTimeout(timerId);
        }
        setIsTyping(true);
        // Set new timeout
        timerId = setTimeout(() => setIsTyping(false), 3000);
      }
    });

    return () => {
      if (timerId) {
        clearTimeout(timerId);
      }
    };
  }, [roomId, user?.id]);

  // Mark messages as read when component mounts
  useEffect(() => {
    if (roomId && markMessagesAsRead) {
      markMessagesAsRead(roomId);
    }
  }, [roomId, markMessagesAsRead]);

  // Mark messages as read when scrolling to bottom
  // useEffect(() => {
  //   const handleScroll = () => {
  //     if (contentRef.current) {
  //       const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
  //       if (scrollHeight - scrollTop <= clientHeight + 100) {
  //         markMessagesAsRead(roomId);
  //       }
  //     }
  //   };

  //   const contentElement = contentRef.current;
  //   if (contentElement) {
  //     contentElement.addEventListener("scroll", handleScroll);
  //     return () => contentElement.removeEventListener("scroll", handleScroll);
  //   }
  // }, [roomId, markMessagesAsRead]);

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

  const footerMarginBottom =
    Capacitor.getPlatform() === "ios" ? "135px" : "0px";

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
                key={index}
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
                      msg.senderId === user?.id ? "#007AFF" : "#E6E6E8",
                    color: msg.senderId === user?.id ? "#E9EDF0" : "##1e1e1e",
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
      <IonFooter
        className="chat-footer"
        style={{ backgroundColor: "#e6e6e8", marginBottom: footerMarginBottom }}
      >
        <div
          style={{ display: "flex", alignItems: "center", padding: "8px 16px" }}
        >
          <div
            style={{
              position: "relative",
              width: "100%",
              display: "flex",
              alignItems: "center",
              backgroundColor: "#ffffff",
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
                "--color": "#000000",
              }}
            />
            <IonButton
              onClick={handleSend}
              disabled={!message.trim()}
              fill="clear"
              style={{
                margin: 0,
                "--color": "#F46F1C",
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
