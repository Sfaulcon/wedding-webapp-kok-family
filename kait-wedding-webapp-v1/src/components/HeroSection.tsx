interface HeroProps {
    names: string;
    date: string;
}

export default function HeroSection({ names, date }: HeroProps) {
    return (
        <section className="min-h-screen bg-peach-100 flex flex-col items-center justify-center text-center px-4">
            <h1 className="text-6x1 font-serif text-purple-800 mb-4">{names}</h1>
            <p className="text-xl text-purple-700 mb-6">{new Date(date).toDateString()}</p>
            <a href="#details" className="mt-6 px-6 py-3 bg-coral text-white rounded-lg hover:bg-gold transition">
                View Details & RSVP
            </a>
        </section>
    );
}