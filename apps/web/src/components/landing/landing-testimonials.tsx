export function LandingTestimonials() {
    const testimonials = [
        {
            quote:
                "Our photo marathon participation increased by 300% after switching to Vimmer. The real-time submission tracking and automated validation saved us countless hours.",
            author: "Erik Lindqvist",
            position: "Director at Stockholm Fotomaraton",
            avatar: "bg-vimmer-primary/30",
        },
        {
            quote:
                "The judging interface is incredibly intuitive. We can review thousands of submissions efficiently and the analytics help us improve our events year after year.",
            author: "Maria Santos",
            position: "Head Judge at Nordic Photo Challenge",
            avatar: "bg-vimmer-primary/20",
        },
        {
            quote:
                "Setting up our first photo marathon was so simple with Vimmer. The participant experience is seamless and the admin dashboard gives us complete control.",
            author: "James Chen",
            position: "Event Organizer at CityLens",
            avatar: "bg-vimmer-primary/40",
        },
    ];

    return (
        <section className="w-full py-20 px-6 md:px-12 bg-card relative overflow-hidden">
            {/* Background grid */}
            <div className="absolute inset-0 cosmic-grid opacity-20"></div>

            <div className="max-w-7xl mx-auto space-y-16 relative z-10">
                <div className="text-center space-y-4 max-w-3xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-rocgrotesk font-medium tracking-tighter text-foreground">
                        Loved by photography communities
                    </h2>
                    <p className="text-muted-foreground text-lg">
                        See how Vimmer transforms photo marathon organization and
                        participation
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <div
                            key={index}
                            className="p-6 rounded-xl border border-border bg-background/80 backdrop-blur-sm hover:border-border/60 transition-all duration-300"
                        >
                            <div className="mb-6">
                                {[...Array(5)].map((_, i) => (
                                    <span
                                        key={i}
                                        className="text-vimmer-primary inline-block mr-1"
                                        style={{ color: "hsl(var(--vimmer-primary))" }}
                                    >
                                        ★
                                    </span>
                                ))}
                            </div>
                            <p className="text-lg mb-8 text-foreground/90 italic">
                                "{testimonial.quote}"
                            </p>
                            <div className="flex items-center gap-4">
                                <div
                                    className={`h-12 w-12 rounded-full ${testimonial.avatar} bg-muted`}
                                    style={{
                                        backgroundColor: "hsl(var(--vimmer-primary) / 0.3)",
                                    }}
                                ></div>
                                <div>
                                    <h4 className="font-medium text-foreground">
                                        {testimonial.author}
                                    </h4>
                                    <p className="text-sm text-muted-foreground">
                                        {testimonial.position}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}