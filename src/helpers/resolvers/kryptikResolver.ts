export function isValidEmailAddress(email: string) {
  /* Checks for anystring@anystring.anystring */
  let re = /\S+@\S+\.\S+/;
  return re.test(email);
}
