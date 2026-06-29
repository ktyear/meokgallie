/* ═══════════════════════════════════════════════
   술향기마을 — Supabase 클라이언트
   ═══════════════════════════════════════════════ */

const SUPABASE_URL = 'https://mhqgdybtqomgkrdkhhhw.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ocWdkeWJ0cW9tZ2tyZGtoaGh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2OTMyMzUsImV4cCI6MjA5ODI2OTIzNX0.9gGK9I5RTHRJWUy-7fnEjM7p29LZs-F-uEbEOqNTGAs';

const soolClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
