import Header from "./components/Header";
import Rsvp from "./components/Rsvp";

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-orange-50">
        <Header />

        <Rsvp />

    </div>
  );
}

export default App;
