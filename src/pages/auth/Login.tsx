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
} from "@ionic/react";
import { logInOutline, personOutline, lockClosedOutline } from "ionicons/icons";
import { useHistory } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import SocialAuth from "../../components/SocialAuth";
import "./Login.css";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>("");
  const [showLoading, setShowLoading] = useState(false);
  const history = useHistory();
  const { signIn } = useAuth();

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
                  {/* <form onSubmit={handleLogin}>
                    {error && (
                      <IonText color="danger">
                        <p className="ion-text-center">{error}</p>
                      </IonText>
                    )}

                    <IonItem>
                      <IonIcon icon={personOutline} slot="start" />
                      <IonLabel position="floating">Email</IonLabel>
                      <IonInput
                        type="email"
                        value={email}
                        onIonChange={(e) => setEmail(e.detail.value!)}
                        required
                      />
                    </IonItem>

                    <IonItem className="ion-margin-bottom">
                      <IonIcon icon={lockClosedOutline} slot="start" />
                      <IonLabel position="floating">Password</IonLabel>
                      <IonInput
                        type="password"
                        value={password}
                        onIonChange={(e) => setPassword(e.detail.value!)}
                        required
                      />
                    </IonItem>

                    <IonButton
                      expand="block"
                      type="submit"
                      className="ion-margin-top"
                    >
                      <IonIcon icon={logInOutline} slot="start" />
                      Login
                    </IonButton>

                    <div className="ion-text-center ion-margin-top">
                      <IonRouterLink routerLink="/forgot-password">
                        Forgot Password?
                      </IonRouterLink>
                    </div>
                  </form>
                  <div className="social-auth-divider">
                    <span>or</span>
                  </div> */}
                  <SocialAuth onError={setError} />
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
