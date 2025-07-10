import React, { useEffect, useState } from "react";
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
  IonModal,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
} from "@ionic/react";
import { useParams } from "react-router";
import { useAuth } from "../../contexts/AuthContext";
import { useChat } from "../../contexts/ChatContext";
import ChatRoom from "../../components/Chat/ChatRoom";
import Spinner from "../../components/Spinner";
import { useHistory } from "react-router-dom";
import axiosInstance from "../../config/axios";
import "./Chat.css";
import { Capacitor } from "@capacitor/core";

interface ConversationParams {
  roomId: string;
}

const Conversation: React.FC = () => {
  const { roomId } = useParams<ConversationParams>();
  const { user, profile } = useAuth();
  const { joinRoom, leaveRoom, chatLoading, rooms } = useChat();
  const [otherUser, setOtherUser] = useState<string | undefined>(undefined);
  const [showModal, setShowModal] = useState(false);
  const [otherUserProfile, setOtherUserProfile] = useState<any>(null);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const history = useHistory();

  useEffect(() => {
    if (!user) {
      return;
    }
    if (roomId) {
      joinRoom(roomId);
    }

    return () => {
      if (roomId) {
        leaveRoom(roomId);
      }
    };
  }, [user, roomId, joinRoom, leaveRoom]);

  if (!user) {
    return <Spinner />;
  }

  const currentRoom = rooms.find((room) => room._id === roomId);

  useEffect(() => {
    if (otherUser) {
      setIsModalLoading(true);
      axiosInstance.get(`/profile/${otherUser}`).then((response: any) => {
        console.log("response", response.data);
        setOtherUserProfile(response.data);
        setIsModalLoading(false);
      });
    }
  }, [otherUser]);

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
              <div className="flex justify-between items-center flex-row">
                <IonButtons slot="start">
                  <IonBackButton defaultHref="/app/chat" />
                </IonButtons>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    marginLeft: "40px",
                    marginRight: "40px",
                  }}
                  onClick={() => {
                    if (otherUser) {
                      setOtherUser(undefined);
                    } else {
                      setOtherUser(
                        currentRoom?.participants.find((id) => id !== user?.id)
                      );
                    }
                    setShowModal((showModal) => !showModal);
                  }}
                >
                  <IonAvatar style={{ width: "32px", height: "32px" }}>
                    <IonImg
                      src={
                        currentRoom?.other.avatar ||
                        "https://ionicframework.com/docs/img/demos/avatar.svg"
                      }
                      alt={currentRoom?.other.name}
                    />
                  </IonAvatar>
                  <IonTitle>{currentRoom?.other.name}</IonTitle>
                </div>
                <div
                  className="flex justify-end items-center mr-4 text-red-500"
                  onClick={() => {
                    history.push(`/app/chat/${currentRoom?._id}/report`);
                  }}
                >
                  <h2>Report</h2>
                </div>
              </div>
            </IonToolbar>
          </IonHeader>

          <IonContent>
            {roomId ? (
              <ChatRoom roomId={roomId} />
            ) : (
              <div className="no-chat-selected">
                <p>Select a conversation to start chatting</p>
              </div>
            )}
          </IonContent>

          <IonModal
            className="w-[80%] h-[80%] m-auto rounded-md"
            isOpen={showModal && !!otherUser}
            onDidDismiss={() => setShowModal(false)}
          >
            {isModalLoading ? (
              <div className="flex justify-center items-center h-full">
                <IonSpinner />
              </div>
            ) : (
              <IonCard className="w-full h-full">
                <IonCardContent className="flex flex-col gap-4 items-center h-full">
                  <IonAvatar
                    style={{
                      width: "128px",
                      height: "128px",
                      margin: "0 auto",
                    }}
                  >
                    <IonImg
                      src={
                        currentRoom?.other.avatar ||
                        "https://ionicframework.com/docs/img/demos/avatar.svg"
                      }
                      alt={currentRoom?.other.name}
                    />
                  </IonAvatar>
                  <div className="w-full h-full overflow-y-auto flex flex-col gap-4 mt-4 ">
                    <span className="!text-xl">
                      General: {otherUserProfile?.generalProfile.general}
                    </span>
                    <span className="!text-xl">
                      Gender: {otherUserProfile?.basicProfile.gender}
                    </span>
                    <span className="!text-xl">
                      Location: {otherUserProfile?.basicProfile.location}
                    </span>
                  </div>
                </IonCardContent>
              </IonCard>
            )}
          </IonModal>
        </>
      )}
    </IonPage>
  );
};

export default Conversation;
