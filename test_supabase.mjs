import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: './.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testFetch() {
    try {
        console.log("Fetching users...");
        let res = await supabase.from('users').select('*');
        if (res.error) console.error("Users Error:", res.error);
        else console.log("Users Fetched:", res.data.length);
        
        console.log("Fetching listings...");
        let lst = await supabase.from('listings').select('*');
        if (lst.error) console.error("Listings Error:", lst.error);
        else console.log("Listings Fetched:", lst.data.length);
        
    } catch (e) {
        console.error("Error:", e);
    }
}
testFetch();
