import type { LegalDocs } from "./legal";

/** {contact} yerine destek e-postası (ya da yedek ifade) yazılır. */
export const legalEn: LegalDocs = {
  updated: "Last updated: 2 November 2026",
  contactFallback: "the contact address that will be published on this page",
  privacy: {
    title: "Privacy policy",
    intro: "ideavellum is a personal study planner. This page explains what we store, why, and what you can do about it. The short version: your notes are yours, we don't sell data and we don't show ads.",
    sections: [
      { h: "Two ways to store your data", p: [
        "Only on this device: you use ideavellum without an account. Everything you write is stored in your browser (IndexedDB) and, if you choose, in a file on your computer. It never reaches our servers.",
        "In the cloud: you sign in with your email address. Your data is stored in our database so you can open it on any device. Each row is tied to your account and protected by row-level security, so only your account can read it.",
      ] },
      { h: "What we collect in cloud mode", p: [
        "Your email address (to sign you in with a one-time link), your profile settings (name, time zone, bell and notification preferences) and the content you create: terms, courses, class hours, tasks, notes, images, sources, study time, journal entries, quotes and habits.",
        "If you turn on phone notifications, we store the push subscription your browser gives us. We do not collect your location, contacts or anything from other apps.",
      ] },
      { h: "Service providers", p: [
        "We rely on a small number of providers to run the service: Supabase (database, authentication and file storage), Vercel (hosting), Resend (sending email reminders) and your browser vendor's push service (delivering phone notifications).",
        "Optional AI features are off by default. If you turn them on, only the text needed for the request you made is sent to Anthropic, and it is not used to train models.",
        "When paid plans launch, payments will be handled by Paddle.com as our reseller and Merchant of Record. We never see your full card details.",
      ] },
      { h: "Cookies and local storage", p: [
        "We use only the cookies needed to run the app: your sign-in session and your storage choice (device or cloud). We don't use advertising cookies or cross-site trackers. If we add privacy-friendly product analytics in the future, we will update this page first.",
      ] },
      { h: "Your rights", p: [
        "You can export everything at any time from Settings → Data and backup. You can ask us to correct or delete your account and data by writing to {contact}; we will do so within 30 days.",
        "If you are in the EU/EEA, the UK or Türkiye, you have rights under the GDPR, UK GDPR and KVKK respectively, including access, rectification, erasure, restriction, portability and objection. You can also complain to your local data protection authority.",
      ] },
      { h: "Retention and security", p: [
        "We keep your data while your account is active. When you delete your account, your data is removed from the live database and disappears from backups within 30 days. Data is encrypted in transit and at rest by our providers.",
      ] },
      { h: "Children", p: ["ideavellum is not directed at children under 13, and we don't knowingly collect their data."] },
      { h: "Changes", p: ["If we change this policy in a meaningful way, we'll let you know in the app or by email before it takes effect."] },
      { h: "Contact", p: ["Questions about privacy: {contact}."] },
    ],
  },
  terms: {
    title: "Terms of service",
    intro: "These terms apply when you use ideavellum. By using the service you agree to them.",
    sections: [
      { h: "The service", p: [
        "ideavellum is a personal planner for studying and self-improvement. It is currently in early access: features may change, and some may be added, removed or moved to a paid plan with advance notice.",
      ] },
      { h: "Your account and content", p: [
        "You own everything you write in ideavellum. You give us only the permission needed to store, back up and show it to you. You are responsible for keeping your sign-in email secure.",
        "In device mode, your data lives only on your device. Clearing your browser data can erase it, so keep a backup file.",
      ] },
      { h: "Acceptable use", p: [
        "Don't use ideavellum to break the law, store content you have no right to, attack or overload the service, or try to access other people's data.",
      ] },
      { h: "Paid plans", p: [
        "When paid plans launch, prices will be shown before you buy. Purchases are processed by Paddle.com, our reseller and Merchant of Record, and Paddle's buyer terms apply to the payment. Subscriptions renew automatically until you cancel; you can cancel any time and keep access until the end of the paid period.",
      ] },
      { h: "Availability and warranty", p: [
        "We work hard to keep ideavellum available and your data safe, but the service is provided “as is”, without warranties of any kind. Keep your own backups of anything important.",
      ] },
      { h: "Limitation of liability", p: [
        "To the extent permitted by law, we are not liable for indirect or consequential losses, and our total liability is limited to the amount you paid us in the 12 months before the claim. Nothing in these terms limits rights you have as a consumer under the law of your country.",
      ] },
      { h: "Ending", p: [
        "You can stop using ideavellum and delete your account at any time. We may suspend accounts that seriously break these terms; where possible we'll give notice and a chance to export your data.",
      ] },
      { h: "Governing law", p: ["These terms are governed by the laws of the Republic of Türkiye, without prejudice to mandatory consumer protections where you live."] },
      { h: "Contact", p: ["Questions about these terms: {contact}."] },
    ],
  },
  refund: {
    title: "Refund policy",
    intro: "ideavellum is free during early access, so there is nothing to refund today. This is how refunds will work once paid plans launch.",
    sections: [
      { h: "14-day money-back guarantee", p: [
        "If you're not happy with Premium, ask for a refund within 14 days of your first payment and you'll get it in full. No questions asked.",
      ] },
      { h: "Renewals", p: [
        "You can cancel any time; your plan stays active until the end of the period you paid for. If a yearly renewal surprised you, ask within 14 days of the renewal and we'll refund it.",
      ] },
      { h: "How to ask", p: [
        "Payments are processed by Paddle.com, our Merchant of Record. Reply to your Paddle receipt email, use paddle.net to find your order, or write to {contact}. Refunds go back to the original payment method, usually within 5–10 business days.",
      ] },
    ],
  },
};
