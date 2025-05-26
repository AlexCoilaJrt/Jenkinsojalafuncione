import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      'https://twsevdzjdnwjhdysvecm.supabase.co', // Tu SUPABASE_URL
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3c2V2ZHpqZG53amhkeXN2ZWNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU2MDYwNzksImV4cCI6MjA2MTE4MjA3OX0.U2eAVN7HtIZX2_RjLz34RTvNZxAx9bdHMdHjyRAQd0o' // Tu SUPABASE_ANON_KEY
    );
  }

  getClient(): SupabaseClient {
    return this.supabase;
  }
}
