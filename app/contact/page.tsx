import { Metadata } from "next";
import { ContactHero } from "@/components/ui/contact-hero";
import { ContactForm } from "@/components/ui/contact-form";
import { MorphingBlob } from "@/components/ui/morphing-blob";

export const metadata: Metadata = {
  title: "Contact | Portfolio",
  description: "Get in touch to discuss projects and opportunities",
};

export default function ContactPage() {
  return (
    <main className="relative min-h-screen">
      <MorphingBlob />
      <ContactHero />
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-2xl">
            <ContactForm />
          </div>
        </div>
      </section>
    </main>
  );
}

