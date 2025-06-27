import React, { useState, useEffect } from "react";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonInput,
  IonButton,
  IonItem,
  IonLabel,
  IonLoading,
  IonText,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardContent,
  IonIcon,
  IonRouterLink,
  useIonRouter,
} from "@ionic/react";
import {
  logInOutline,
  personOutline,
  lockClosedOutline,
  logoApple,
} from "ionicons/icons";
import { useHistory } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import SocialAuth from "../../components/SocialAuth";
import { AuthService } from "../../services/authService";
import "./Login.css";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showLoading, setShowLoading] = useState(false);
  const history = useHistory();
  const { signIn, setSession, setProfile } = useAuth();
  const router = useIonRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    try {
      setShowLoading(true);
      setError("");

      await signIn(email, password);
    } catch (err: any) {
      setShowLoading(false);
      setError(
        err.message || "An error occurred during login. Please try again."
      );
      console.error("Login error:", err);
    } finally {
      setShowLoading(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Login</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonLoading isOpen={showLoading} message={"Logging in..."} />

        <IonGrid>
          <IonRow className="ion-justify-content-center">
            <IonCol size="12" sizeMd="8" sizeLg="6" sizeXl="4">
              <div className="login-logo">
                {/* Add your logo here */}
                <h2 className="ion-text-center">Welcome Back</h2>
              </div>

              <IonCard>
                <IonCardContent>
                  <SocialAuth
                    onError={setError}
                    onSuccess={(data) => {
                      console.log("Navigating to Profile");
                      router.push("/app/profile", "root");
                    }}
                  />

                  {error && (
                    <div className="error-message ion-text-center ion-margin-top">
                      {error}
                    </div>
                  )}
                </IonCardContent>
              </IonCard>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default Login;
