import BackgroundCollage from "./components/BackgroundCollage";
import Letter from "./components/Letter";
import Header from "./components/Header";
import InviteInfo from "./components/InviteInfo";
import Rsvp from "./components/Rsvp";

const App: React.FC = () => {
  return (
    <div className="min-h-screen py-8 md:py-12">
      <BackgroundCollage />
      <Letter>
        <Header />
        <InviteInfo />
        <Rsvp />
      </Letter>
    </div>
  );
};

export default App;
