import React, { useState, useEffect } from "react";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonToast,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonItem,
  IonNote,
  IonList,
  IonListHeader,
  IonCardHeader,
  IonCard,
  IonCardSubtitle,
  IonCardTitle,
} from "@ionic/react";

import "./index.css";
import { UserProfile } from "../../types/profile";
import { useAuth } from "../../contexts/AuthContext";
import { color } from "framer-motion";
import { Capacitor } from "@capacitor/core";

const Status: React.FC = () => {
  const { profile: authProfile, setProfile: setAuthProfile } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | undefined>(
    authProfile || undefined
  );

  const comments = [
    "I'm a software engineer with a passion for building scalable and efficient systems.",
    "He is a software engineer with a passion for building scalable and efficient systems.",
    "They are software engineer with a passion for building scalable and efficient systems.",
    "We are software engineer with a passion for building scalable and efficient systems.",
  ];

  const toolbarHeight = Capacitor.getPlatform() === "ios" ? "80px" : "60px";

  return (
    <IonPage className="h-full overflow-auto">
      <IonHeader>
        <IonToolbar style={{ height: toolbarHeight, paddingTop: "15px" }}>
          <IonTitle>Status</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="h-full overflow-auto">
        <IonCard>
          <IonCardHeader>
            <IonCardTitle style={{ color: "var(--ion-color-step-50)" }}>
              {userProfile?.basicProfile.name}
            </IonCardTitle>
            <IonCardSubtitle style={{ color: "var(--ion-color-step-50)" }}>
              Referral Code: 342314{userProfile?.rizzCode}
            </IonCardSubtitle>
          </IonCardHeader>
        </IonCard>

        <IonList>
          <IonListHeader>
            <IonLabel
              style={{ color: "var(--ion-color-step-50)", fontSize: "16px" }}
            >
              Positive Comments
            </IonLabel>
          </IonListHeader>
          {/* {userProfile?.generalProfile.comments.map((comment, idx) => (
              <IonItem key={idx}>
                <IonLabel>{comment}</IonLabel>
              </IonItem>
            ))} */}
          {comments.map((comment, idx) => (
            <IonItem key={idx}>
              <IonLabel>{comment}</IonLabel>
            </IonItem>
          ))}
        </IonList>

        <IonItem>
          <IonLabel style={{ color: "var(--ion-color-step-50)" }}>
            Connection Starter
          </IonLabel>
          <IonNote style={{ color: "var(--ion-color-step-150)" }} slot="end">
            {comments.length} connections
          </IonNote>
          {/* <IonNote slot="end">{userProfile?.generalProfile.initiatedCount} connections</IonNote> */}
        </IonItem>
      </IonContent>
    </IonPage>
  );
};

export default Status;
