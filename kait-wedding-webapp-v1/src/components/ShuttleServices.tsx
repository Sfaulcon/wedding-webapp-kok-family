import { Bus, Phone, Mail } from "lucide-react";

/**
 * Edit the content below to customise shuttle service details.
 */
const SHUTTLE = {
  name: "Christo Jordaan",
  phone: "081 806 2202",
  email: "cjordaan464@gmail.com",
};

const ShuttleServices: React.FC = () => {
  return (
    <section>
      <h3 className="text-xl font-serif text-center mb-6 flex items-center justify-center gap-2" style={{ color: "#343516" }}>
        <Bus size={22} style={{ color: "#8F4930" }} strokeWidth={2} />
        Shuttle Services
      </h3>
      <div
        className="py-4 px-4 rounded-xl glass-subtle max-w-md mx-auto"
      >
        <p className="font-medium text-center mb-3" style={{ color: "#343516" }}>
          {SHUTTLE.name}
        </p>
        <div className="flex flex-col items-center gap-2 text-sm">
          <a
            href={`tel:${SHUTTLE.phone.replace(/\s/g, "")}`}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            style={{ color: "#8F4930" }}
          >
            <Phone size={16} strokeWidth={2} />
            {SHUTTLE.phone}
          </a>
          <a
            href={`mailto:${SHUTTLE.email}`}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            style={{ color: "#8F4930" }}
          >
            <Mail size={16} strokeWidth={2} />
            {SHUTTLE.email}
          </a>
        </div>
      </div>
    </section>
  );
};

export default ShuttleServices;
