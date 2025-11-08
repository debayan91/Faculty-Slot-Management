
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

// Initialize the Firebase Admin SDK
admin.initializeApp();

/**
 * Triggered when a new document is added to the 'authorized_emails' collection.
 * Sets a custom user claim `admin: true` on the user corresponding to the email.
 */
export const setAdminClaim = functions.firestore
  .document("authorized_emails/{email}")
  .onCreate(async (snap, context) => {
    const email = context.params.email;
    functions.logger.log(`New authorized email added: ${email}`);

    try {
      // Get the user record by email
      const user = await admin.auth().getUserByEmail(email);
      
      // Get the user's current custom claims
      const currentClaims = user.customClaims || {};

      // If the user is already an admin, do nothing
      if (currentClaims.admin === true) {
        functions.logger.log(`User ${email} (${user.uid}) is already an admin. No changes made.`);
        return null;
      }

      // Set the custom claim `admin: true`
      await admin.auth().setCustomUserClaims(user.uid, { ...currentClaims, admin: true });
      
      functions.logger.log(`Successfully set admin claim for user ${email} (${user.uid})`);
      
      // We can optionally update the document to reflect the UID for easier lookup
      return snap.ref.update({ userId: user.uid, status: 'CLAIM_SET_SUCCESS' });

    } catch (error) {
      functions.logger.error(`Error setting admin claim for ${email}:`, error);
      // Update the document to reflect the error
      return snap.ref.update({ status: 'ERROR_SETTING_CLAIM' });
    }
  });

/**
 * Triggered when a document is deleted from the 'authorized_emails' collection.
 * Removes the `admin: true` custom user claim from the corresponding user.
 */
export const removeAdminClaim = functions.firestore
  .document("authorized_emails/{email}")
  .onDelete(async (snap, context) => {
    const email = context.params.email;
    const deletedDoc = snap.data();
    functions.logger.log(`Authorized email removed: ${email}`);

    // The document might have the userId stored on it from the onCreate trigger.
    const userId = deletedDoc.userId;

    try {
      let userToUpdate: admin.auth.UserRecord;

      if (userId) {
        userToUpdate = await admin.auth().getUser(userId);
      } else {
        // Fallback to looking up by email if userId is not on the doc
        userToUpdate = await admin.auth().getUserByEmail(email);
      }

      const currentClaims = userToUpdate.customClaims || {};

      // If the user doesn't have an admin claim, do nothing.
      if (currentClaims.admin !== true) {
        functions.logger.log(`User ${email} (${userToUpdate.uid}) was not an admin. No claims removed.`);
        return null;
      }
      
      // Remove the admin property from claims
      const { admin, ...newClaims } = currentClaims;

      await admin.auth().setCustomUserClaims(userToUpdate.uid, newClaims);

      functions.logger.log(`Successfully removed admin claim for user ${email} (${userToUpdate.uid})`);
      return null;

    } catch (error) {
      // This can happen if the user was deleted before the email was removed.
      if ((error as any).code === 'auth/user-not-found') {
         functions.logger.warn(`User with email ${email} not found. Cannot remove claims.`);
         return null;
      }
      functions.logger.error(`Error removing admin claim for ${email}:`, error);
      return null; // Don't do anything further
    }
  });
