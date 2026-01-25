import { useEffect, useState } from "react";

interface CountdownProps {
  date: string;
}

export default function CountdownClock({ date }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const weddingDate = new Date(date);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(weddingDate.getTime() - new Date().getTime());
    }, 1000);
    return () => clearInterval(interval);
  }, [date]);

  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeLeft / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((timeLeft / (1000 * 60)) % 60);
  const seconds = Math.floor((timeLeft / 1000) % 60);

  return (
    <div className="text-2xl font-serif text-purple-800 text-center my-6">
      {days}d {hours}h {minutes}m {seconds}s
    </div>
  );
}
