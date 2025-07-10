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
  IonToggle,
  IonSelectOption,
  IonSelect,
} from "@ionic/react";

import "./index.css";
import { UserProfile } from "../../types/profile";
import { useAuth } from "../../contexts/AuthContext";
import { Capacitor } from "@capacitor/core";

const Settings: React.FC = () => {
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
    <IonPage>
      <IonHeader>
        <IonToolbar style={{ height: toolbarHeight, paddingTop: "15px" }}>
          <IonTitle>Settings</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList>
          <IonItem>
            <IonLabel>Notifications</IonLabel>
            <IonToggle checked={true} onIonChange={() => {}} />
            {/* <IonToggle checked={notificationsOn} onIonChange={toggleNotifications} /> */}
          </IonItem>

          {/* <IonItem button onClick={goToSubscription}> */}
          <IonItem button onClick={() => {}}>
            <IonLabel>Subscription</IonLabel>
            <IonNote slot="end">Free</IonNote>
          </IonItem>

          <IonItem>
            <IonLabel>Language</IonLabel>
            {/* <IonSelect value={language} onIonChange={handleLanguageChange}> */}
            <IonSelect
              value={"en"}
              onIonChange={() => {}}
              interface="popover"
              interfaceOptions={{
                cssClass: "select-interface-option custom-popover",
              }}
            >
              <IonSelectOption value="en">English</IonSelectOption>
              <IonSelectOption value="fr">French</IonSelectOption>
              {/* Add more */}
            </IonSelect>
          </IonItem>

          <IonItem>
            <IonLabel>Private Profile</IonLabel>
            {/* <IonToggle checked={isPrivate} onIonChange={togglePrivacy} /> */}
            <IonToggle checked={true} onIonChange={() => {}} />
          </IonItem>

          <IonItem lines="none">
            <IonLabel color="danger">Delete Account</IonLabel>
            {/* <IonButton color="danger" onClick={confirmDelete}>Delete</IonButton> */}
            <IonButton color="danger" onClick={() => {}}>
              Delete
            </IonButton>
          </IonItem>

          {/* <IonItem button onClick={showPrivacyGuidelines}> */}
          <IonItem button onClick={() => {}}>
            <IonLabel>Privacy Guidelines</IonLabel>
          </IonItem>
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default Settings;
