import { useEffect, useState } from "react";
import { User, Check, Music, UtensilsCrossed, ChevronLeft, ChevronRight, Building2, Banknote, CircleCheck, CreditCard } from "lucide-react";
import Toggle from "./Toggle";
import SectionCard from "./SectionCard";
import AccommodationCards, { type AccommodationOption } from "./AccommodationCards";
import { API_BASE } from "../config";

type Guest = {
  guest_id: string;
  name: string;
  invited_wedding: boolean;
  invited_braai: boolean;
  accomodation_required: boolean; // TRUE = need to arrange own, FALSE = has at venue
  has_rsvped?: boolean;
  cottage_number?: string;
  amount_owed?: string;
  payment_received?: boolean;
};

type RsvpProps = {
  inviteToken: string | null;
};

function pick<T>(obj: Record<string, unknown>, ...keys: string[]): T | undefined {
  const norm = (s: string) => s.toLowerCase().replace(/\s/g, "_");
  const k = Object.keys(obj).find(
    (objKey) => keys.some((key) => norm(objKey) === norm(key)) &&
      obj[objKey] !== undefined && obj[objKey] !== null && String(obj[objKey]).trim() !== ""
  );
  return k ? (obj[k] as T) : undefined;
}

export default function Rsvp({ inviteToken }: RsvpProps) {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [accommodationOptions, setAccommodationOptions] = useState<AccommodationOption[]>([]);
  const [songRequests, setSongRequests] = useState<Array<{ song_title: string; artist?: string }>>([]);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [bankingDetails, setBankingDetails] = useState<string>("TBD");
  const [banking, setBanking] = useState<{
    bank_name?: string;
    account_holder?: string;
    account_type?: string;
    account_number?: string;
    branch_code?: string;
  } | null>(null);

  const [attendingWedding, setAttendingWedding] = useState<boolean | null>(null);
  const [attendingBraai, setAttendingBraai] = useState<boolean | null>(null);
  const [dietary, setDietary] = useState("");

  const [songTitle, setSongTitle] = useState("");
  const [songArtist, setSongArtist] = useState("");
  const [songGuestId, setSongGuestId] = useState<string>("");

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

    fetch(`${API_BASE}/api/invite/${inviteToken}`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        const mappedGuests = data.guests.map((g: Record<string, unknown>) => {
          const paymentVal = g.payment_received ?? g.payment_recieved;
          return {
            guest_id: g.guest_id,
            name: g.full_name,
            invited_wedding: g.invited_wedding === "TRUE",
            invited_braai: g.invited_braai === "TRUE",
            accomodation_required: g.accomodation_required === "TRUE",
            has_rsvped: Boolean(g.has_rsvped),
            cottage_number: pick<string>(g, "cottage_number", "cottage", "cottage number") ?? undefined,
            amount_owed: pick<string>(g, "amount_owed", "amount", "amount owed") ?? undefined,
            payment_received: paymentVal === true || paymentVal === "TRUE" || String(paymentVal).toUpperCase() === "YES",
          };
        });
        setGuests(mappedGuests);
        setLockAt(data.rsvp_lock_at);
        setAccommodationOptions(data.accommodation_options || []);
        setBankingDetails(data.banking_details || "TBD");
        setBanking(data.website_info?.banking ?? null);
        setSongRequests(data.song_requests || []);
        const firstGuestId = mappedGuests[0]?.guest_id ?? "";
        setSongGuestId(firstGuestId);
      })
      .catch(() => setError("We couldn't find your invitation."))
      .finally(() => setLoading(false));
  }, [inviteToken]);

  const handleGuestSelect = (guest: Guest) => {
    if (selectedGuest?.guest_id === guest.guest_id) {
      setSelectedGuest(null);
      setAttendingWedding(null);
      setAttendingBraai(null);
      setDietary("");
    } else {
      setSelectedGuest(guest);
      setAttendingWedding(null);
      setAttendingBraai(null);
      setDietary("");
    }
  };

  const submit = async () => {
    if (!selectedGuest || !inviteToken) return;

    const res = await fetch(`${API_BASE}/api/rsvp`, {
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

  const submitSongRequest = async () => {
    if (!inviteToken || !songTitle.trim() || !songGuestId) return;

    const res = await fetch(`${API_BASE}/api/song-request`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        invite_token: inviteToken,
        guest_id: songGuestId,
        song_title: songTitle.trim(),
        artist: songArtist.trim(),
      }),
    });

    if (res.ok) {
      setSongRequests((prev) => [
        ...prev,
        { song_title: songTitle.trim(), artist: songArtist.trim() || undefined },
      ]);
      setSongTitle("");
      setSongArtist("");
      alert("Song request saved 💛");
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
      <SectionCard>
      <section>
        <h2
          className="text-2xl font-serif text-center mb-6 animate-fade-in-up flex items-center justify-center gap-2"
          style={{ color: "#343516", animationDelay: "150ms" }}
        >
          <User size={26} style={{ color: "#8F4930" }} strokeWidth={2} />
          Kindly Respond
        </h2>

        {isLocked && (
          <div
            className="mb-6 p-4 rounded-xl text-center text-sm shadow-sm glass-subtle"
            style={{ color: "#343516" }}
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
                    : {
                        background: "rgba(226, 228, 216, 0.6)",
                        backdropFilter: "blur(8px)",
                        WebkitBackdropFilter: "blur(8px)",
                        borderColor: "rgba(52, 53, 22, 0.2)",
                      }
                }
              >
                <span className="flex items-center justify-between gap-3">
                  <span className="flex flex-col items-start gap-0.5">
                    <span className="flex items-center gap-2">
                      <User size={16} className="flex-shrink-0 opacity-70" />
                      {guest.name}
                    </span>
                    {guest.cottage_number && (
                      <span
                        className={`text-xs font-medium ${selectedGuest?.guest_id === guest.guest_id ? "text-white/90" : ""}`}
                        style={selectedGuest?.guest_id !== guest.guest_id ? { color: "#8F4930" } : undefined}
                      >
                        Cottage {guest.cottage_number}
                      </span>
                    )}
                  </span>
                  {guest.has_rsvped && (
                    <span
                      className={`flex-shrink-0 ${selectedGuest?.guest_id === guest.guest_id ? "text-white" : ""}`}
                      style={selectedGuest?.guest_id !== guest.guest_id ? { color: "#8F4930" } : undefined}
                      aria-hidden
                    >
                      <Check size={20} strokeWidth={2.5} />
                    </span>
                  )}
                </span>
              </button>

              {selectedGuest?.guest_id === guest.guest_id && (
                <div
                  className="px-4 pt-4 pb-4 rounded-b-lg border border-t-0 space-y-5 animate-expand-in glass-subtle"
                  style={{ borderColor: "#343516" }}
                >
                  {/* Venue accommodation info: cottage, amount owed, payment status, banking */}
                  {(guest.cottage_number || guest.amount_owed) && (
                    <div className="p-3 rounded-xl text-sm space-y-2 glass">
                      <p className="font-medium flex items-center gap-2" style={{ color: "#343516" }}>
                        <Building2 size={16} style={{ color: "#8F4930" }} strokeWidth={2} />
                        {guest.cottage_number ? `Cottage ${guest.cottage_number}` : "Venue accommodation"}
                      </p>
                      {guest.amount_owed && (
                        <p className="flex items-center gap-2" style={{ color: "#8F4930" }}>
                          <Banknote size={14} strokeWidth={2} />
                          Amount due: ZAR {guest.amount_owed}
                        </p>
                      )}
                      <p className="flex items-center gap-2 text-xs font-medium" style={{ color: guest.payment_received ? "#22c55e" : "#8F4930" }}>
                        {guest.payment_received ? (
                          <>
                            <CircleCheck size={14} strokeWidth={2} />
                            Payment received
                          </>
                        ) : (
                          <>Payment pending</>
                        )}
                      </p>
                      <div className="space-y-1.5 pt-1 border-t border-[#343516]/20">
                        <p className="text-xs font-semibold flex items-center gap-2" style={{ color: "#343516" }}>
                          <CreditCard size={12} style={{ color: "#8F4930" }} strokeWidth={2} />
                          Banking details
                        </p>
                        {banking &&
                        banking.bank_name &&
                        banking.bank_name !== "TBD" &&
                        banking.account_holder &&
                        banking.account_holder !== "TBD" &&
                        banking.account_number &&
                        banking.account_number !== "TBD" ? (
                          <div className="text-xs space-y-1" style={{ color: "#343516" }}>
                            <p>Bank: {banking.bank_name}</p>
                            <p>Account holder: {banking.account_holder}</p>
                            {banking.account_type && banking.account_type !== "TBD" && (
                              <p>Account type: {banking.account_type}</p>
                            )}
                            <p>Account number: {banking.account_number}</p>
                            {banking.branch_code && banking.branch_code !== "TBD" && (
                              <p>Branch code: {banking.branch_code}</p>
                            )}
                          </div>
                        ) : (
                          <p className="text-xs opacity-90" style={{ color: "#343516" }}>
                            {bankingDetails === "TBD"
                              ? "Banking details to be confirmed."
                              : bankingDetails}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

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
                      className="block mb-2 font-medium flex items-center gap-2"
                      style={{ color: "#343516" }}
                    >
                      <UtensilsCrossed size={16} style={{ color: "#8F4930" }} strokeWidth={2} />
                      Dietary requirements
                    </label>
                    <textarea
                      id={`dietary-${guest.guest_id}`}
                      disabled={isLocked}
                      value={dietary}
                      onChange={(e) => setDietary(e.target.value)}
                      placeholder="Allergies, preferences, etc."
                      className="w-full rounded-xl px-4 py-3 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-[#8F4930]/40 focus:border-transparent disabled:opacity-60 selectable-3d focus:-translate-y-0.5 transition-all duration-200 shadow-sm glass-subtle"
                      style={{ color: "#343516" }}
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
      </SectionCard>

      <SectionCard>
      {/* Song requests - own section above accommodation */}
      <section>
        <h3 className="text-xl font-serif text-center mb-4 flex items-center justify-center gap-2" style={{ color: "#343516" }}>
          <Music size={22} style={{ color: "#8F4930" }} strokeWidth={2} />
          Song Requests
        </h3>

        {/* Existing requests - vertical list, 3 at a time */}
        {songRequests.length > 0 && (
          <div className="mb-6">
            <p className="text-sm mb-3" style={{ color: "#8F4930" }}>
              Your requests:
            </p>
            <SongRequestList requests={songRequests} />
          </div>
        )}

        {/* Add new request form */}
        <div className="space-y-3">
          <label className="block font-medium flex items-center gap-2" style={{ color: "#343516" }}>
            <Music size={16} style={{ color: "#8F4930" }} strokeWidth={2} />
            Add a song
          </label>
          <select
            value={songGuestId}
            onChange={(e) => setSongGuestId(e.target.value)}
            className="w-full rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8F4930]/40 glass-subtle"
            style={{ color: "#343516" }}
          >
            {guests.map((g) => (
              <option key={g.guest_id} value={g.guest_id}>
                {g.name}
              </option>
            ))}
          </select>
          <div className="flex gap-2 flex-wrap">
            <input
              type="text"
              placeholder="Song title"
              value={songTitle}
              onChange={(e) => setSongTitle(e.target.value)}
              className="flex-1 min-w-[120px] rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8F4930]/40 glass-subtle"
              style={{ color: "#343516" }}
            />
            <input
              type="text"
              placeholder="Artist (optional)"
              value={songArtist}
              onChange={(e) => setSongArtist(e.target.value)}
              className="flex-1 min-w-[120px] rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8F4930]/40 glass-subtle"
              style={{ color: "#343516" }}
            />
          </div>
          <button
            type="button"
            disabled={!songTitle.trim()}
            onClick={submitSongRequest}
            className="btn-song-request py-2 px-4 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
          >
            Add song request
          </button>
        </div>
      </section>
      </SectionCard>

      {guests.some((g) => g.accomodation_required) && (
        <SectionCard>
          <AccommodationCards options={accommodationOptions} />
        </SectionCard>
      )}
    </>
  );
}

const ITEMS_PER_PAGE = 3;

function SongRequestList({ requests }: { requests: Array<{ song_title: string; artist?: string }> }) {
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(requests.length / ITEMS_PER_PAGE);
  const start = page * ITEMS_PER_PAGE;
  const visible = requests.slice(start, start + ITEMS_PER_PAGE);

  return (
    <div>
      <ul className="space-y-2">
        {visible.map((r, i) => (
          <li
            key={`${r.song_title}-${r.artist ?? ""}-${start + i}`}
            className="flex items-center gap-2 py-2 px-3 rounded-xl glass-subtle"
          >
            <Music size={14} className="flex-shrink-0" style={{ color: "#8F4930" }} strokeWidth={2} />
            <span className="text-sm font-medium" style={{ color: "#343516" }}>
              {r.song_title}
              {r.artist && (
                <span className="font-normal opacity-80"> · {r.artist}</span>
              )}
            </span>
          </li>
        ))}
      </ul>
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-3">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            aria-label="Previous"
            className="w-8 h-8 rounded-full flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed glass-subtle"
            style={{ color: "#343516" }}
          >
            <ChevronLeft size={16} strokeWidth={2} />
          </button>
          <span className="text-sm" style={{ color: "#8F4930" }}>
            {page + 1} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            aria-label="Next"
            className="w-8 h-8 rounded-full flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed glass-subtle"
            style={{ color: "#343516" }}
          >
            <ChevronRight size={16} strokeWidth={2} />
          </button>
        </div>
      )}
    </div>
  );
}
