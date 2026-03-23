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
  children: React.ReactNode;
  delay?: number;
}> = ({ title, children, delay = 0 }) => (
  <div
    className="py-4 px-4 rounded-lg animate-fade-in-up"
    style={{
      backgroundColor: "#E2E4D8",
      border: "1px solid rgba(52, 53, 22, 0.2)",
      animationDelay: `${delay}ms`,
    }}
  >
    <h4
      className="text-sm font-semibold uppercase tracking-wider mb-2"
      style={{ color: "#8F4930" }}
    >
      {title}
    </h4>
    <p className="text-sm leading-relaxed" style={{ color: "#343516" }}>
      {children}
    </p>
  </div>
);

const InviteInfo: React.FC = () => {
  return (
    <section className="pt-6 pb-2 space-y-4">
      <InfoBlock title="Dress code" delay={0}>{DRESS_CODE}</InfoBlock>
      <InfoBlock title="Food" delay={100}>{FOOD_INFO}</InfoBlock>
      <InfoBlock title="Gifts" delay={200}>{GIFTS_NOTE}</InfoBlock>
    </section>
  );
};

export default InviteInfo;
