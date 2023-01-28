import sendgrid from "@sendgrid/mail";

sendgrid.setApiKey(process.env.SENDGRID_API_KEY || "");

export async function sendEmailCode(
  email: string,
  code: string,
  useLink = false
) {
  const baseUrl: string | undefined =
    process.env.APP_STAGE?.toLowerCase() == "production"
      ? process.env.URL_PRODUCTION
      : process.env.URL_DEVELOPMENT;
  if (!baseUrl && useLink) {
    throw new Error("Unable to fetch base url.");
  }
  const fullUrl: string =
    baseUrl + `approve` + `?email=${email}` + `&code=${code}`;
  const fromEmail = process.env.SENDGRID_EMAIL;
  const msgText = useLink
    ? `Hi there! I hope you're having a wonderful day. You can follow this link to login: ${fullUrl}`
    : `Hi there! I hope you're having a wonderful day. Your login code is: ${code}`;
  const msg = {
    to: email,
    from: fromEmail || "",
    subject: "Jett Blu Website Login",
    text: msgText,
  };
  try {
    await sendgrid.send(msg);
  } catch {
    throw new Error(
      "Unable to send email. Ensure api key and sender email are correct."
    );
  }
}
