import React, { useState } from "react";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonGrid,
  IonRow,
  IonCol,
  IonSpinner,
  IonButtons,
  IonButton,
  IonIcon,
} from "@ionic/react";
import { arrowBack } from "ionicons/icons";
import { useAuth } from "../../contexts/AuthContext";
import Spinner from "../../components/Spinner";
import ChatList from "../../components/Chat/ChatList";
import CategoryMenu from "../../components/Chat/CategoryMenu";
import { useChat } from "../../contexts/ChatContext";
import { useHistory } from "react-router-dom";
import "./Chat.css";
import { Capacitor } from "@capacitor/core";

const Chat: React.FC = () => {
  const { user, isLoading } = useAuth();
  const { chatLoading } = useChat();
  const history = useHistory();
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedSubcategory, setSelectedSubcategory] = useState<{
    key: string;
    title: string;
  }>({ key: "", title: "" });
  const [assistMode, setAssistMode] = useState<string>("");

  if (!user) {
    return <Spinner />;
  }

  const handleCategorySelect = (
    category: string,
    subcategory: { key: string; title: string }
  ) => {
    setSelectedCategory(category);
    setSelectedSubcategory(subcategory);
  };

  const handleBack = () => {
    // if (selectedCategory.includes("assistant") && assistMode.length > 0) {
    //   setAssistMode("");
    // } else {
    setSelectedCategory("");
    setSelectedSubcategory({ key: "", title: "" });
    // }
  };

  const renderContent = () => {
    if (selectedCategory) {
      return (
        <>
          {selectedCategory.includes("assistant") ? (
            <div className="flex flex-row gap-4 justify-center p-4">
              <IonButton
                className="w-full"
                onClick={() => history.push(`/app/chatbot/suggestion`)}
              >
                Suggestion
              </IonButton>
              <IonButton
                className="w-full"
                onClick={() => history.push(`/app/chatbot/report`)}
              >
                Report
              </IonButton>
            </div>
          ) : (
            <ChatList
              category={selectedCategory}
              subcategory={selectedSubcategory}
            />
          )}
        </>
      );
    }
    return <CategoryMenu onSelectSubcategory={handleCategorySelect} />;
  };

  const toolbarHeight = Capacitor.getPlatform() === "ios" ? "80px" : "60px";

  return (
    <IonPage>
      {isLoading || chatLoading ? (
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
            <IonToolbar style={{ height: toolbarHeight, paddingTop: "15px" }}>
              <div className="relative chat-header">
                {selectedCategory && (
                  <IonButtons
                    slot="start"
                    style={{ position: "absolute", left: 0 }}
                  >
                    <IonButton onClick={handleBack}>
                      <IonIcon icon={arrowBack} />
                    </IonButton>
                  </IonButtons>
                )}
                <IonTitle>
                  {selectedCategory
                    ? selectedSubcategory.title.length > 0
                      ? `${
                          selectedCategory[0].toUpperCase() +
                          selectedCategory.slice(1)
                        } - ${selectedSubcategory.title}`
                      : selectedCategory
                    : "Messages"}
                </IonTitle>
              </div>
            </IonToolbar>
          </IonHeader>

          <IonContent>
            <IonGrid>
              <IonRow>
                <IonCol>{renderContent()}</IonCol>
              </IonRow>
            </IonGrid>
          </IonContent>
        </>
      )}
    </IonPage>
  );
};

export default Chat;
