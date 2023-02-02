import crypto from "crypto";

export default function hashToken(token: any) {
  return crypto.createHash("sha512").update(token).digest("hex");
}
