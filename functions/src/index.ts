// import * as functions from "firebase-functions";
// import * as admin from "firebase-admin";
// import fetch from "node-fetch";

// admin.initializeApp();
// const db = admin.firestore();

// export const sendNotification = functions.https.onRequest(async (req, res) => {
//     // 1. Method guard
//     if (req.method !== "POST") {
//         res.status(405).send("Method Not Allowed");
//         return;
//     }

//     // 2. Input validation
//     const { title, message, externalUserIds, metadata } = req.body;

//     if (!title || !message) {
//         res.status(400).send("Missing required fields: title, message");
//         return;
//     }

//     try {
//         // 3. Persist to Firestore (initial state)
//         const notificationRef = await db.collection("notifications").add({
//             title,
//             message,
//             metadata: metadata || {},
//             externalUserIds: externalUserIds || [],
//             sent: false,
//             createdAt: admin.firestore.FieldValue.serverTimestamp(),
//         });

//         // 4. Prepare OneSignal payload
//         const oneSignalPayload: any = {
//             app_id: functions.config().onesignal.app_id,
//             headings: { en: title },
//             contents: { en: message },
//             data: { ...metadata, notificationId: notificationRef.id },
//         };

//         if (externalUserIds && Array.isArray(externalUserIds) && externalUserIds.length > 0) {
//             oneSignalPayload.include_external_user_ids = externalUserIds;
//         } else {
//             oneSignalPayload.included_segments = ["All"];
//         }

//         // 5. Send to OneSignal
//         const response = await fetch("https://onesignal.com/api/v1/notifications", {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json",
//                 "Authorization": `Basic ${functions.config().onesignal.key}`,
//             },
//             body: JSON.stringify(oneSignalPayload),
//         });

//         const responseData = await response.json();

//         if (!response.ok) {
//             throw new Error(`OneSignal API Error: ${JSON.stringify(responseData)}`);
//         }

//         // 6. Update Firestore with success
//         await notificationRef.update({
//             sent: true,
//             oneSignalId: responseData.id || null,
//             recipients: responseData.recipients || 0,
//             apiResponse: responseData
//         });

//         res.status(200).send({ success: true, notificationId: notificationRef.id, oneSignalResponse: responseData });

//     } catch (error: any) {
//         console.error("Error sending notification:", error);
//         res.status(500).send({ error: error.message });
//     }
// });
