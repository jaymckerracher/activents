import { createClient } from '@supabase/supabase-js';

const projectURL = import.meta.env.VITE_PROJECT_URL;
const projectAPIKey = import.meta.env.VITE_API_KEY;

console.log(projectURL, projectAPIKey)

const supabase = createClient(projectURL, projectAPIKey);

export default supabase;