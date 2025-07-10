import React, { useEffect } from "react";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonSpinner,
  IonImg,
  IonAvatar,
  IonButton,
  IonIcon,
} from "@ionic/react";
import { useParams } from "react-router";
import { useAuth } from "../../contexts/AuthContext";
import { useChat } from "../../contexts/ChatContext";
import ChatbotRoom from "../../components/Chat/ChatbotRoom";
import Spinner from "../../components/Spinner";
import { arrowBack } from "ionicons/icons";
import "./Chat.css";
import { Capacitor } from "@capacitor/core";

interface ChatbotParams {
  mode: string;
}

const Chatbot: React.FC = () => {
  const { mode } = useParams<ChatbotParams>();
  const { user } = useAuth();
  const { chatLoading } = useChat();

  if (!user) {
    return <Spinner />;
  }

  const toolbarHeight = Capacitor.getPlatform() === "ios" ? "80px" : "60px";

  return (
    <IonPage>
      {chatLoading ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
          }}
        >
          <IonSpinner />
        </div>
      ) : (
        <>
          <IonHeader>
            <IonToolbar style={{ height: toolbarHeight, paddingTop: "0px" }}>
              <div className="relative chat-header">
                <IonButtons
                  slot="start"
                  style={{ position: "absolute", left: 0 }}
                >
                  <IonButton onClick={() => history.back()}>
                    <IonIcon icon={arrowBack} />
                  </IonButton>
                </IonButtons>
                <h1 className="absolute left-1/2 -translate-x-1/2 m-0 w-full text-center">
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </h1>
              </div>
            </IonToolbar>
          </IonHeader>

          <IonContent>
            <ChatbotRoom mode={mode} />
          </IonContent>
        </>
      )}
    </IonPage>
  );
};

export default Chatbot;
