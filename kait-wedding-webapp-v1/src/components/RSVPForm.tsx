import { Guest } from "../types/wedding"
import AccommodationSelector from "./AccommodationSelector";
import ShuttleOption from "./ShuttleOption";

interface RSVPFormProps {
  guests: Guest[];
  accommodationOptions: { name: string; distance: string }[];
}

export default function RSVPForm({ guests, accommodationOptions }: RSVPFormProps) {
  return (
    <div className="bg-peach-50 p-8 rounded-2xl max-w-3xl mx-auto my-12">
      <h2 className="text-3xl font-serif text-purple-800 mb-6">RSVP</h2>

      {guests.map((guest) => (
        <div key={guest.guest_id} className="mb-8 border-b pb-6">
          <h3 className="text-xl font-semibold text-purple-700 mb-2">
            {guest.full_name}
          </h3>

          {/* Wedding RSVP */}
          {guest.invited_wedding && (
            <select className="w-full p-2 border rounded mb-2">
              <option value="">Attending wedding?</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          )}

          {/* Braai RSVP */}
          {guest.invited_braai && (
            <select className="w-full p-2 border rounded mb-2">
              <option value="">Attending braai?</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          )}

          {/* Dietary */}
          <textarea
            className="w-full p-2 border rounded mb-2"
            placeholder="Dietary requirements"
          />

          {/* Accommodation */}
          {guest.accommodation_required && (
            <AccommodationSelector
              type="Hotel"
              options={accommodationOptions}
            />
          )}

          {/* Shuttle */}
          {guest.shuttle_available && <ShuttleOption />}
        </div>
      ))}

      <button className="bg-coral text-white px-6 py-2 rounded hover:bg-gold transition">
        Submit RSVP
      </button>
    </div>
  );
}
