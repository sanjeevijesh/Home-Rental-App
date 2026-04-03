// ============================================================
// FILE: src/services/notifications.js
// In-app notification service using Supabase (no Firebase needed)
// ============================================================

const { supabaseAdmin } = require("./supabase");

/**
 * Send an in-app notification to a user.
 * Stores it in the `alerts` table and can be polled / subscribed to
 * via Supabase Realtime on the frontend.
 *
 * @param {string} userId - Target user's UUID
 * @param {string} propertyId - Related property UUID
 * @param {object} meta - Optional extra metadata { title, body }
 * @returns {Promise<object|null>} - The inserted alert row or null
 */
async function sendNotification(userId, propertyId, meta = {}) {
  try {
    const { data, error } = await supabaseAdmin
      .from("alerts")
      .insert({
        user_id: userId,
        property_id: propertyId,
        title: meta.title || null,
        body: meta.body || null,
      })
      .select()
      .single();

    if (error) {
      console.error("❌ Notification insert failed:", error.message);
      return null;
    }

    console.log(`📩 Notification sent to user ${userId.slice(0, 8)}... → alert ${data.id}`);
    return data;
  } catch (err) {
    console.error("❌ Notification error:", err.message);
    return null;
  }
}

/**
 * Send notifications to multiple users at once.
 * @param {Array<{userId: string, propertyId: string, meta?: object}>} notifications
 * @returns {Promise<number>} - Number of successfully sent notifications
 */
async function sendBulkNotifications(notifications) {
  const rows = notifications.map((n) => ({
    user_id: n.userId,
    property_id: n.propertyId,
    title: n.meta?.title || null,
    body: n.meta?.body || null,
  }));

  const { data, error } = await supabaseAdmin
    .from("alerts")
    .insert(rows)
    .select();

  if (error) {
    console.error("❌ Bulk notification failed:", error.message);
    return 0;
  }

  console.log(`📩 Sent ${data.length} bulk notifications`);
  return data.length;
}

module.exports = { sendNotification, sendBulkNotifications };
