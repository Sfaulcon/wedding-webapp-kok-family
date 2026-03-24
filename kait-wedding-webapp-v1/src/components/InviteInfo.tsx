import { Shirt, UtensilsCrossed, Gift } from "lucide-react";

/**
 * Edit the content below to customise dress code, food, and gifts info.
 */
const DRESS_CODE = "Suit and Tie";
const FOOD_INFO =
  "A selection of mains and sides will be served. Please note any dietary requirements in your RSVP.";
const GIFTS_NOTE =
  "Your presence at our celebration is the greatest gift. Should you wish to honour us with something more, monetary contribution towards our future together would be warmly appreciated.";

const InfoBlock: React.FC<{
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  delay?: number;
}> = ({ title, icon, children, delay = 0 }) => (
  <div
    className="py-2 px-3 rounded-xl animate-fade-in-up flex-1 min-w-0 glass-subtle"
    style={{ animationDelay: `${delay}ms` }}
  >
    <h4
      className="text-xs font-semibold uppercase tracking-wider mb-1 flex items-center gap-1.5"
      style={{ color: "#8F4930" }}
    >
      {icon}
      {title}
    </h4>
    <div className="text-xs leading-snug" style={{ color: "#343516" }}>
      {children}
    </div>
  </div>
);

const InviteInfo: React.FC = () => {
  return (
    <section className="pt-4 pb-2">
      {/* Compact grid for main info */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <InfoBlock title="Dress code" icon={<Shirt size={14} strokeWidth={2} />} delay={0}>{DRESS_CODE}</InfoBlock>
        <InfoBlock title="Food" icon={<UtensilsCrossed size={14} strokeWidth={2} />} delay={100}>{FOOD_INFO}</InfoBlock>
        <InfoBlock title="Gifts" icon={<Gift size={14} strokeWidth={2} />} delay={200}>{GIFTS_NOTE}</InfoBlock>
      </div>
    </section>
  );
};

export default InviteInfo;
