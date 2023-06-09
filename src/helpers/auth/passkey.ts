let rpID: string;
if (process.env.IS_PRODUCTION == "true") {
  // prod
  rpID = "kryptik.app";
} else {
  // dev
  rpID = "localhost";
}
const rpName = "Kryptik";

export { rpID, rpName };
