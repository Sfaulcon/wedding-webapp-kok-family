import { Routes, Route, useParams } from "react-router-dom";
import BackgroundCollage from "./components/BackgroundCollage";
import Letter from "./components/Letter";
import Header from "./components/Header";
import InviteInfo from "./components/InviteInfo";
import StoryTimeline from "./components/StoryTimeline";
import Rsvp from "./components/Rsvp";
import ShuttleServices from "./components/ShuttleServices";
import SectionCard from "./components/SectionCard";

function AppWithInvite() {
  const { token } = useParams<{ token: string }>();
  // Support both /invite/:token and legacy /?code=... for backward compatibility
  const legacyCode =
    !token && typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("code")
      : null;
  const inviteToken = token ?? legacyCode ?? null;
  return (
    <div className="min-h-screen py-8 md:py-12">
      <BackgroundCollage />
      <Letter>
        <Header />
        <SectionCard>
          <InviteInfo />
        </SectionCard>
        <SectionCard>
          <StoryTimeline />
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
