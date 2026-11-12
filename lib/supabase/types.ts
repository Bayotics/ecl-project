export type Settings = {
  id: number
  organization_name: string
  tagline: string
  mission_headline: string
  mission_summary: string
  address: string
  phone: string
  email: string
  donation_url: string
  facebook_url: string
  instagram_url: string
  youtube_url: string
  updated_at: string
}
export type Hero = {
  id: string
  title: string
  subtitle: string
  image_url: string
  image_alt: string
  cta_label: string
  cta_url: string
  sort_order: number
  active: boolean
  created_at: string
  updated_at: string
}
export type Event = {
  id: string
  title: string
  slug: string
  description: string
  category: string
  start_at: string
  end_at: string
  all_day: boolean
  venue: string
  address: string
  image_url: string
  published: boolean
  rsvp_enabled: boolean
  capacity: number | null
  created_at: string
  updated_at: string
}
export type Album = {
  id: string
  title: string
  slug: string
  description: string
  album_date: string | null
  image_url: string
  published: boolean
  sort_order: number
  created_at: string
  updated_at: string
}
export type Photo = {
  id: string
  album_id: string
  image_url: string
  caption: string
  alt_text: string
  published: boolean
  sort_order: number
  created_at: string
  updated_at: string
}
export type Profile = {
  id: string
  full_name: string
  phone: string
  created_at: string
  updated_at: string
}
export type Rsvp = {
  id: string
  event_id: string
  user_id: string
  status: 'going' | 'cancelled'
  created_at: string
  updated_at: string
}
export type Message = {
  id: string
  name: string
  email: string
  phone: string
  subject: string
  message: string
  status: 'unread' | 'read' | 'replied' | 'archived'
  created_at: string
}
export type Subscriber = {
  id: string
  email: string
  active: boolean
  source: string
  created_at: string
}
type Table<T> = {
  Row: T
  Insert: Partial<T>
  Update: Partial<T>
  Relationships: []
}
export type Executive = {
 id: string
 slug: string
 name: string
 role: string
 term: string
 section: "current" | "past" | "presidents"
 bio: string
 image_url: string
 image_alt: string
 sort_order: number
 published: boolean
 created_at: string
}
export type EventCategory = {
 id:string; title:string; slug:string; description:string; image_url:string;
 sort_order:number; published:boolean; created_at:string;
}
export type EventMedia = {
 id:string; category_id:string; title:string; media_type:"image"|"video";
 media_url:string; poster_url:string; alt_text:string; caption:string;
 sort_order:number; published:boolean; created_at:string;
}
export type PageMedia = {
 id:string
 placement:string
 page:"home"|"about"
 label:string
 image_url:string
 image_alt:string
 active:boolean
 sort_order:number
 created_at:string
 updated_at:string
}
export type Tables = {
  page_media: PageMedia
  event_categories: EventCategory
  event_media: EventMedia
  executives: Executive
  site_settings: Settings
  hero_slides: Hero
  events: Event
  gallery_albums: Album
  gallery_photos: Photo
  profiles: Profile
  event_rsvps: Rsvp
  contact_messages: Message
  newsletter_subscribers: Subscriber
  user_roles: { user_id: string; role: 'member' | 'admin' }
}
export type Database = {
  public: {
    Tables: { [K in keyof Tables]: Table<Tables[K]> }
    Views: Record<never, never>
    Enums: Record<never, never>
    CompositeTypes: Record<never, never>
    Functions: {
      is_admin: { Args: Record<never, never>; Returns: boolean }
      set_rsvp: {
        Args: { p_event_id: string; p_going: boolean }
        Returns: undefined
      }
      submit_contact: {
        Args: {
          p_name: string
          p_email: string
          p_phone: string
          p_subject: string
          p_message: string
          p_website?: string
        }
        Returns: undefined
      }
      subscribe_newsletter: {
        Args: { p_email: string; p_website?: string }
        Returns: undefined
      }
    }
  }
}
