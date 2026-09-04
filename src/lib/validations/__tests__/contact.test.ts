import { describe, expect, it } from "vitest";
import { ContactFormSchema } from "@/lib/validations/contact";

const validContact = {
  name: "Adebayo Okafor",
  phone: "+234 703 909 2836",
  email: "adebayo@example.com",
  message: "I would like to ask about your clinic hours.",
  website: "",
};

describe("ContactFormSchema", () => {
  it("accepts and trims a general contact enquiry", () => {
    const result = ContactFormSchema.parse({
      ...validContact,
      name: "  Adebayo Okafor  ",
      message: "  I would like to ask about your clinic hours.  ",
    });

    expect(result.name).toBe("Adebayo Okafor");
    expect(result.message).toBe("I would like to ask about your clinic hours.");
  });

  it("accepts legitimate international phone-number characters without a trailing asterisk", () => {
    expect(ContactFormSchema.safeParse({ ...validContact, phone: "+23490493337959" }).success).toBe(true);
  });

  it("accepts an empty optional email address", () => {
    expect(ContactFormSchema.safeParse({ ...validContact, email: "" }).success).toBe(true);
  });

  it("rejects malformed, oversized, and unexpected submissions", () => {
    expect(ContactFormSchema.safeParse({ ...validContact, email: "not-an-email" }).success).toBe(false);
    expect(ContactFormSchema.safeParse({ ...validContact, message: "   " }).success).toBe(false);
    expect(ContactFormSchema.safeParse({ ...validContact, name: "A".repeat(101) }).success).toBe(false);
    expect(ContactFormSchema.safeParse({ ...validContact, extra: "unexpected" }).success).toBe(false);
  });

  it("rejects a populated honeypot field", () => {
    expect(ContactFormSchema.safeParse({ ...validContact, website: "spam.example" }).success).toBe(false);
  });
});
