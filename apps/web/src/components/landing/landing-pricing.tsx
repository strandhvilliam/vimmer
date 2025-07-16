import { Button } from "@vimmer/ui/components/button";
import { PrimaryButton } from "@vimmer/ui/components/primary-button";
import { Trophy, Building2, Target, Wrench, CreditCard } from "lucide-react";

export function LandingPricing() {
  return (
    <section
      id="pricing"
      className="w-full py-12 md:py-20 px-4 md:px-12 bg-background"
    >
      <div className="max-w-6xl mx-auto space-y-12 md:space-y-16">
        <div className="text-center space-y-3 md:space-y-4 max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-rocgrotesk font-medium tracking-tighter text-foreground">
            Simple, transparent pricing (coming soon)
          </h2>
          <p className="text-muted-foreground text-base md:text-lg">
            Pay only for what you use. No hidden fees, no monthly subscriptions.
          </p>
        </div>

        {/* Standard Events */}
        <div className="max-w-4xl mx-auto">
          <div className="group relative overflow-hidden rounded-2xl md:rounded-3xl border border-border bg-gradient-to-br from-background via-background to-muted/20 p-1">
            <div
              className="absolute inset-0 bg-gradient-to-r from-vimmer-primary/10 via-transparent to-vimmer-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                background:
                  "linear-gradient(to right, hsl(var(--vimmer-primary) / 0.1), transparent, hsl(var(--vimmer-primary) / 0.05))",
              }}
            ></div>

            <div className="relative rounded-2xl md:rounded-3xl bg-background p-6 md:p-8 lg:p-10">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-6 md:mb-8 space-y-4 sm:space-y-0">
                <div className="space-y-2 md:space-y-3">
                  <div
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-vimmer-primary/10 text-vimmer-primary text-sm font-medium"
                    style={{
                      backgroundColor: "hsl(var(--vimmer-primary) / 0.1)",
                      color: "hsl(var(--vimmer-primary))",
                    }}
                  >
                    <Trophy size={14} />
                    Most Popular
                  </div>
                  <h3 className="text-2xl md:text-3xl font-rocgrotesk font-medium text-foreground">
                    Standard Events
                  </h3>
                  <p className="text-muted-foreground text-base md:text-lg">
                    Perfect for most photo marathons and competitions
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <div className="flex items-end gap-2 mb-2">
                    <span className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground">
                      $400
                    </span>
                    <span className="text-muted-foreground text-base md:text-lg mb-1 md:mb-2">
                      setup
                    </span>
                  </div>
                  <div className="text-lg md:text-xl font-semibold text-foreground">
                    + $2 per participant
                  </div>
                </div>
              </div>

              {/* Pricing examples with visual calculator */}
              <div className="mb-6 md:mb-8">
                <h4 className="font-semibold text-foreground mb-3 text-sm flex items-center gap-2">
                  Pricing Examples
                </h4>
                <div className="grid grid-cols-1 gap-3 md:gap-4">
                  <div className="relative overflow-hidden rounded-xl border border-border bg-gradient-to-br from-muted/50 to-muted/20 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-foreground text-sm md:text-base">
                          Small Event
                        </span>
                      </div>
                      <span className="text-lg md:text-xl font-bold text-foreground">
                        $600
                      </span>
                    </div>
                    <div className="text-xs md:text-sm text-muted-foreground mt-1">
                      100 participants • $400 setup + $200 participants
                    </div>
                  </div>

                  <div className="relative overflow-hidden rounded-xl border border-border bg-gradient-to-br from-muted/50 to-muted/20 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-foreground text-sm md:text-base">
                          Large Event
                        </span>
                      </div>
                      <span className="text-lg md:text-xl font-bold text-foreground">
                        $1,400
                      </span>
                    </div>
                    <div className="text-xs md:text-sm text-muted-foreground mt-1">
                      500 participants • $400 setup + $1,000 participants
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <PrimaryButton className="w-full sm:w-auto sm:flex-none px-6 md:px-8 py-3 md:py-4 text-base md:text-lg h-auto">
                  Start Your Marathon
                </PrimaryButton>
                <div className="text-center sm:text-left">
                  <Button
                    variant="link"
                    className="text-sm font-medium text-foreground pl-1"
                  >
                    Or try a demo
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enterprise Events */}
        <div className="max-w-4xl mx-auto">
          <div className="group relative overflow-hidden rounded-2xl md:rounded-3xl border border-border bg-gradient-to-br from-background via-background to-muted/10 p-1">
            <div className="relative rounded-2xl md:rounded-3xl bg-background p-6 md:p-8 lg:p-10">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-6 md:mb-8 space-y-4 sm:space-y-0">
                <div className="space-y-2 md:space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted text-muted-foreground text-sm font-medium">
                    <Building2 size={14} />
                    Enterprise
                  </div>
                  <h3 className="text-2xl md:text-3xl font-rocgrotesk font-medium text-foreground">
                    Enterprise Events
                  </h3>
                  <p className="text-muted-foreground text-base md:text-lg">
                    For large-scale competitions with 1000+ participants
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <div className="text-4xl md:text-5xl font-bold text-foreground mb-2">
                    Custom
                  </div>
                  <div className="text-base md:text-lg text-muted-foreground">
                    Volume pricing
                  </div>
                </div>
              </div>

              {/* Enterprise benefits */}
              <div className="mb-6 md:mb-8">
                <h4 className="font-semibold text-foreground mb-3 text-sm flex items-center gap-2">
                  Enterprise Benefits
                </h4>
                <div className="grid grid-cols-1 gap-3 md:gap-4">
                  <div className="relative overflow-hidden rounded-xl border border-border bg-gradient-to-br from-muted/50 to-muted/20 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-foreground text-sm md:text-base">
                          No Participant Limits
                        </span>
                      </div>
                    </div>
                    <div className="text-xs md:text-sm text-muted-foreground mt-1">
                      Scale your event without limits
                    </div>
                  </div>

                  <div className="relative overflow-hidden rounded-xl border border-border bg-gradient-to-br from-muted/50 to-muted/20 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-foreground text-sm md:text-base">
                          Customized Setup and Support
                        </span>
                      </div>
                    </div>
                    <div className="text-xs md:text-sm text-muted-foreground mt-1">
                      Get first class support and setup for your event
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto sm:flex-none px-6 md:px-8 py-3 md:py-4 text-base md:text-lg h-auto border-border text-foreground hover:bg-muted"
                >
                  Contact Us
                </Button>
                <div className="text-center sm:text-left">
                  <div className="text-sm font-medium text-foreground">
                    Custom pricing
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Get a personalized quote
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trust indicators */}
        <div className="text-center">
          <div className="inline-flex flex-col sm:flex-row flex-wrap justify-center gap-4 sm:gap-8 p-4 md:p-6 rounded-2xl bg-muted/30 border border-border">
            <span className="flex items-center gap-3 text-sm text-muted-foreground">
              <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                <Wrench size={16} className="text-green-500" />
              </div>
              Easy onboarding and setup
            </span>
            <span className="flex items-center gap-3 text-sm text-muted-foreground">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                <CreditCard size={16} className="text-blue-500" />
              </div>
              Pay once, no monthly fees
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
