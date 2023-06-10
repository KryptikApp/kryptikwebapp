// file should only be referenced on the server
let rpID: string;
if (process.env.IS_PRODUCTION?.toLowerCase() == "true") {
  // prod
  rpID = "kryptik.app";
} else {
  // dev
  rpID = "localhost";
}
const rpName = "Kryptik";

export { rpID, rpName };
