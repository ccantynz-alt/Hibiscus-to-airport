import React from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  ArrowRight,
  Clock,
  MapPin,
  Shield,
  Phone,
  CheckCircle2,
  Star,
} from "lucide-react";

import Header from "components/Header";
import Footer from "components/Footer";
import { Button } from "components/ui/button";
import { Card, CardContent } from "components/ui/card";
import { getSuburbBySlug } from "@/data/suburbs";
import type { SuburbData } from "@/data/suburbs";

const BASE_URL = "https://hibiscustoairport.co.nz";

function SuburbContent({ suburb }: { suburb: SuburbData }) {
  return (
    <>
      <Helmet>
        <title>{suburb.title} | Hibiscus to Airport</title>
        <meta name="description" content={suburb.description} />
        <link rel="canonical" href={`${BASE_URL}/${suburb.slug}`} />
        <meta property="og:title" content={`${suburb.title} | Hibiscus to Airport`} />
        <meta property="og:description" content={suburb.description} />
        <meta property="og:url" content={`${BASE_URL}/${suburb.slug}`} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
              { "@type": "ListItem", position: 2, name: "Service Areas", item: `${BASE_URL}/service-areas` },
              { "@type": "ListItem", position: 3, name: suburb.title, item: `${BASE_URL}/${suburb.slug}` },
            ],
          })}
        </script>
      </Helmet>

      <Header />

      <main>
        {/* Hero */}
        <section className="relative pt-24 pb-16 bg-gradient-to-br from-[#1E293B] via-[#0F172A] to-[#1E293B]">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#D4AF37] rounded-full blur-3xl" />
          </div>
          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <span className="inline-block bg-[#D4AF37]/20 border border-[#D4AF37]/50 text-[#D4AF37] px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide mb-6">
                LOCAL SERVICE
              </span>
              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                {suburb.name} Airport Shuttle
                <span className="block text-[#D4AF37] mt-2 text-3xl lg:text-4xl">
                  {suburb.heroTagline}
                </span>
              </h1>
              <p className="text-lg text-gray-300 mb-8 leading-relaxed">
                {suburb.heroDescription}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 mb-10">
                <Button
                  asChild
                  size="lg"
                  className="bg-[#D4AF37] hover:bg-[#C4A030] text-white font-semibold"
                >
                  <Link to="/booking">
                    Book Your {suburb.name} Transfer
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-[#D4AF37]/50 text-[#D4AF37] hover:bg-[#D4AF37]/10">
                  <Link to="/pricing">View Pricing</Link>
                </Button>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-4 text-center">
                  <Clock className="h-6 w-6 text-[#D4AF37] mx-auto mb-2" />
                  <p className="text-xl font-bold text-white">{suburb.travelTime}</p>
                  <p className="text-xs text-gray-400">To Airport</p>
                </div>
                <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-4 text-center">
                  <MapPin className="h-6 w-6 text-[#D4AF37] mx-auto mb-2" />
                  <p className="text-xl font-bold text-white">{suburb.distance}</p>
                  <p className="text-xs text-gray-400">Distance</p>
                </div>
                <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-4 text-center">
                  <Shield className="h-6 w-6 text-[#D4AF37] mx-auto mb-2" />
                  <p className="text-xl font-bold text-white">24/7</p>
                  <p className="text-xs text-gray-400">Available</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-[#1E293B] mb-8 text-center">
              Why Choose Our {suburb.name} Service
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {suburb.features.map((feature, i) => (
                <Card key={i}>
                  <CardContent className="pt-6 flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-[#D4AF37] shrink-0 mt-0.5" />
                    <p className="text-sm text-[#1E293B]">{feature}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 bg-[#FAFAFA]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-[#1E293B] mb-8 text-center">
              How It Works
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { step: "1", title: "Book Online", desc: "Choose your date, time, and pickup address. Get an instant price quote." },
                { step: "2", title: "Confirm & Pay", desc: "Secure payment via Stripe. Receive instant email and SMS confirmation." },
                { step: "3", title: "We Pick You Up", desc: `Our driver arrives at your ${suburb.name} address on time, every time.` },
              ].map(({ step, title, desc }) => (
                <div key={step} className="text-center">
                  <div className="w-12 h-12 bg-[#D4AF37] rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold text-lg">{step}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-[#1E293B] mb-2">{title}</h3>
                  <p className="text-sm text-[#64748B]">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-[#1E293B]">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Book Your {suburb.name} Airport Transfer?
            </h2>
            <p className="text-gray-300 mb-8">
              Available 24/7 including public holidays. Book online in under 2 minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-[#D4AF37] hover:bg-[#C4A030] text-white font-semibold"
              >
                <Link to="/booking">
                  Book Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <a
                href="tel:021743321"
                className="inline-flex items-center justify-center gap-2 text-[#D4AF37] font-semibold hover:text-[#C4A030] transition-colors"
              >
                <Phone className="h-5 w-5" />
                021 743 321
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

export default function SuburbShuttlePage() {
  const { slug } = useParams<{ slug: string }>();
  const suburb = slug ? getSuburbBySlug(slug) : undefined;

  if (!suburb) {
    return <Navigate to="/" replace />;
  }

  return <SuburbContent suburb={suburb} />;
}
