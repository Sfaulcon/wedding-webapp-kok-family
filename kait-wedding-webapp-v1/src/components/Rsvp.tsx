import { useEffect, useState } from "react";
import Toggle from "./Toggle";
import AccommodationCards, { type AccommodationOption } from "./AccommodationCards";

type Guest = {
  guest_id: string;
  name: string;
  invited_wedding: boolean;
  invited_braai: boolean;
  accomodation_required: boolean; // TRUE = already has accommodation, FALSE = needs options
  has_rsvped?: boolean;
};

type RsvpProps = {
  inviteToken: string | null;
};

export default function Rsvp({ inviteToken }: RsvpProps) {

  const [guests, setGuests] = useState<Guest[]>([]);
  const [accommodationOptions, setAccommodationOptions] = useState<AccommodationOption[]>([]);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);

  const [attendingWedding, setAttendingWedding] = useState<boolean | null>(null);
  const [attendingBraai, setAttendingBraai] = useState<boolean | null>(null);
  const [dietary, setDietary] = useState("");

  const [lockAt, setLockAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const isLocked = lockAt ? new Date() > new Date(lockAt) : false;

  useEffect(() => {
    if (!inviteToken) {
      setError("Invalid invitation link.");
      setLoading(false);
      return;
    }

    fetch(`http://localhost:4000/api/invite/${inviteToken}`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        const mappedGuests = data.guests.map((g: Record<string, unknown>) => ({
          guest_id: g.guest_id,
          name: g.full_name,
          invited_wedding: g.invited_wedding === "TRUE",
          invited_braai: g.invited_braai === "TRUE",
          accomodation_required: g.accomodation_required === "TRUE",
          has_rsvped: Boolean(g.has_rsvped),
        }));
        setGuests(mappedGuests);
        setLockAt(data.rsvp_lock_at);
        setAccommodationOptions(data.accommodation_options || []);
      })
      .catch(() => setError("We couldn't find your invitation."))
      .finally(() => setLoading(false));
  }, [inviteToken]);

  const handleGuestSelect = (guest: Guest) => {
    setSelectedGuest(guest);
    setAttendingWedding(null);
    setAttendingBraai(null);
    setDietary("");
  };

  const submit = async () => {
    if (!selectedGuest || !inviteToken) return;

    const res = await fetch("http://localhost:4000/api/rsvp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        invite_token: inviteToken,
        guest_id: selectedGuest.guest_id,
        attending_wedding: selectedGuest.invited_wedding ? attendingWedding : null,
        attending_braai: selectedGuest.invited_braai ? attendingBraai : null,
        dietary_requirements: dietary,
      }),
    });

    if (res.ok) {
      setGuests((prev) =>
        prev.map((g) =>
          g.guest_id === selectedGuest.guest_id ? { ...g, has_rsvped: true } : g
        )
      );
      alert("RSVP saved 💛");
    } else {
      alert("Something went wrong. Please try again.");
    }
  };

  if (loading) {
    return (
      <div
        className="text-center py-16 font-light animate-gentle-pulse"
        style={{ color: "#343516" }}
      >
        Loading your invitation…
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16" style={{ color: "#8F4930" }}>
        {error}
      </div>
    );
  }

  return (
    <>
      <section className="pt-10">
        <h2
          className="text-2xl font-serif text-center mb-6 animate-fade-in-up"
          style={{ color: "#343516", animationDelay: "150ms" }}
        >
          Kindly Respond
        </h2>

        {isLocked && (
          <div
            className="mb-6 p-4 rounded-lg text-center text-sm shadow-sm"
            style={{
              backgroundColor: "#E2E4D8",
              border: "1px solid rgba(52, 53, 22, 0.2)",
              color: "#343516",
            }}
          >
            RSVPs are now closed.
          </div>
        )}

        <div className="space-y-3 mb-8">
          {guests.map((guest, idx) => (
            <div
              key={guest.guest_id}
              className="rounded-lg overflow-hidden animate-fade-in-up"
              style={{ animationDelay: `${Math.min(idx * 80, 300)}ms` }}
            >
              <button
                type="button"
                onClick={() => !isLocked && handleGuestSelect(guest)}
                className={`w-full text-left p-4 rounded-lg border transition-all duration-300 selectable-3d shadow-sm ${
                  selectedGuest?.guest_id === guest.guest_id
                    ? "rounded-b-none text-white selected"
                    : "text-[#343516] hover:border-[#8F4930]/50"
                }`}
                style={
                  selectedGuest?.guest_id === guest.guest_id
                    ? { backgroundColor: "#343516", borderColor: "#343516" }
                    : { backgroundColor: "#E2E4D8", borderColor: "rgba(52, 53, 22, 0.25)" }
                }
              >
                <span className="flex items-center justify-between gap-3">
                  <span>{guest.name}</span>
                  {guest.has_rsvped && (
                    <span
                      className={`flex-shrink-0 ${selectedGuest?.guest_id === guest.guest_id ? "text-white" : ""}`}
                      style={selectedGuest?.guest_id !== guest.guest_id ? { color: "#8F4930" } : undefined}
                      aria-hidden
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </span>
                  )}
                </span>
              </button>

              {selectedGuest?.guest_id === guest.guest_id && (
                <div
                  className="px-4 pt-4 pb-4 rounded-b-lg border border-t-0 space-y-5 animate-expand-in"
                  style={{
                    backgroundColor: "#E2E4D8",
                    borderColor: "#343516",
                  }}
                >
                  {guest.invited_wedding && (
                    <Toggle
                      label="Wedding"
                      value={attendingWedding}
                      setValue={setAttendingWedding}
                      disabled={isLocked}
                    />
                  )}

                  {guest.invited_braai && (
                    <Toggle
                      label="Braai"
                      value={attendingBraai}
                      setValue={setAttendingBraai}
                      disabled={isLocked}
                    />
                  )}

                  <div>
                    <label
                      htmlFor={`dietary-${guest.guest_id}`}
                      className="block mb-2 font-medium"
                      style={{ color: "#343516" }}
                    >
                      Dietary requirements
                    </label>
                    <textarea
                      id={`dietary-${guest.guest_id}`}
                      disabled={isLocked}
                      value={dietary}
                      onChange={(e) => setDietary(e.target.value)}
                      placeholder="Allergies, preferences, etc."
                      className="w-full rounded-lg px-4 py-3 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-[#8F4930]/40 focus:border-transparent disabled:opacity-60 selectable-3d focus:-translate-y-0.5 transition-all duration-200 shadow-sm"
                      style={{
                        backgroundColor: "#E2E4D8",
                        borderColor: "rgba(52, 53, 22, 0.25)",
                        color: "#343516",
                        borderWidth: "1px",
                      }}
                    />
                  </div>

                  <button
                    type="button"
                    disabled={isLocked}
                    onClick={submit}
                    className={`w-full py-3.5 rounded-lg transition-all duration-200 font-medium selectable-3d shadow-sm ${
                      isLocked ? "cursor-not-allowed" : "text-white hover:opacity-90"
                    }`}
                    style={
                      isLocked
                        ? { backgroundColor: "#CCB89D", color: "#343516" }
                        : { backgroundColor: "#343516" }
                    }
                  >
                    {isLocked ? "RSVP Closed" : "Save RSVP"}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {guests.some((g) => g.accomodation_required) && (
        <AccommodationCards options={accommodationOptions} />
      )}
    </>
  );
}
