// src/supabaseClient.js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = 'https://mplgyeorjoavixtxrbtr.supabase.co';
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wbGd5ZW9yam9hdml4dHhyYnRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwNDk3MDgsImV4cCI6MjA2OTYyNTcwOH0.sH_ntrrCtRjkHtWMvgB4QumufugeMNiOLzJ_S6FHDk0";

export const supabase = createClient(supabaseUrl, supabaseKey);
