import { ethers } from "ethers";
import BN from "bn.js";
import { Color } from "chart.js";

export const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const hexToInt = (s: string) => {
  const bn = ethers.BigNumber.from(s);
  return parseInt(bn.toString());
};

// reloads app window
export const reloadApp = () => {
  window.location.reload();
};

// pull filename from
export const getFileName = function (url: string): string {
  let name = url.split("/").pop();
  if (!name) throw new Error("Unable to parse file path.");
  // remove extension
  name = name.split(".")[0];
  return name;
};

// helper function that removes line breaks in string
function removeLines(str: string) {
  return str.replace("\n", "");
}

export function removeHttp(url: string) {
  if (url.startsWith("https://")) {
    const https = "https://";
    url = url.slice(https.length);
  }

  if (url.startsWith("http://")) {
    const http = "http://";
    url = url.slice(http.length);
  }

  if (url.startsWith(`www.`)) {
    const www = "www.";
    url = url.slice(www.length);
  }

  if (url.endsWith("/")) {
    url = url.substring(0, -1);
  }

  return url;
}

// transforms key in pem form to a uint8array
function pemToArray(pem: string): Uint8Array {
  pem = removeLines(pem);
  pem = pem.replace("-----BEGIN PRIVATE KEY-----", "");
  pem = pem.replace("-----END PRIVATE KEY-----", "");
  let arrayKey: Buffer = Buffer.from(pem, "base64");
  return Uint8Array.from(arrayKey);
}

// adapted from: https://github.com/SilentCicero/number-to-bn/blob/master/src/index.js
export function numberToBN(arg: number | string): BN {
  if (typeof arg === "string" || typeof arg === "number") {
    var multiplier = new BN(1); // eslint-disable-line
    var formattedString = String(arg).toLowerCase().trim();
    var isHexPrefixed =
      formattedString.substr(0, 2) === "0x" ||
      formattedString.substr(0, 3) === "-0x";
    var stringArg = formattedString;
    if (stringArg.startsWith("-"))
      throw new Error("Number to convert must be positive");
    stringArg = stringArg === "" ? "0" : stringArg;

    if (
      (!stringArg.match(/^-?[0-9]+$/) && stringArg.match(/^[0-9A-Fa-f]+$/)) ||
      stringArg.match(/^[a-fA-F]+$/) ||
      (isHexPrefixed === true && stringArg.match(/^[0-9A-Fa-f]+$/))
    ) {
      return new BN(stringArg, 16).mul(multiplier);
    }

    if (
      (stringArg.match(/^-?[0-9]+$/) || stringArg === "") &&
      isHexPrefixed === false
    ) {
      return new BN(stringArg, 10).mul(multiplier);
    }
  }
  // if we got this far, something must have gone wrong
  throw new Error(
    "[number-to-bn] while converting number " +
      JSON.stringify(arg) +
      " to BN.js instance, error: invalid number value. Value must be an integer, hex string, BN or BigNumber instance. Note, decimals are not supported."
  );
}

export enum ColorEnum {
  red = 0,
  green = 1,
  blue = 2,
  yellow = 3,
  purple = 4,
}

export function createColorString(color: ColorEnum, opacity?: number): string {
  let colorString = "";
  switch (color) {
    case ColorEnum.blue: {
      colorString = "#38bdf8";
      break;
    }
    case ColorEnum.green: {
      colorString = "#22c55e";
      break;
    }
    case ColorEnum.red: {
      colorString = "#ef4444";
      break;
    }
    case ColorEnum.yellow: {
      colorString = "#fbbf24";
      break;
    }
    case ColorEnum.purple: {
      colorString = "#8b5cf6";
      break;
    }
    default: {
      colorString = "#38bdf8";
      break;
    }
  }
  if (opacity) {
    colorString = `${colorString}/${opacity}`;
  }
  return colorString;
}

export const defaultColor = ColorEnum.blue;

/**
 * Split a string into chunks of the given size
 * @param  {String} string is the String to split
 * @param  {Number} size is the size you of the cuts
 * @return {Array} an Array with the strings
 */
export function splitString(str: string, size: number): string[] {
  const numChunks = Math.ceil(str.length / size);
  const chunks = new Array(numChunks);

  for (let i = 0, o = 0; i < numChunks; ++i, o += size) {
    chunks[i] = str.substr(o, size);
  }
  return chunks;
}
