import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function check() {
  const res = await fetch(`${supabaseUrl}/rest/v1/properties?select=id,title,images`, {
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    }
  });
  const properties = await res.json();

  let brokenCount = 0;
  for (const prop of properties) {
    for (let i = 0; i < prop.images.length; i++) {
      const url = prop.images[i];
      try {
        const res = await fetch(url, { method: 'HEAD' });
        if (res.status === 404) {
          console.log(`404: ${prop.id} - ${prop.title} - index ${i} - ${url}`);
          brokenCount++;
        }
      } catch (e) {
        console.log(`ERROR: ${prop.id} - ${prop.title} - index ${i} - ${url} - ${e.message}`);
        brokenCount++;
      }
    }
  }
  if (brokenCount === 0) {
    console.log("All images are working correctly!");
  } else {
    console.log(`${brokenCount} images are still broken.`);
  }
}

check();
