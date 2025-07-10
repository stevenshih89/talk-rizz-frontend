import React from "react";
import { Capacitor } from "@capacitor/core";
import {
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
} from "@ionic/react";
import { Route, Redirect, useLocation } from "react-router-dom";
import {
  chatbubble,
  chatbubbleOutline,
  timer,
  timerOutline,
  people,
  peopleOutline,
  documentText,
  documentTextOutline,
  settings,
  settingsOutline,
} from "ionicons/icons";

import Home from "./home";
import Chat from "./chat";
import Profile from "./profile";
import Connect from "./connect";
import Conversation from "./chat/conversation";
import Chatbot from "./chat/chatbot";
import Mode from "./connect/mode";
import Report from "./chat/report";
import ReportChat from "./chat/report_chat";
import Status from "./status";
import Settings from "./settings";

interface TabConfig {
  tab: string;
  href: string;
  label: string;
  icon: string;
  outlineIcon: string;
}

const Tabs: React.FC = () => {
  const location = useLocation();

  const tabConfig: TabConfig[] = [
    // {
    //   tab: "home",
    //   href: "/app/home",
    //   label: "Home",
    //   icon: timer,
    //   outlineIcon: timerOutline,
    // },
    {
      tab: "profile",
      href: "/app/profile",
      label: "Profile",
      icon: documentText,
      outlineIcon: documentTextOutline,
    },
    {
      tab: "connect",
      href: "/app/connect",
      label: "Connect",
      icon: people,
      outlineIcon: peopleOutline,
    },
    {
      tab: "chat",
      href: "/app/chat",
      label: "Chat",
      icon: chatbubble,
      outlineIcon: chatbubbleOutline,
    },
    {
      tab: "status",
      href: "/app/status",
      label: "Status",
      icon: timer,
      outlineIcon: timerOutline,
    },
    {
      tab: "setting",
      href: "/app/setting",
      label: "Setting",
      icon: settings,
      outlineIcon: settingsOutline,
    },
  ];

  const shouldHideTabBar =
    [
      "/app/settings",
      "/app/custominstruction",
      "/app/chooseCategory",
      "/app/chat/:roomId",
      "/app/connect/:mode",
      "/app/chatbot/:mode",
    ].includes(location.pathname) ||
    location.pathname.startsWith("/app/chat/") ||
    location.pathname.startsWith("/app/connect/") ||
    location.pathname.startsWith("/app/chatbot/");

  // Platform-specific margin for tab bar
  const tabBarMarginBottom =
    Capacitor.getPlatform() === "ios" ? "mb-[100px]" : "";

  const renderTabButton = ({
    tab,
    href,
    label,
    icon,
    outlineIcon,
  }: TabConfig) => {
    const isActive = location.pathname === href;
    const activeClass = isActive
      ? "text-[var(--ion-color-primary)]"
      : "text-[var(--ion-text-primary)]";

    return (
      <IonTabButton
        key={tab}
        tab={tab}
        href={href}
        className={`bg-transparent ${href} text-center`}
      >
        <IonIcon
          icon={isActive ? icon : outlineIcon}
          className={`w-[26px] h-[26px] ${activeClass}`}
        />
        <IonLabel className={`text-xs ${activeClass}`}>{label}</IonLabel>
      </IonTabButton>
    );
  };

  return (
    <IonTabs>
      <IonRouterOutlet>
        <Route exact path="/app/home" render={() => <Home />} />
        <Route exact path="/app/profile" render={() => <Profile />} />
        <Route exact path="/app/chat" component={Chat} />
        <Route exact path="/app/chat/:roomId" component={Conversation} />
        <Route exact path="/app/chatbot/:mode" component={Chatbot} />
        <Route exact path="/app/connect" component={Connect} />
        <Route exact path="/app/connect/:mode" component={Mode} />
        <Route exact path="/app/chat/:roomId/report" component={Report} />
        <Route
          exact
          path="/app/chat/:roomId/report/:reason"
          component={ReportChat}
        />
        <Route exact path="/app/status" component={Status} />
        <Route exact path="/app/setting" component={Settings} />
      </IonRouterOutlet>
      <IonTabBar
        slot="bottom"
        className={`bg-[rgba(0,0,0,0.16)] h-20 w-full ${tabBarMarginBottom} ${
          shouldHideTabBar && "hidden"
        }`}
      >
        {tabConfig.map(renderTabButton)}
      </IonTabBar>
    </IonTabs>
  );
};

export default Tabs;
