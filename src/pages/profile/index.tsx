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
} from "@ionic/react";
import { useAuth } from "../../contexts/AuthContext";
import { Profile } from "../../components/Profile/Profile";
import { ProfileEditor } from "../../components/Profile/ProfileEditor";
import { UserProfile } from "../../types/profile";
import "./index.css";
import { Capacitor } from "@capacitor/core";

const ProfilePage: React.FC = () => {
  const { profile: authProfile, setProfile: setAuthProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [userProfile, setUserProfile] = useState<UserProfile | undefined>(
    authProfile || undefined
  );

  useEffect(() => {
    // Convert the auth profile to the UserProfile format
    if (authProfile) {
      const formattedProfile: UserProfile = {
        ...authProfile,
        basicProfile: {
          ...authProfile.basicProfile,
        },
        generalProfile: {
          ...authProfile.generalProfile,
        },
      };
      setUserProfile(formattedProfile);
    }
  }, [authProfile]);

  const handleProfileSave = async (updatedProfile: UserProfile) => {
    try {
      // Update the profile in the backend
      console.log("Updating profile:", updatedProfile);

      // Update local state
      setAuthProfile(updatedProfile as UserProfile);
      setUserProfile(updatedProfile);
      setIsEditing(false);

      setToastMessage("Profile updated successfully");
      setShowToast(true);
    } catch (error) {
      console.error("Error updating profile:", error);
      setToastMessage("Failed to update profile");
      setShowToast(true);
    }
  };

  if (!userProfile) {
    return null; // or a loading spinner
  }

  const toolbarHeight = Capacitor.getPlatform() === "ios" ? "80px" : "60px";

  return (
    <IonPage className="h-full overflow-auto">
      <IonHeader>
        <IonToolbar style={{ height: toolbarHeight, paddingTop: "0px" }}>
          <IonTitle style={{ textAlign: "center" }}>Profile</IonTitle>
          <IonButton
            slot="end"
            onClick={() => setIsEditing(!isEditing)}
            className="ion-margin-end"
          >
            {isEditing ? "Cancel" : "Edit"}
          </IonButton>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        {isEditing ? (
          <ProfileEditor
            initialProfile={userProfile}
            onSave={handleProfileSave}
          />
        ) : (
          <Profile profile={userProfile} showDatingProfile={true} />
        )}

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={2000}
          position="bottom"
        />
      </IonContent>
    </IonPage>
  );
};

export default ProfilePage;
