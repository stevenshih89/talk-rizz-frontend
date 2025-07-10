import React, { useState, useRef, useEffect } from "react";
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
import { useAuth } from "../../contexts/AuthContext";
import { format } from "date-fns";
import axiosInstance from "../../config/axios";
import { useHistory } from "react-router-dom";
import "./ChatbotRoom.css";
import { Capacitor } from "@capacitor/core";

interface ChatbotRoomProps {
  mode: string;
}

interface ChatbotRoom {
  _id: string;
  mode: string;
}

type ChatbotRoomMessage = {
  _id: string;
  content: string;
  senderId: string;
  timestamp: Date;
};

const ChatbotRoom: React.FC<ChatbotRoomProps> = ({ mode }) => {
  const [message, setMessage] = useState("");
  const { user } = useAuth();
  const contentRef = useRef<HTMLDivElement>(null);
  const [room, setRoom] = useState<ChatbotRoom>();
  const [roomMessages, setRoomMessages] = useState<ChatbotRoomMessage[]>([]);
  const history = useHistory();

  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        const response = await axiosInstance.get<{
          room: ChatbotRoom;
          messages: ChatbotRoomMessage[];
        }>(`/chatbot/rooms/${mode}/messages?page=1&limit=50`);

        console.log("response", response.data);

        setRoom(response.data.room);
        setRoomMessages(response.data.messages);
      } catch (error) {
        // history.push("/app/chat");
        console.error("Error fetching chat history:", error);
      }
    };
    fetchChatHistory();
  }, []);

  const sendMessage = async (message: string, mode: string) => {
    try {
      const response = await axiosInstance.post(`/chatbot/${mode}/messages`, {
        content: message,
      });

      setRoomMessages((roomMessages) => [...roomMessages, response.data]);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [roomMessages]);

  const handleSend = () => {
    if (message.trim() && user) {
      setRoomMessages((roomMessages) => [
        ...roomMessages,
        {
          _id: user.id + " - " + new Date().getTime(),
          content: message,
          senderId: user.id,
          timestamp: new Date(),
        },
      ]);
      sendMessage(message, mode);
      setMessage("");
      if (contentRef.current) {
        contentRef.current.scrollTop = contentRef.current.scrollHeight;
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  const footerMarginBottom = Capacitor.getPlatform() === "ios" ? "135px" : "0";

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
                  !msg.senderId.includes("bot") ? "sent" : "received"
                }`}
                style={{
                  display: "flex",
                  justifyContent: !msg.senderId.includes("bot")
                    ? "flex-end"
                    : "flex-start",
                  marginBottom: "8px",
                }}
              >
                <div
                  className={`message-bubble ${
                    !msg.senderId.includes("bot") ? "sent" : "received"
                  }`}
                  style={{
                    maxWidth: "65%",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    backgroundColor: !msg.senderId.includes("bot")
                      ? "#005C4B"
                      : "#202C33",
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
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </IonContent>
      <IonFooter
        className="chat-footer"
        style={{
          backgroundColor: "#202C33",
          marginBottom: footerMarginBottom,
        }}
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

export default ChatbotRoom;
