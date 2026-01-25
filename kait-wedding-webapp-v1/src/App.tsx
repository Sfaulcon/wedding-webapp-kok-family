import HeroSection from "./components/HeroSection";
import CountdownClock from "./components/CountdownClock";
import EventDetails from "./components/EventDetails";
import Timeline from "./components/Timeline";
import RSVPForm from "./components/RSVPForm";

//import { coupleInfo, timelinePlaceholder, guestsPlaceholder, hotelOptions } from "";

function App() {
  return (
    <div className="font-sans bg-sand min-h-screen">

      {/* Hero Section */}
      <HeroSection names={coupleInfo.names} date={coupleInfo.date} />

      {/* Countdown */}
      <CountdownClock date={coupleInfo.date} />

      {/* Event Details Section */}
      <section id="details">
        <EventDetails info={coupleInfo} />
      </section>

      {/* Timeline Section */}
      <section id="timeline">
        <Timeline points={timelinePlaceholder} />
      </section>

      {/* RSVP Section */}
      <section id="rsvp">
        <RSVPForm guests={guestsPlaceholder} hotelOptions={hotelOptions} />
      </section>

      {/* Footer */}
      <footer className="text-center p-4 text-purple-800 bg-sand/90 mt-12">
        Created for {coupleInfo.names}
      </footer>
    </div>
  );
}

export default App;
