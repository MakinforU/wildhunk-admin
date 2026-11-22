// Wild hunk backend connection (Supabase). The anon key is public by design;
// every write is protected by row-level security and the admin login.
// To move to another Supabase project later, change these two values.
window.WH_CONFIG = {
  url: "https://dgzakcwgfxwudkejtviv.supabase.co",
  key: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnemFrY3dnZnh3dWRrZWp0dml2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ0NDYyNjYsImV4cCI6MjExMDAyMjI2Nn0.jOE5wBM1i_SshFDTldSiU9K-NpnA2KEGyMbzT0fBPAA",
  bucket: "wh-media"
};
