import { db, ref, set } from "./config.js";

export const sanitizeEmail = (email) => {
  return email.replace(/[.#$\[\]]/g, "_");
};

export const saveUserToFirebase = async (email, data) => {
  const safeEmail = sanitizeEmail(email);
  await set(ref(db, "wallets/" + safeEmail), data);
};