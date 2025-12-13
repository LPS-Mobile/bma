'use server';

import { createClient } from '@/lib/supabase/server';

export async function updateUserLocation(city: string, country: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return;

  // Update the profile with location data
  await supabase
    .from('profiles')
    .update({
      city: city,
      country: country,
      last_ip: 'captured', // We don't store the raw IP to respect privacy/logs, just the location
    })
    .eq('id', user.id);
}