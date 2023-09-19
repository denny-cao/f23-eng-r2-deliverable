import { createServerSupabaseClient } from "@/lib/server-utils";

const supabase = createServerSupabaseClient();

export default async function querySpeciesFromAuthor(userId: string) {
  const { data: species, error } = await supabase.from("species").select("*").eq("author", userId);

  if (error) {
    throw error;
  }

  return species;
}
