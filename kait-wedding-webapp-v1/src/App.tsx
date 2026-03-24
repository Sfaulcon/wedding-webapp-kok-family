import { useEffect, useState } from "react";
import { Routes, Route, useParams } from "react-router-dom";
import BackgroundCollage from "./components/BackgroundCollage";
import Letter from "./components/Letter";
import Header from "./components/Header";
import InviteInfo from "./components/InviteInfo";
import StoryTimeline from "./components/StoryTimeline";
import Rsvp from "./components/Rsvp";
import ShuttleServices from "./components/ShuttleServices";
import SectionCard from "./components/SectionCard";
import { API_BASE } from "./config";

export type WebsiteInfo = {
  dress_code: string;
  gifts: string;
  food_options: { starters: string[]; mains: string[]; desserts: string[] };
  story: Array<{ id: string; date: string; title: string; description: string }>;
  banking: { formatted: string };
};

const defaultWebsiteInfo: WebsiteInfo = {
  dress_code: "TBD",
  gifts: "TBD",
  food_options: { starters: [], mains: [], desserts: [] },
  story: [],
  banking: { formatted: "TBD" },
};

function AppWithInvite() {
  const { token } = useParams<{ token: string }>();
  const [websiteInfo, setWebsiteInfo] = useState<WebsiteInfo | null>(null);

  const legacyCode =
    !token && typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("code")
      : null;
  const inviteToken = token ?? legacyCode ?? null;

  useEffect(() => {
    fetch(`${API_BASE}/api/website-info`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setWebsiteInfo(data ?? defaultWebsiteInfo))
      .catch(() => setWebsiteInfo(defaultWebsiteInfo));
  }, []);

  const info = websiteInfo ?? defaultWebsiteInfo;

  return (
    <div className="min-h-screen py-8 md:py-12">
      <BackgroundCollage />
      <Letter>
        <Header />
        <SectionCard>
          <InviteInfo websiteInfo={info} />
        </SectionCard>
        <SectionCard>
          <StoryTimeline story={info.story} />
        </SectionCard>
        <Rsvp inviteToken={inviteToken} />
        <SectionCard>
          <ShuttleServices />
        </SectionCard>
      </Letter>
    </div>
  );
}

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/invite/:token" element={<AppWithInvite />} />
      <Route path="/" element={<AppWithInvite />} />
    </Routes>
  );
};

export default App;
