import React, { useState } from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonTitle,
  IonContent,
  IonButton,
  IonModal,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
} from "@ionic/react";
import { useParams, useHistory } from "react-router";
import { Capacitor } from "@capacitor/core";

interface ReportParams {
  roomId: string;
}

const Report: React.FC = () => {
  const { roomId } = useParams<ReportParams>();
  const history = useHistory();
  const [showModal, setShowModal] = useState(false);

  const reportReasons = [
    { text: "I like talking to them", color: "success" },
    { text: "We don't vibe", color: "warning" },
    { text: "Report this person", color: "danger" },
  ];

  const handleSubmit = (index: number) => {
    // Handle other report submissions
    console.log("Reported for:", index);
    history.push(`/app/chat/${roomId}/report/${index}`);
  };

  const toolbarHeight = Capacitor.getPlatform() === "ios" ? "80px" : "60px";

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar style={{ height: toolbarHeight, paddingTop: "0px" }}>
          <IonButtons slot="start">
            <IonBackButton defaultHref={`/app/chat/${roomId}`} />
          </IonButtons>
          <IonTitle>Report User</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <div className="ion-padding">
          {reportReasons.map((reason, index) => (
            <IonButton
              key={index}
              expand="block"
              onClick={() => handleSubmit(index)}
              className="mb-3"
              color={reason.color}
            >
              {reason.text}
            </IonButton>
          ))}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Report;
