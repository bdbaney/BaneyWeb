/* ============================================================
   Wedding party weekend — static fallback schedule.
   The page renders from this immediately, then swaps in the live
   copy from Supabase (/api/schedule) if it arrives. Keep it in sync
   with supabase-weekend.sql. All times are Eastern (EST, -05:00).
   ============================================================ */
window.WEEKEND_FALLBACK = {
  events: [
    {
      id: "fri-barn", day: "2026-11-06", sort_order: 1,
      title: "Rehearsal + Dinner",
      location_name: "The Barn on New River",
      address: "2162 S Fork Farm Ln, West Jefferson, NC 28694",
      dress_code: "Dress nice / business casual",
      notes: null
    },
    {
      id: "fri-basils", day: "2026-11-06", sort_order: 2,
      title: "Welcome Party",
      location_name: "Basil's Fresh Pasta & Deli",
      address: "246 Wilson Drive, Suite K, Boone, NC 28607",
      dress_code: null,
      notes: "Invites went out, but this one's a relaxed hang. If friends hear about it and swing by, that's totally fine!"
    },
    {
      id: "sat-barn", day: "2026-11-07", sort_order: 1,
      title: "Wedding Day",
      location_name: "The Barn on New River",
      address: "2162 S Fork Farm Ln, West Jefferson, NC 28694",
      dress_code: "You know the drill 😉",
      notes: "Everything happens on site. Everyone gets ready inside the barn, and The Summit is the first-look and portrait spot on the venue grounds."
    },
    {
      id: "sat-mens-house", day: "2026-11-07", sort_order: 2,
      title: "Men's house",
      location_name: "Men's house · S Fork Farm Ln",
      address: null,
      dress_code: null,
      notes: "No street number for this one. Text the groom for directions."
    },
    {
      id: "sun-booneshine", day: "2026-11-08", sort_order: 1,
      title: "Farewell Hang",
      location_name: "Booneshine Brewing Company",
      address: "465 Industrial Park Drive, Boone, NC 28607",
      dress_code: "Whatever's comfy",
      notes: "This is where we met! Come see where it all started."
    }
  ],

  timeline_items: [
    // ---- Friday ----
    { event_id: "fri-barn", start_time: "2026-11-06T15:45:00-05:00", end_time: null, title: "Arrival at The Barn", sort_order: 1 },
    { event_id: "fri-barn", start_time: "2026-11-06T16:00:00-05:00", end_time: "2026-11-06T16:30:00-05:00", title: "Rehearsal", sort_order: 2 },
    { event_id: "fri-barn", start_time: "2026-11-06T16:30:00-05:00", end_time: "2026-11-06T17:30:00-05:00", title: "Cocktail hour", sort_order: 3 },
    { event_id: "fri-barn", start_time: "2026-11-06T17:30:00-05:00", end_time: "2026-11-06T18:30:00-05:00", title: "Dinner", sort_order: 4 },
    { event_id: "fri-basils", start_time: "2026-11-06T19:30:00-05:00", end_time: "2026-11-06T22:00:00-05:00", title: "Welcome Party at Basil's", sort_order: 5 },
    { event_id: "fri-basils", start_time: "2026-11-06T23:00:00-05:00", end_time: null, title: "Head back to West Jefferson", sort_order: 6 },

    // ---- Saturday: Morning ----
    { event_id: "sat-barn", block: "Morning + getting ready", start_time: "2026-11-07T07:00:00-05:00", title: "Venue opens; hair and makeup begins", details: "Early entry", audience: "Bride + bridesmaids", side: "bride", sort_order: 1 },
    { event_id: "sat-barn", block: "Morning + getting ready", start_time: "2026-11-07T10:00:00-05:00", title: "Photography begins", details: "Detail shots and flat lays (venue, tables, details)", audience: "Photographer", sort_order: 2 },
    { event_id: "sat-barn", block: "Morning + getting ready", start_time: "2026-11-07T12:00:00-05:00", title: "Groom and groomsmen arrive", audience: "Groom + groomsmen", side: "groom", sort_order: 3 },
    { event_id: "sat-barn", block: "Morning + getting ready", start_time: "2026-11-07T12:30:00-05:00", title: "\"Getting ready\" portraits", audience: "Groom + groomsmen", side: "groom", sort_order: 4 },
    { event_id: "sat-barn", block: "Morning + getting ready", start_time: "2026-11-07T13:00:00-05:00", title: "Hair and makeup complete; pajama photo", audience: "Bride + bridesmaids", side: "bride", sort_order: 5 },
    { event_id: "sat-barn", block: "Morning + getting ready", start_time: "2026-11-07T13:20:00-05:00", title: "Bride steps into the dress", audience: "Bride", side: "bride", sort_order: 6 },
    { event_id: "sat-barn", block: "Morning + getting ready", start_time: "2026-11-07T13:40:00-05:00", title: "First look with Father of the Bride", audience: "Bride + FOB", side: "bride", sort_order: 7 },

    // ---- Saturday: First look ----
    { event_id: "sat-barn", block: "First look + portraits", start_time: "2026-11-07T13:50:00-05:00", title: "Groom and photographer head to the Summit", audience: "Groom", side: "groom", sort_order: 8 },
    { event_id: "sat-barn", block: "First look + portraits", start_time: "2026-11-07T14:00:00-05:00", title: "Bride to the Summit: first look + couple portraits", audience: "Bride + Groom", sort_order: 9 },
    { event_id: "sat-barn", block: "First look + portraits", start_time: "2026-11-07T14:30:00-05:00", title: "Full wedding party portraits", details: "Then bride + bridesmaids, and groom + groomsmen", audience: "Whole wedding party", sort_order: 10 },
    { event_id: "sat-barn", block: "First look + portraits", start_time: "2026-11-07T15:00:00-05:00", title: "Family photos", audience: "Immediate family", sort_order: 11 },

    // ---- Saturday: Ceremony ----
    { event_id: "sat-barn", block: "Ceremony + cocktail hour", start_time: "2026-11-07T15:30:00-05:00", title: "Prelude music begins", audience: "Everyone", sort_order: 12 },
    { event_id: "sat-barn", block: "Ceremony + cocktail hour", start_time: "2026-11-07T16:00:00-05:00", title: "Ceremony begins", audience: "Everyone", highlight: true, sort_order: 13 },
    { event_id: "sat-barn", block: "Ceremony + cocktail hour", start_time: "2026-11-07T16:30:00-05:00", title: "Cocktail hour begins", audience: "Everyone", sort_order: 14 },
    { event_id: "sat-barn", block: "Ceremony + cocktail hour", start_time: "2026-11-07T17:24:00-05:00", title: "Estimated sunset 🌅", details: "Golden hour, so it's great light for photos", audience: "Everyone", kind: "sunset", sort_order: 15 },

    // ---- Saturday: Reception ----
    { event_id: "sat-barn", block: "Reception", start_time: "2026-11-07T17:25:00-05:00", title: "Guests find their seats in the reception space", details: "Bride's dress gets bustled", audience: "Everyone", sort_order: 16 },
    { event_id: "sat-barn", block: "Reception", start_time: "2026-11-07T17:35:00-05:00", title: "Introductions", details: "Wedding Party → Maid of Honor + Best Man → The Newlyweds", audience: "MOH + Best Man", highlight: true, sort_order: 17 },
    { event_id: "sat-barn", block: "Reception", start_time: "2026-11-07T17:40:00-05:00", title: "Welcome + blessing", details: "Welcome by the Bride's parents; blessing by the Father of the Groom (David)", audience: "Everyone", sort_order: 18 },
    { event_id: "sat-barn", block: "Reception", start_time: "2026-11-07T17:45:00-05:00", title: "Dinner served", details: "DJ releases tables to the buffet", audience: "Everyone", sort_order: 19 },
    { event_id: "sat-barn", block: "Reception", start_time: "2026-11-07T18:30:00-05:00", title: "Cake cutting", audience: "Everyone", sort_order: 20 },
    { event_id: "sat-barn", block: "Reception", start_time: "2026-11-07T18:35:00-05:00", title: "Toasts", details: "Father of the Bride → Maid of Honor → Best Man → The Newlyweds", audience: "MOH + Best Man", highlight: true, sort_order: 21 },
    { event_id: "sat-barn", block: "Reception", start_time: "2026-11-07T18:55:00-05:00", title: "Dances", details: "First Dance → Father/Daughter Dance (bouquet dedication follows) → Mother/Son Dance", audience: "Everyone", sort_order: 22 },
    { event_id: "sat-barn", block: "Reception", start_time: "2026-11-07T20:15:00-05:00", title: "Open dance floor; lights down 🪩", audience: "Everyone", sort_order: 23 },
    { event_id: "sat-barn", block: "Reception", start_time: "2026-11-07T21:15:00-05:00", title: "Last call at the bar", audience: "Everyone", sort_order: 24 },
    { event_id: "sat-barn", block: "Reception", start_time: "2026-11-07T21:30:00-05:00", title: "Bar closes", audience: "Everyone", sort_order: 25 },
    { event_id: "sat-barn", block: "Reception", start_time: "2026-11-07T22:00:00-05:00", title: "Sparkler exit ✨", details: "Event ends", audience: "Everyone", highlight: true, sort_order: 26 },

    // ---- Sunday ----
    { event_id: "sun-booneshine", start_time: "2026-11-08T11:30:00-05:00", end_time: "2026-11-08T14:00:00-05:00", title: "Farewell hang", details: "Come say goodbye to us! Casual come-and-go, so stop by whenever.", audience: "Everyone", sort_order: 1 }
  ],

  // "Getting Around" (shuttles) — empty for now; the page shows the section
  // as soon as this has entries, here or in Supabase.
  getting_around: []
};
