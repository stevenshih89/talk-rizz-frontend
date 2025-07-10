import React, { useState, useEffect } from "react";
import {
  IonContent,
  IonPage,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonToggle,
  IonIcon,
  IonCard,
  IonCardContent,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonTitle,
  IonInput,
  IonRange,
  IonGrid,
  IonRow,
  IonCol,
  IonToast,
} from "@ionic/react";
import { useParams, useHistory } from "react-router-dom";
import {
  warningOutline,
  arrowBackOutline,
  checkmarkOutline,
  starOutline,
  trashOutline,
} from "ionicons/icons";
import axiosInstance from "../../config/axios";
import { connectService } from "../../services/connectService";
import { useAuth } from "../../contexts/AuthContext";
import { profileService } from "../../services/profileService";
import Spinner from "../../components/Spinner";
import {
  getReportMessages,
  sendReportMessage,
} from "../../services/reportService";
import { Capacitor } from "@capacitor/core";

interface ReportChatParams {
  roomId: string;
  reason: string;
}

interface Report {
  roomId: string;
  reportType: string;
  reportDescription: string;
  senderId?: string;
  timestamp: Date;
}
const reportReasons = [
  {
    text: "I like talking to this person",
    type: "like",
    color: "success",
    prompt:
      "What do you like about this person? Let me know and I will provide more of this kind of person to you.",
  },
  {
    text: "Not interested",
    type: "notVibe",
    color: "warning",
    prompt:
      "What don't you like about talking to this person? Let me know and I will try to match you better.",
  },
  {
    text: "Report this person",
    type: "report",
    color: "danger",
    prompt:
      "I'm sorry to hear that you don't like this person, and if this person was disrespectful, let me know and we will verify it. If it's true, we will block this person for a month so they cannot connect with other people again during that time. But if it is untrue, then we will have to block you for a week. Users who are blocked by others too many times will be permanently unable to use this app anymore. Thank you for letting us know.",
  },
];

const ReportChat: React.FC = () => {
  const { connect, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const { roomId, reason } = useParams<ReportChatParams>();
  const history = useHistory();
  const [detailMode, setDetailMode] = useState("");
  const [messages, setMessages] = useState<Report[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Initialize messages after reason is available
  useEffect(() => {
    const fetchMessages = async () => {
      const response = await getReportMessages(
        roomId,
        reportReasons[parseInt(reason)].type as "like" | "notVibe" | "report"
      );
      console.log(response);
      setMessages([
        {
          roomId,
          reportType: reportReasons[parseInt(reason)].type,
          reportDescription: reportReasons[parseInt(reason)].prompt,
          timestamp: new Date(),
        },
        ...response,
      ]);
    };
    fetchMessages();
  }, [reason]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    setNewMessage("");
    setLoading(true);

    try {
      // Here you would typically send the message to your backend
      const response = await sendReportMessage(
        roomId,
        newMessage,
        reportReasons[parseInt(reason)].type as "like" | "notVibe" | "report"
      );
      setMessages((prev) => [...prev, response]);
    } catch (error) {
      setToastMessage("Failed to send message. Please try again.");
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toolbarHeight = Capacitor.getPlatform() === "ios" ? "80px" : "60px";

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar style={{ height: toolbarHeight, paddingTop: "0px" }}>
          <IonButtons
            slot="start"
            style={{ position: "absolute", left: "8px" }}
            onClick={() => {
              if (detailMode) {
                setDetailMode("");
              } else {
                history.goBack();
              }
            }}
          >
            <IonIcon icon={arrowBackOutline} />
          </IonButtons>
          <div
            style={{ display: "flex", justifyContent: "center", width: "100%" }}
          >
            <IonTitle>Report</IonTitle>
          </div>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {loading ? (
          <Spinner />
        ) : (
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={new Date(message.timestamp).getTime()}
                  className={`flex ${
                    message.senderId === user?.id
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.senderId === user?.id
                        ? "bg-primary text-white"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    <p className="text-sm">{message.reportDescription}</p>
                    <span className="text-xs opacity-70">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t">
              <div className="flex items-center space-x-2">
                <IonInput
                  value={newMessage}
                  onIonChange={(e) => setNewMessage(e.detail.value!)}
                  placeholder="Type your message..."
                  className="flex-1"
                  onKeyPress={handleKeyPress}
                />
                <IonButton
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  color={reportReasons[parseInt(reason)].color as any}
                >
                  Send
                </IonButton>
              </div>
            </div>
          </div>
        )}
      </IonContent>
      <IonToast
        isOpen={showToast}
        message={toastMessage}
        duration={3000}
        onDidDismiss={() => setShowToast(false)}
      />
    </IonPage>
  );
};

export default ReportChat;
