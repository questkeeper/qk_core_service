import { Context } from "hono";
import { SupabaseClient, User } from "@supabase/supabase-js";

export async function deleteAccount(c: Context) {
  const supabase = c.get("supabase") as SupabaseClient;
  const user = c.get("user") as User;

  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    // Delete user's data from public_user_profiles
    const { error: deleteProfileError } = await supabase
      .from("public_user_profiles")
      .delete()
      .eq("user_id", user.id);

    if (deleteProfileError) {
      return c.json({ error: "Failed to delete user profile" }, 500);
    }
  } catch {
    return c.json({ error: "Failed to delete profile" }, 500);
  }

  try {
    // Delete user's data from Supabase Auth
    const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(
      user.id
    );
    if (deleteAuthError) {
      console.log("error: ", deleteAuthError);
      return c.json({ error: "Failed to delete user account" }, 500);
    }

    return c.json({ success: true }, 200);
  } catch (error) {
    return c.json({ error: "Failed to delete account" }, 500);
  }
}

export async function deactivateAccount(c: Context) {
  const supabase = c.get("supabase") as SupabaseClient;
  const user = c.get("user");

  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    // Update user's status in public_user_profiles
    const { error: updateError } = await supabase
      .from("public_user_profiles")
      .update({ isActive: false })
      .eq("user_id", user.id);

    if (updateError) {
      console.log(updateError);
      return c.json({ error: "Failed to deactivate account" }, 500);
    }

    // Disable user's auth account
    const { error: updateAuthError } = await supabase.auth.admin.updateUserById(
      user.id,
      { ban_duration: "none" }
    );

    if (updateAuthError) {
      return c.json({ error: "Failed to deactivate auth account" }, 500);
    }

    return c.json({ success: true }, 200);
  } catch (error) {
    return c.json({ error: "Failed to deactivate account" }, 500);
  }
}

export async function reactivateAccount(c: Context) {
  const supabase = c.get("supabase") as SupabaseClient;
  const user = c.get("user");

  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    // Update user's status in public_user_profiles
    const { error: updateError } = await supabase
      .from("public_user_profiles")
      .update({ isActive: true })
      .eq("user_id", user.id);

    if (updateError) {
      return c.json({ error: "Failed to reactivate account" }, 500);
    }

    // Re-enable user's auth account by removing the ban
    const { error: updateAuthError } = await supabase.auth.admin.updateUserById(
      user.id,
      { ban_duration: "none" }
    );

    if (updateAuthError) {
      return c.json({ error: "Failed to reactivate auth account" }, 500);
    }

    return c.json({ success: true }, 200);
  } catch (error) {
    return c.json({ error: "Failed to reactivate account" }, 500);
  }
}
