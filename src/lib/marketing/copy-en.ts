import type { Copy } from "./copy";

export const en: Copy = {
  meta: {
    title: "ideavellum: design your own degree",
    description:
      "Plan your life like a university term. Courses, class hours, a bell that rings on time, notes, habits, a report card and a transcript of everything you finished.",
  },
  nav: { features: "Features", pricing: "Pricing", faq: "FAQ", login: "Log in", start: "Start free" },
  hero: {
    badge: "Early access · free while we build",
    title: "Design your own degree.",
    lead:
      "ideavellum turns the things you want to learn into a 12-week term: courses with weekly class hours, a bell that tells you when to start, and a report card that shows how you're doing.",
    primary: "Start your first term",
    secondary: "See how it works",
    note: "No account needed to start. Your data can stay on your device.",
    alt: "The Today screen: suggestions for today, the next class with a countdown, and habits",
  },
  areas: {
    title: "Not only school. Anything you want to get better at.",
    items: ["Languages", "Philosophy", "Running", "Cooking", "Piano", "Reading lists", "Quran", "Side projects"],
  },
  features: {
    title: "Everything a term needs, nothing a team needs",
    lead: "A calm, single-person workspace. No channels, no roles, no noise.",
    items: [
      { title: "Weekly timetable", text: "Drag class hours around a 15-minute grid. Weekly, every two weeks, monthly or once." },
      { title: "A bell that rings", text: "A soft bell before and at the start of each class, on your laptop and your phone." },
      { title: "Board and tasks", text: "To do, in progress, review, done. Each card wears the color of its course." },
      { title: "Notes and sources", text: "Rich notes with images and tags; the videos, books and articles you study from." },
      { title: "Focus timer", text: "Pomodoro rounds that log your study time to the right course automatically." },
      { title: "Journal and habits", text: "One page a day, your mood, your own aphorisms and a 12-week habit heatmap." },
    ],
  },
  showcase: [
    {
      eyebrow: "Course page",
      title: "Every course has a home",
      text: "Goal, schedule, topics, tasks, notes and sources live together, under the course's own color.",
      points: ["This week's class hours at a glance", "Topics you can reorder by dragging", "Total time spent, updated as you study"],
      image: "/marketing/course.webp",
      alt: "A course page with its colored header, tabs and this week's timetable",
    },
    {
      eyebrow: "Report card",
      title: "See the term, not just the day",
      text: "Weekly and monthly views compare the time you planned with the time you spent, course by course.",
      points: ["Target vs. actual for each course", "Attendance rate and finished topics", "A streak calendar that rewards showing up"],
      image: "/marketing/report.webp",
      alt: "The report card: weekly totals, target vs. actual per course and a daily chart",
    },
    {
      eyebrow: "Habits",
      title: "Small things, every day",
      text: "Check off the daily habits that hold your term together and watch the streaks grow.",
      points: ["One tap to check a habit", "Streak counts for each habit", "Twelve weeks of history in one view"],
      image: "/marketing/habits.webp",
      alt: "The habits page with checkmarks, streaks and a heatmap",
    },
  ],
  how: {
    title: "How it works",
    steps: [
      { title: "Open a term", text: "Twelve weeks is a good start. Give it a name, like “Autumn 2026”." },
      { title: "Add your courses", text: "Pick a color and a kind, then add weekly class hours to the timetable." },
      { title: "Show up", text: "The bell rings, you study, and the report card fills itself in. Finished courses move to your transcript." },
    ],
  },
  pricing: {
    title: "Simple pricing",
    lead: "Start free on your device. Upgrade when you want your term everywhere.",
    monthly: "Monthly",
    yearly: "Yearly",
    perMonth: "/ month",
    perYear: "/ year",
    save: (n) => `Save ${n}%`,
    early: "Early access: every feature is free right now. Paid plans will be announced in advance.",
    free: {
      name: "Free",
      tagline: "For one focused term",
      cta: "Start free",
      items: ["Data stays on your device", "1 active term, up to 3 courses", "Timetable, board, notes and journal", "In-app bell and focus timer", "Backup to a file you choose"],
    },
    premium: {
      name: "Premium",
      tagline: "For a life-long curriculum",
      cta: "Start free today",
      soon: "Coming soon",
      items: ["Sync across all your devices", "Unlimited terms and courses", "Phone and email reminders", "Full report card and transcript export", "Smart weekly planning"],
    },
  },
  faq: {
    title: "Questions",
    items: [
      { q: "Do I need an account?", a: "No. Choose “Only on this device” and start right away. Your data is stored in your browser and, if you like, in a file on your computer. You can move it to a cloud account later." },
      { q: "Where is my data stored?", a: "In device mode, nothing leaves your device. In cloud mode, your data is stored in our database (Supabase) and protected so only your account can read it." },
      { q: "Does it work on my phone?", a: "Yes. Open ideavellum in your phone's browser and add it to your home screen. It then behaves like an app and can send reminders." },
      { q: "Is it only for students?", a: "No. A “course” can be a language, a workout plan, a recipe collection, a reading list or a spiritual practice. Each kind uses its own words." },
      { q: "Can I export my data?", a: "Any time. Settings → Data and backup gives you a single JSON file with everything you've written." },
      { q: "What happens when paid plans launch?", a: "You'll hear about it in advance. The free plan stays free and you won't lose anything you've created." },
    ],
  },
  cta: { title: "Your next term starts today.", text: "It takes about two minutes to set up your first course.", button: "Start free" },
  footer: { tagline: "A calm study system for one.", privacy: "Privacy", terms: "Terms", refund: "Refunds", contact: "Contact", language: "Türkçe" },
};
