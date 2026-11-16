/**
 * Website settings catalogue.
 * The seed inserts these keys; the admin dashboard edits the values; the public
 * site reads them through `useSiteSettings()`. Values marked [PLACEHOLDER] are
 * awaiting the real business information.
 */

export type SettingType = 'TEXT' | 'TEXTAREA' | 'URL' | 'PHONE' | 'EMAIL' | 'JSON' | 'BOOLEAN'

export interface SettingDefinition {
  key: string
  group: string
  label: string
  type: SettingType
  value: string
  help?: string
}

export const SETTING_GROUPS: Record<string, string> = {
  contact: 'Contact & social',
  hero: 'Homepage hero',
  intro: 'Homepage introduction',
  cta: 'Calls to action',
  about: 'About page',
  footer: 'Footer',
  enquiry: 'Enquiry form',
  seo: 'SEO defaults',
}

const d = (key: string, group: string, label: string, type: SettingType, value: string, help?: string): SettingDefinition => ({
  key, group, label, type, value, help,
})

export const SETTING_DEFINITIONS: SettingDefinition[] = [
  // Contact & social
  d('contact.whatsapp', 'contact', 'WhatsApp number', 'PHONE', '', 'Digits only, international format without "+", e.g. 2547XXXXXXXX. Powers every WhatsApp button.'),
  d('contact.phone', 'contact', 'Phone number (display)', 'PHONE', '[PLACEHOLDER: phone number]', 'Shown on the contact page and footer.'),
  d('contact.email', 'contact', 'Email address', 'EMAIL', '[PLACEHOLDER: hello@example.com]'),
  d('contact.location', 'contact', 'Location', 'TEXT', '[PLACEHOLDER: Nairobi, Kenya]', 'City or area served.'),
  d('contact.hours', 'contact', 'Business hours', 'TEXT', '[PLACEHOLDER: Mon – Sat, 9:00 – 18:00]'),
  d('contact.instagram', 'contact', 'Instagram URL', 'URL', '', 'Full URL, e.g. https://instagram.com/yourhandle'),
  d('contact.facebook', 'contact', 'Facebook URL', 'URL', ''),
  d('contact.tiktok', 'contact', 'TikTok URL', 'URL', ''),

  // Hero
  d('hero.headline', 'hero', 'Headline', 'TEXT', 'Your Vision. Our Creativity. An Unforgettable Experience.'),
  d('hero.subheadline', 'hero', 'Supporting text', 'TEXTAREA', 'From intimate celebrations to grand occasions, we plan, style and coordinate every detail to make your special moments extraordinary.'),
  d('hero.primaryCta', 'hero', 'Primary button text', 'TEXT', 'Plan Your Event'),
  d('hero.secondaryCta', 'hero', 'Secondary button text', 'TEXT', 'Explore Our Work'),

  // Intro
  d('intro.headline', 'intro', 'Headline', 'TEXT', 'More Than Events. We Create Experiences.'),
  d('intro.body', 'intro', 'Body text', 'TEXTAREA', 'Prissy Plans Events is a creative event planning and styling studio that turns ideas into memorable experiences. We listen closely, design thoughtfully and coordinate with calm precision, so every celebration feels effortless, personal and beautifully considered.'),

  // CTAs
  d('cta.finalHeadline', 'cta', 'Final CTA headline', 'TEXT', "Let's Make Your Next Celebration Unforgettable."),
  d('cta.finalButton', 'cta', 'Final CTA button text', 'TEXT', 'Start Planning Your Event'),
  d('cta.whatsappLabel', 'cta', 'WhatsApp button text', 'TEXT', 'Chat on WhatsApp'),
  d('cta.whatsappGreeting', 'cta', 'Default WhatsApp message', 'TEXTAREA', "Hello Prissy Plans Events, I'd like to enquire about planning an event."),

  // About
  d('about.headline', 'about', 'Headline', 'TEXT', 'Thoughtful planning, beautiful styling, calm coordination.'),
  d('about.intro', 'about', 'Introduction', 'TEXTAREA', 'Prissy Plans Events is an event planning, decoration and coordination studio based in Kenya. We create weddings, celebrations and corporate occasions that feel personal, polished and memorable.'),
  d('about.story', 'about', 'Our story', 'TEXTAREA', '[PLACEHOLDER: Share the story behind Prissy Plans Events — how it started, what inspired it and the moments that shaped it.]'),
  d('about.philosophy', 'about', 'Creative philosophy', 'TEXTAREA', 'We believe every event should feel like the people it celebrates. Our styling begins with your story, your palette and the atmosphere you want your guests to remember, then layers in texture, light and detail with restraint and intention.'),
  d('about.approach', 'about', 'Our approach', 'TEXTAREA', 'We plan with structure and style with heart. Clear timelines, trusted suppliers and honest communication sit behind every design, so on the day you are free to be fully present.'),
  d('about.difference', 'about', 'What makes us different', 'TEXTAREA', 'Personal attention from first conversation to final farewell, creative direction tailored to you, and coordination that quietly handles everything behind the scenes.'),
  d('about.teamName', 'about', 'Planner / team name', 'TEXT', '[PLACEHOLDER: Founder name]'),
  d('about.teamRole', 'about', 'Planner / team role', 'TEXT', 'Founder & Lead Planner'),
  d('about.teamPhoto', 'about', 'Planner / team photo (Cloudinary public id or URL)', 'TEXT', '', 'Leave empty to hide the photo block.'),

  // Footer
  d('footer.tagline', 'footer', 'Footer tagline', 'TEXT', 'Event planning, decoration & coordination · Kenya'),
  d('footer.note', 'footer', 'Footer note', 'TEXTAREA', 'Serving clients across Kenya, with availability for destination events on request.'),

  // Enquiry form
  d('enquiry.budgetRanges', 'enquiry', 'Budget ranges (JSON)', 'JSON', JSON.stringify([
    { key: 'below-50k', label: 'Below KES 50,000' },
    { key: '50k-100k', label: 'KES 50,000 – 100,000' },
    { key: '100k-250k', label: 'KES 100,000 – 250,000' },
    { key: '250k-500k', label: 'KES 250,000 – 500,000' },
    { key: 'above-500k', label: 'Above KES 500,000' },
    { key: 'undecided', label: 'Not yet decided' },
  ]), 'Array of { key, label }. Indicative ranges only, never shown as prices.'),
  d('enquiry.successMessage', 'enquiry', 'Success message', 'TEXTAREA', 'Thank you for sharing your vision. We have received your enquiry and will be in touch shortly to arrange a consultation.'),
  d('enquiry.adminEmail', 'enquiry', 'Notification inbox override', 'EMAIL', '', 'Optional. Overrides NUXT_ADMIN_NOTIFICATION_EMAIL from the environment.'),

  // SEO
  d('seo.siteName', 'seo', 'Site name', 'TEXT', 'Prissy Plans Events'),
  d('seo.defaultTitle', 'seo', 'Default page title', 'TEXT', 'Event Planning, Decoration & Coordination in Kenya'),
  d('seo.defaultDescription', 'seo', 'Default meta description', 'TEXTAREA', 'Prissy Plans Events plans, styles and coordinates weddings, birthdays, showers, corporate events and private celebrations across Kenya.'),
  d('seo.ogImage', 'seo', 'Default Open Graph image URL', 'URL', '/brand/og-default.png'),
]

export const DEFAULT_SETTINGS: Record<string, string> = Object.fromEntries(
  SETTING_DEFINITIONS.map(s => [s.key, s.value]),
)
