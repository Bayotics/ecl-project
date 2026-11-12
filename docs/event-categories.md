# Event categories and media

Apply `supabase/migrations/20261110_event_categories.sql` in the existing Supabase project SQL Editor. This creates `event_categories`, `event_media` and the public `event-media` storage bucket. Database writes and uploads require the existing admin role. Only published media whose category is also published is listed publicly. Storage URLs are public even for unpublished records; publish controls control listing, not asset confidentiality.

Admin workflow:
1. Open `/admin/event_categories` to manage category titles, descriptions, cover images, order and publishing.
2. Open `/admin/event_media`, choose Add record and select a category.
3. Upload a photo (JPEG/PNG/WebP, up to 20 MB) or video (MP4/WebM, up to 50 MB). Photos are resized to at most 2000px and encoded as WebP. Videos are uploaded as supplied, without transcoding.
4. Add a title, description, optional caption/transcript and optional video poster URL. Select Published and save.
5. Reload `/events` to see the published item. Videos use controls and preload=none.

Category deletion is restricted while media still references it. Unpublish a category to hide its collection without deleting its content. Scheduled events can select managed category names; their existing calendar remains below the collections.

Verification: production build and nine regression tests passed. Browser checked category cards, collection selection, existing calendar and admin upload fields. Live upload/save/publish and database policy checks are pending migration application. Focused ESLint did not complete and was stopped; no lint pass claimed.
