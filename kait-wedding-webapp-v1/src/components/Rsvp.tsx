import { useEffect, useState } from "react"
import Toggle from "./Toggle"

type Guest = {
  guest_id: string
  name: string
  invited_wedding: boolean
  invited_braai: boolean
}

export default function Rsvp() {
  const params = new URLSearchParams(window.location.search)
  const inviteToken = params.get("code")

  const [guests, setGuests] = useState<Guest[]>([])
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null)

  const [attendingWedding, setAttendingWedding] = useState<boolean | null>(null)
  const [attendingBraai, setAttendingBraai] = useState<boolean | null>(null)
  const [dietary, setDietary] = useState("")

  const [lockAt, setLockAt] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const isLocked = lockAt ? new Date() > new Date(lockAt) : false

  useEffect(() => {
    if (!inviteToken) {
      setError("Invalid invitation link.")
      setLoading(false)
      return
    }

    fetch(`http://localhost:4000/api/invite/${inviteToken}`)
      .then(res => {
        if (!res.ok) throw new Error()
        return res.json()
      })
      .then(data => {
        const mappedGuests = data.guests.map((g: any) => ({
          guest_id: g.guest_id,
          name: g.full_name,                  // <- correct
          invited_wedding: g.invited_wedding === "TRUE",
          invited_braai: g.invited_braai === "TRUE"
        }))
        setGuests(mappedGuests)
        setLockAt(data.rsvp_lock_at)
      })
      .catch(() => setError("We couldn’t find your invitation."))
      .finally(() => setLoading(false))
  }, [inviteToken])

  const handleGuestSelect = (guest: Guest) => {
    setSelectedGuest(guest)
    setAttendingWedding(null)
    setAttendingBraai(null)
    setDietary("")
  }

  const submit = async () => {
    if (!selectedGuest) return

    await fetch("http://localhost:4000/api/rsvp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        invite_token: inviteToken,
        guest_id: selectedGuest.guest_id,
        attending_wedding: selectedGuest.invited_wedding ? attendingWedding : null,
        attending_braai: selectedGuest.invited_braai ? attendingBraai : null,
        dietary_requirements: dietary
      })
    })

    alert("RSVP saved 💛")
  }

  if (loading) {
    return <div className="text-center py-20">Loading invitation…</div>
  }

  if (error) {
    return <div className="text-center py-20 text-red-500">{error}</div>
  }

  return (
    <section className="max-w-xl mx-auto px-6 py-16">
      <h2 className="text-3xl font-serif text-center mb-8">
        Kindly Respond
      </h2>

      {isLocked && (
        <div className="mb-6 p-4 rounded-lg bg-gray-100 text-center text-sm">
          RSVPs are now closed.
        </div>
      )}

      {/* Guest blocks */}
      <div className="space-y-4 mb-8">
        {guests.map(guest => (
          <div
            key={guest.guest_id}
            onClick={() => !isLocked && handleGuestSelect(guest)}
            className={`cursor-pointer p-4 rounded-lg border ${
              selectedGuest?.guest_id === guest.guest_id
                ? "bg-black text-white border-black"
                : "bg-white text-black border-gray-300 hover:bg-gray-100"
            }`}
          >
            {guest.name}
          </div>
        ))}
      </div>

      {/* RSVP form */}
      {selectedGuest && (
        <div className="space-y-6">
          {selectedGuest.invited_wedding && (
            <Toggle
              label="Wedding"
              value={attendingWedding}
              setValue={setAttendingWedding}
              disabled={isLocked}
            />
          )}

          {selectedGuest.invited_braai && (
            <Toggle
              label="Braai"
              value={attendingBraai}
              setValue={setAttendingBraai}
              disabled={isLocked}
            />
          )}

          <textarea
            disabled={isLocked}
            value={dietary}
            onChange={e => setDietary(e.target.value)}
            placeholder="Dietary requirements"
            className="w-full border rounded-lg px-4 py-3 min-h-[100px]"
          />

          <button
            disabled={isLocked}
            onClick={submit}
            className={`w-full py-3 rounded-lg transition ${
              isLocked
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-black text-white hover:opacity-90"
            }`}
          >
            {isLocked ? "RSVP Closed" : "Save RSVP"}
          </button>
        </div>
      )}
    </section>
  )
}