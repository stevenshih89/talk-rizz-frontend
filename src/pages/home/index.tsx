import React, { useEffect, useState } from "react";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonButton,
  IonIcon,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonGrid,
  IonRow,
  IonCol,
  IonToast,
} from "@ionic/react";
import { personCircle, chatbubbles } from "ionicons/icons";
import { useAuth } from "../../contexts/AuthContext";
import "./index.css";
import OpacityCard from "../../components/OpacityCard";
import Spinner from "../../components/Spinner";
import axiosInstance from "../../config/axios";
import { useHistory } from "react-router-dom";
import { useChat } from "../../contexts/ChatContext";
import { profileService } from "../../services/profileService";
import { connectService } from "../../services/connectService";
import { Capacitor } from "@capacitor/core";

const Home: React.FC = () => {
  const { isLoading, user, profile, connect } = useAuth();
  const { sendNewRoom } = useChat();
  const history = useHistory();
  const [rizzPoint, setRizzPoint] = useState(profile?.rizzPoint || 0);
  const [rizzCode, setRizzCode] = useState(profile?.rizzCode || "");
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    setRizzPoint(profile?.rizzPoint || 0);
    setRizzCode(profile?.rizzCode || "");
  }, [profile]);

  if (isLoading) {
    return (
      <IonPage>
        <Spinner />
      </IonPage>
    );
  }

  const addRandomUser = async () => {
    try {
      setLoading(true);

      const response = await axiosInstance.get("/chat/rooms");
      const userData = response.data;

      console.log("userData", userData);

      if (userData.length > 3) {
        setLoading(false);
        setToastMessage("You already have 3 conversations");
        setShowToast(true);
        return;
      }

      const response1 = await profileService.getOtherProfiles();
      console.log("response1", response1);
      const randomUser =
        response1.data[Math.floor(Math.random() * response1.data.length)];

      if (!randomUser) {
        setLoading(false);
        setToastMessage("No users found");
        setShowToast(true);
        return;
      }

      const handleSelectUser = async (selectedUser: any) => {
        try {
          // Create a new conversation with the selected user
          console.log("selectedUser", selectedUser);
          console.log("user", user);

          sendNewRoom({
            participants: [selectedUser.userId, user?.id],
            type: "direct",
            category: "dating",
          });
          // Redirect to the conversation page
          // history.push(`/app/chat/${newChatroom._id}`);
        } catch (error) {
          console.error("Error creating conversation:", error);
        }
      };

      await handleSelectUser(randomUser);
    } catch (error) {
      console.error("Error fetching random user:", error);
    } finally {
      setLoading(false);
    }
  };

  const toolbarHeight = Capacitor.getPlatform() === "ios" ? "80px" : "60px";

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar style={{ height: toolbarHeight, paddingTop: "0px" }}>
          <IonTitle>Home</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        {isLoading || loading ? (
          <Spinner />
        ) : (
          <>
            <IonHeader collapse="condense">
              <IonToolbar>
                <IonTitle size="large">Home</IonTitle>
              </IonToolbar>
            </IonHeader>

            <IonGrid>
              <IonRow className="ion-justify-content-center">
                <IonCol size="12" sizeMd="8" sizeLg="6">
                  <IonCard>
                    <IonCardHeader>
                      <IonCardTitle>Welcome</IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent>
                      <p>
                        Welcome to your app! Use the buttons below to navigate.
                      </p>

                      <IonRow
                        className="ion-justify-content-center ion-margin-top"
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          marginTop: "2rem",
                        }}
                      >
                        <IonButton
                          style={{
                            width: "200px",
                            height: "60px",
                            fontSize: "20px",
                          }}
                          expand="block"
                          routerLink="/app/profile"
                        >
                          <IonIcon slot="start" icon={personCircle} />
                          Profile
                        </IonButton>
                      </IonRow>
                      <IonRow
                        className="ion-justify-content-center ion-margin-top"
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          marginTop: "2rem",
                        }}
                      >
                        <IonButton
                          style={{
                            width: "200px",
                            height: "60px",
                            fontSize: "20px",
                          }}
                          expand="block"
                          // routerLink="/app/chat"
                          onClick={() => {
                            addRandomUser();
                          }}
                          color="secondary"
                        >
                          <IonIcon slot="start" icon={chatbubbles} />
                          Chat
                        </IonButton>
                      </IonRow>
                      <IonRow
                        className="ion-justify-content-center ion-margin-top"
                        style={{ marginTop: "4rem" }}
                      >
                        <IonCol size="6">
                          <OpacityCard>
                            <h2
                              className="ion-text-center"
                              style={{ fontSize: "1.5rem" }}
                            >
                              Rizz Point
                            </h2>
                            <p
                              className="ion-text-center"
                              style={{ fontSize: "1rem" }}
                            >
                              {rizzPoint}
                            </p>
                          </OpacityCard>
                        </IonCol>
                        <IonCol size="6">
                          <OpacityCard>
                            <h2
                              className="ion-text-center"
                              style={{ fontSize: "1.5rem" }}
                            >
                              Rizz Code
                            </h2>
                            <p
                              className="ion-text-center"
                              style={{ fontSize: "1rem" }}
                            >
                              {rizzCode.length > 0 ? rizzCode : "No code yet"}
                            </p>
                          </OpacityCard>
                        </IonCol>
                      </IonRow>
                    </IonCardContent>
                  </IonCard>
                </IonCol>
              </IonRow>
            </IonGrid>
            <IonToast
              isOpen={showToast}
              onDidDismiss={() => setShowToast(false)}
              message={toastMessage}
              duration={2000}
              position="bottom"
            />
          </>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Home;
