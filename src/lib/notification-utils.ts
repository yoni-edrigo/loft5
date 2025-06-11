import { ConvexClient } from "convex/browser";
import { api } from "../../convex/_generated/api";

/**
 * Utility function to send a notification to all users
 */
export async function sendNotificationToAll(
  client: ConvexClient,
  title: string,
  body: string,
): Promise<{ success: boolean; message?: string }> {
  try {
    const result = await client.action(api.send_push.sendPushToAll, {
      title,
      body,
    });

    return {
      success: true,
      message: `Sent to ${result.successCount} devices (${result.failureCount} failed)`,
    };
  } catch (error) {
    console.error("Failed to send notification:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Utility function to send a notification to a specific topic
 */
export async function sendNotificationToTopic(
  client: ConvexClient,
  topic: string,
  title: string,
  body: string,
  data?: Record<string, string>,
): Promise<{ success: boolean; message?: string }> {
  try {
    await client.action(api.topic_push.sendPushToTopic, {
      topic,
      title,
      body,
      data,
    });

    return { success: true, message: `Sent to topic "${topic}"` };
  } catch (error) {
    console.error(`Failed to send notification to topic ${topic}:`, error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Subscribe current user's token to a topic
 */
export async function subscribeToTopic(
  client: ConvexClient,
  topic: string,
): Promise<{ success: boolean; message?: string }> {
  try {
    // Get token from localStorage
    const token = localStorage.getItem("fcm_token");
    if (!token) {
      return { success: false, message: "No FCM token found" };
    }

    const result = await client.action(api.topic_push.subscribeToTopic, {
      topic,
      tokens: [token],
    });

    return {
      success: true,
      message: `Subscribed to "${topic}" with ${result.successCount} success`,
    };
  } catch (error) {
    console.error(`Failed to subscribe to topic ${topic}:`, error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Unsubscribe current user's token from a topic
 */
export async function unsubscribeFromTopic(
  client: ConvexClient,
  topic: string,
): Promise<{ success: boolean; message?: string }> {
  try {
    // Get token from localStorage
    const token = localStorage.getItem("fcm_token");
    if (!token) {
      return { success: false, message: "No FCM token found" };
    }

    const result = await client.action(api.topic_push.unsubscribeFromTopic, {
      topic,
      tokens: [token],
    });

    return {
      success: true,
      message: `Unsubscribed from "${topic}" with ${result.successCount} success`,
    };
  } catch (error) {
    console.error(`Failed to unsubscribe from topic ${topic}:`, error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
