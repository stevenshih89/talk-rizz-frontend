import React from "react";
import { IonList, IonItem, IonLabel, IonAvatar } from "@ionic/react";
import { useChat } from "../../contexts/ChatContext";
import { useAuth } from "../../contexts/AuthContext";
import { format } from "date-fns";
import { useHistory } from "react-router-dom";

const ChatList: React.FC<{
  category: string;
  subcategory: { key: string; title: string };
}> = ({ category, subcategory }) => {
  console.log("category", category);
  console.log("subcategory", subcategory);

  const { rooms, currentRoom } = useChat();
  const { user } = useAuth();
  const history = useHistory();

  const getOtherParticipant = (participants: string[]) => {
    return participants.find((id) => id !== user?.id) || "Unknown";
  };

  return (
    <IonList>
      {rooms
        .filter((room) => {
          if (subcategory.key.length > 0) {
            return room.category === `${category} - ${subcategory.key}`;
          }
          return (
            room.category ===
            (category === "surprise me!" ? "surprise-me" : category)
          );
        })
        .map((room) => {
          const otherParticipant = getOtherParticipant(room.participants);

          return (
            <IonItem
              key={room._id}
              button
              onClick={() => {
                history.push(`/app/chat/${room._id}`);
              }}
              className={currentRoom === room._id ? "selected-room" : ""}
            >
              <IonAvatar slot="start">
                <img
                  src={
                    room.other.avatar ||
                    "https://img.icons8.com/?size=100&id=tZuAOUGm9AuS&format=png&color=000000"
                  }
                  alt="avatar"
                />
              </IonAvatar>
              <IonLabel>
                <h2>{room.other.name || otherParticipant}</h2>
                {room.lastMessage && <p>{room.lastMessage.content}</p>}
              </IonLabel>
              {room.lastActivity && (
                <IonLabel slot="end" className="ion-text-right">
                  <p>{format(new Date(room.lastActivity), "HH:mm")}</p>
                </IonLabel>
              )}
            </IonItem>
          );
        })}
    </IonList>
  );
};

export default ChatList;
