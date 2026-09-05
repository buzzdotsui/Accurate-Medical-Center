import { MarketingHome } from "@/marketing/MarketingHome";
import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Infertility & Addiction Care in Akure",
  description: siteConfig.description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: "/",
    siteName: siteConfig.name,
    title: "Infertility & Addiction Care in Akure",
    description: siteConfig.description,
    images: [{
      url: siteConfig.ogImage,
      width: 1920,
      height: 1080,
      alt: "Accurate Medical Center in Akure, Ondo State",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Infertility & Addiction Care in Akure",
    description: siteConfig.description,
    images: [{
      url: siteConfig.ogImage,
      alt: "Accurate Medical Center in Akure, Ondo State",
    }],
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "MedicalClinic",
      "@id": `${siteConfig.url}/#medical-clinic`,
      name: siteConfig.name,
      url: siteConfig.url,
      logo: `${siteConfig.url}/marketing/images/logo.jpeg`,
      image: `${siteConfig.url}${siteConfig.ogImage}`,
      telephone: siteConfig.contact.phone.primary,
      email: siteConfig.contact.email.general,
      address: {
        "@type": "PostalAddress",
        streetAddress: `${siteConfig.contact.address.street}, ${siteConfig.contact.address.landmark}, ${siteConfig.contact.address.area}`,
        addressLocality: siteConfig.contact.address.city,
        addressRegion: siteConfig.contact.address.state,
        addressCountry: "NG",
      },
    },
    {
      "@type": "WebSite",
      "@id": `${siteConfig.url}/#website`,
      name: siteConfig.name,
      url: siteConfig.url,
    },
    {
      "@type": "WebPage",
      "@id": `${siteConfig.url}/#webpage`,
      url: siteConfig.url,
      name: "Infertility & Addiction Care in Akure",
      isPartOf: { "@id": `${siteConfig.url}/#website` },
      about: { "@id": `${siteConfig.url}/#medical-clinic` },
    },
  ],
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
      <MarketingHome />
    </>
  );
}
