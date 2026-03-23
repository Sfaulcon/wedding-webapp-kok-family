import { useEffect, useState } from "react";

interface CountdownProps {
  targetDate: string;
}

const Countdown: React.FC<CountdownProps> = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const target = new Date(targetDate).getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = target - now;

      if (distance <= 0) {
        clearInterval(interval);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <div className="flex justify-center gap-4 md:gap-6 mt-6" style={{ color: "#343516" }}>
      <div className="text-center">
        <span className="block text-2xl md:text-3xl font-light tabular-nums">{timeLeft.days}</span>
        <span className="text-xs uppercase tracking-wider">Days</span>
      </div>
      <div className="text-center">
        <span className="block text-2xl md:text-3xl font-light tabular-nums">{timeLeft.hours}</span>
        <span className="text-xs uppercase tracking-wider">Hours</span>
      </div>
      <div className="text-center">
        <span className="block text-2xl md:text-3xl font-light tabular-nums">{timeLeft.minutes}</span>
        <span className="text-xs uppercase tracking-wider">Mins</span>
      </div>
      <div className="text-center">
        <span className="block text-2xl md:text-3xl font-light tabular-nums">{timeLeft.seconds}</span>
        <span className="text-xs uppercase tracking-wider">Secs</span>
      </div>
    </div>
  );
};

export default Countdown;
