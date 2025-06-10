"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";
import * as admin from "firebase-admin";
import { api } from "./_generated/api";

// Initialize Firebase Admin SDK (ensure you set GOOGLE_APPLICATION_CREDENTIALS env var or use serviceAccountKey.json)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      type: "service_account",
      project_id: "loft5-vip",
      private_key_id: "d7862c96d1038eace6cc7584e84937ea3891afc7",
      private_key:
        "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCllWPo2gY8zrdL\njagT/a8TFCqnMpCPnchxuEiY7V5XDRTNGqx7M/CLTF5s3DnJaTajFuDOcp/ZMnlz\nbmQGOhOcfSvU7ZjGQL9f/jpoXhS6JHx7ObjXWpaCQ99qLIvFatgWhmKE2aALJbDX\nGke18hSokDZ/O8ZL5uc0WH6yEG231Ex8qN7YlsvQT9pzBVsrNNgMhD+rmJ7YFOZ5\ngWc5PUMhbW3fDKPYsJgiu0fQh+W5lQtZ1nIRNJbMQDxSMbVX8JfNPd3DH1RAtvFA\nMow2wBrkVEWrY1d37KyAL8ApVUl+bIdBcjDZDh4vv+kakZaETRRCkRHQqTV+UrAb\nW5KdJy11AgMBAAECggEAIdFuE1ucFIU/qF2pK1QPkrz2rSlFnx9hleBGa31nXC4e\nxnkhKxSDl1+klWUxJDKp5wtAJMoCXbDSX0H3idIIuVhTQGy6XBtTOr7InRJB93aG\nOgCjANDOlpJYKe4pKcvVkFwn+OwdpMkw4e3LIZzsnTS+/KNvr4bcR7OfRKzYS8fr\nDXtNvOduB1j/XgZos4sN1ev3fbrSbRl3o7s3BDOjEtu+8hDlmP97e6zF7rUF7lM7\nTbL77X8/L/x75QcXVzHbgtPKzVT2OfQb4qkE1IhFmFtYrcCG6siWsuo2NDdhPtl5\nR+q4P8lNYv5ZAqy2WPRJBbMcrY0m7ArPwHky1xigjQKBgQDaKBdrE94YqdSPVwo0\na58YbAcbak9ywhBwPtptmjL2q5Ahp2ELgFQ3Je9s/32ryZKVXjTlVvS+HBrRf/vz\n+YsHQJoCILYHCb+PNgMT/EcC6cqUzkCYZq5oONp/SMD9QphaCB5+wn0Ql6cf6l+v\nb2Bt6j6ZLDUK7BwGiJbLNbgi+wKBgQDCTqHgjXHIRQGLH4rx7HCZTJF27EPo3Cnl\nbFgV62qhaHrSgQCAWBxWEEfa+sEdbu0HIW/7iKItvIbik+EFR3/PnQtWCahKp0lI\neQ9d9UEl4+m9itorgVST0EatXsekV5/E7EmwjGQCIc7r8Ie4WC2VJrAauLr/4OIm\nJ2WaPf+GTwKBgQCL3GgnHfWlmjvMKeFA+j5lSdzElsOYrxIa5DDlU5aYziT5bnWp\nCfzz3j5Bgwrut6xiVqNS5QzDVQFcjtDY+YNIgwI5mv8YRAerqNUQWwyrsXdPL2v6\nSNpHtytdrycLN0a1cb8bRVUo7hEXRQtTTfRkg2jeipj3B6hwB+GlJiuHQQKBgEs3\n2V5uIu/eFrzelxET8HrHs0AQMjHAmM9hY7AIlByrr3Ax1BnbAg0m/En+7CcSu9sY\nzJrYx79gze6ERIWgqg+awbqqvmU34RyXEKXUvUWHtwJS8CYLSMx3wgR3Pl2WNhkr\nR1N65XQV1l5rnH52VB76/Q07GdjYG3OdqK1O9s3tAoGBAI0QHeNVKDQw32neB4Yj\n/URRcVw17i34Y1as5W9REEI+Cx+XbAfccfAA3LZ1+bh1ddZBj5qrqHr0K6Gv/PeZ\nsqA5Lm/7GWze/MYEOOTPkfDELXGJ3l1WtbeuqExikrHl1tnc11Q5WhPde7XRk6YE\nNTLkKhcEpgzJbyLQiqH3tcCJ\n-----END PRIVATE KEY-----\n",
      client_email: "firebase-adminsdk-fbsvc@loft5-vip.iam.gserviceaccount.com",
      client_id: "111557611324395691790",
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url:
        "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40loft5-vip.iam.gserviceaccount.com",
      universe_domain: "googleapis.com",
    } as admin.ServiceAccount),
  });
}
interface FCMToken {
  token: string;
}

export const sendPushToAll = action({
  args: {
    title: v.string(),
    body: v.string(),
  },
  handler: async (
    ctx,
    args = { title: "Test", body: "This is a test notification" },
  ) => {
    // Use runQuery with the correct function reference from api
    const tokens: FCMToken[] = await ctx.runQuery(
      api.get_fcm_tokens.getAllFcmTokens,
      {},
    );
    if (!tokens.length) return { success: false, message: "No tokens found" };

    const messages = tokens.map((t: FCMToken) => ({
      token: t.token,
      notification: {
        title: args.title,
        body: args.body,
      },
      webpush: {
        notification: {
          icon: "/pwa-192x192.png",
          badge: "/pwa-64x64.png",
          image: "/pwa-512x512.png",
        },
      },
    }));

    // Send messages in batches
    const responses = await Promise.allSettled(
      messages.map((msg: admin.messaging.Message) =>
        admin.messaging().send(msg),
      ),
    );

    const invalidTokens: string[] = [];
    responses.forEach((result, i) => {
      if (
        result.status === "rejected" &&
        result.reason?.errorInfo?.code ===
          "messaging/registration-token-not-registered"
      ) {
        invalidTokens.push(messages[i].token);
      }
    });

    // Optionally: remove invalidTokens from your fcmTokens table here

    return { success: true, responses, invalidTokens };
  },
});
