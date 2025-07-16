"use client";

import { Camera, Trophy } from "lucide-react";

export function LandingTrustLogos() {
  const companies = [
    {
      name: "Stockholm Fotomaraton",
      logo: "https://www.stockholmfotomaraton.se/wp-content/uploads/2022/11/Logga-22-png-1024x1024-1.png",
      fallbackIcon: Camera,
    },
    {
      name: "Warsaw Photomarathon",
      fallbackIcon: Trophy,
    },
  ];

  return (
    <section className="w-full py-8 px-4 sm:py-12 sm:px-6 md:px-2 bg-muted/30">
      <div className="mx-auto">
        <div className="text-center mb-6 sm:mb-8">
          <p className="text-xs sm:text-sm text-muted-foreground">
            Trusted by established photography communities
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 justify-center items-center">
          {companies.map((company, index) => {
            const FallbackIcon = company.fallbackIcon;
            return (
              <div
                key={index}
                className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 bg-gray-100 rounded-lg border border-gray-200 backdrop-blur-sm min-w-max mx-auto sm:mx-0 sm:min-w-[160px]"
              >
                {company.logo ? (
                  <div className="h-10 w-10 sm:h-12 sm:w-12 rounded overflow-hidden bg-gray-200 flex items-center justify-center">
                    <img
                      src={company.logo}
                      alt={`${company.name} logo`}
                      className="h-full w-full object-contain filter grayscale opacity-60 hover:opacity-100 hover:grayscale-0 transition-all duration-300"
                      onError={(e) => {
                        // Fallback to icon if image fails to load
                        const target = e.target as HTMLImageElement;
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = `<div class='h-8 w-8 text-gray-400'></div>`;
                        }
                      }}
                    />
                  </div>
                ) : (
                  <FallbackIcon className="h-8 w-8 text-gray-400" />
                )}
                <span className="text-xs sm:text-sm font-medium text-foreground whitespace-nowrap">
                  {company.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
