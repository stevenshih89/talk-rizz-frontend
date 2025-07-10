import { IonPage, IonContent, IonImg } from "@ionic/react";
import { useState, useEffect } from "react";
import { useIonRouter } from "@ionic/react";
import { Capacitor } from "@capacitor/core";

interface Message {
  text: string;
  sender: "bot" | "user";
}

const OnboardingChat: React.FC = () => {
  const router = useIonRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userResponses, setUserResponses] = useState<{ [key: string]: string }>(
    {}
  );
  const [showStartBtn, setShowStartBtn] = useState(false);

  // Platform-specific margin for input container
  const inputMarginBottom =
    Capacitor.getPlatform() === "ios" ? "mb-[135px]" : "";

  const questions = [
    "Meow, I am your Meowtchmaker and I will match you with the right people based on who you are looking for.",
    "Would you let me know who you are looking to meet?",
    "I will help you find such person!",
  ];

  useEffect(() => {
    // Add initial bot message
    setTimeout(() => {
      setMessages([{ text: questions[0], sender: "bot" }]);
    }, 500);
  }, []);

  const handleUserResponse = (response: string) => {
    // Add user message
    setMessages((prev) => [...prev, { text: response, sender: "user" }]);

    // Store response
    setUserResponses((prev) => ({
      ...prev,
      [questions[currentQuestion]]: response,
    }));

    // Move to next question
    if (currentQuestion < questions.length - 1) {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { text: questions[currentQuestion + 1], sender: "bot" },
        ]);
        setCurrentQuestion((prev) => prev + 1);
      }, 500);
    } else {
      setShowStartBtn(true);
    }
  };

  return (
    <IonPage>
      <div className="background h-screen flex flex-col">
        <div className="flex-1 overflow-y-auto p-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.sender === "bot" ? "justify-start" : "justify-end"
              } mb-4`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.sender === "bot"
                    ? "bg-[#e8e8e8] --ion-text-primary"
                    : "bg-[#007aff] text-white"
                  // ? "bg-[#FFFFFF15] text-[var(--ion-text-primary)]"
                  // : "bg-[var(--ion-color-primary)] text-black"
                }`}
              >
                {message.text}
              </div>
            </div>
          ))}
          {showStartBtn && (
            <div className="flex justify-center">
              <div
                className="text-white text-lg font-bold bg-[var(--ion-color-primary)] p-4 rounded-full hover:scale-105 active:scale-95 transition-transform duration-200 cursor-pointer shadow-lg hover:shadow-xl"
                onClick={() => router.push("/auth/login", "forward")}
              >
                Let's Start!
              </div>
            </div>
          )}
        </div>

        <div className={`p-4 border-t border-[#FFFFFF30] ${inputMarginBottom}`}>
          <input
            type="text"
            placeholder="Type your response..."
            className="w-full p-3 rounded-lg bg-[#e6e6e8] text-black outline-none"
            onKeyPress={(e) => {
              if (
                e.key === "Enter" &&
                (e.target as HTMLInputElement).value.trim()
              ) {
                handleUserResponse((e.target as HTMLInputElement).value);
                (e.target as HTMLInputElement).value = "";
              }
            }}
          />
        </div>
      </div>
    </IonPage>
  );
};

export default OnboardingChat;
