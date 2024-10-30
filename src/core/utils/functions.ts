import { userTypes } from 'src/core/utils/constants';
import { Request } from 'express';
import { mongo } from 'mongoose';

/* eslint-disable no-useless-escape */
const tempEmailProviders: string[] = [
  'mailinator.com',
  'temp-mail.org',
  'guerrillamail.com',
  '10minutemail.com',
  'dispostable.com',
  'sharklasers.com',
  'maildrop.cc',
  'tempmailaddress.com',
  'yopmail.com',
  'getairmail.com',
  'mailsac.com',
  'trashmail.com',
  'throwawaymail.com',
  'temp-mail.io',
  'burnermail.io',
  'anonaddy.com',
  'anonmails.de',
  'armyspy.com',
  'brefmail.com',
  'cosmorph.com',
  'emailondeck.com',
  'ephemail.net',
  'ezprezzo.com',
  'fakeinbox.com',
  'fastmailforyou.net',
  'filzmail.com',
  'fleckens.hu',
  'fuglu.com',
  'getnada.com',
  'goemailgo.com',
  'inboxbear.com',
  'inboxclean.com',
  'inboxstore.me',
  'incognitomail.org',
  'jetable.org',
  'kasmail.com',
  'klzlk.com',
  'mail-easy.fr',
  'mailnesia.com',
  'mintemail.com',
  'mytemp.email',
  'nada.email',
  'neomailbox.com',
  'nomail.xl.cx',
  'oneoffemail.com',
  'owlpic.com',
  'proxymail.eu',
  'safetymail.info',
  'spamcowboy.com',
  'spamgourmet.com',
  'spamspot.com',
  'spamthis.co.uk',
  'tempemail.biz',
  'tempinbox.co.uk',
  'tempmailer.com',
  'temporarioemail.com.br',
  'temporaryforwarding.com',
  'tempymail.com',
  'tmail.ws',
  'trash-me.com',
  'wegwerfmail.de',
  'xemaps.com',
];

export const REGEXP_PATTERNS = {
  NUMBERS_ONLY: /^\d+$/,
  MOBILE_NUMBER_INDIA: /^[6-9]\d{9}$/,
  ALPHABETS_AND_SPACE: /^[A-Za-z\s]+$/,
  EMAIL: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
  HYPHENS_ALPHABETS_NUMBERS_SPACE: /^[0-9A-Za-z\s\-]+$/,
  PINCODE_INDIA: /^[1-9]{1}[0-9]{2}\s{0,1}[0-9]{3}$/,
  COORDS:
    /^(\+|-)?(?:90(?:(?:\.0{1,6})?)|(?:[0-9]|[1-8][0-9])(?:(?:\.[0-9]{1,})?))$/,
  STRING_ALPHABETS_NUMBERS_HYPENS_PERIOD_SPACES: /^[a-zA-Z0-9 .,-]*$/,
};

export const isTempEmail = (email: string): boolean =>
  (process.env.NODE_ENV === 'production' ||
    process.env.NODE_ENV === 'prod') &&
  tempEmailProviders.includes(
    email.trim().toLowerCase().split('@')[1],
  );
export const ObjectId = (id: string) => new mongo.ObjectId(id);

const objectKeyToString = (prefix: string, obj: any) =>
  Object.keys(obj)
    .sort()
    .reduce((acc, curr) => `${acc}${curr}=${obj[curr]};`, prefix);

export const getCacheKeyFromRequest = (req: Request) => {
  const { query, originalUrl } = req;
  let cacheKey = `U:${originalUrl.replace('/api/', '')}|`;
  if (Object.keys(query).length) {
    cacheKey += objectKeyToString('Q:', query);
  }
  return cacheKey;
};

export const getKeyByUserType = (userType: string) => {
  switch (userType) {
    case userTypes.ADMIN:
      return String(process.env.JWT_ADMIN_KEY);

    default:
      return String(process.env.JWT_KEY);
  }
};

export const calculateExpiry = (expiry: string): Date => {
  const now = new Date();
  const timeUnit = expiry.slice(-1);
  const timeValue = parseInt(expiry.slice(0, -1), 10);

  if (Number.isNaN(timeValue)) {
    throw new Error(
      "Invalid expiry format. Must be a number followed by 'd', 'm', or 'w'.",
    );
  }

  switch (timeUnit) {
    case 'd': // days
      now.setDate(now.getDate() + timeValue);
      break;
    case 'm': // minutes
      now.setMinutes(now.getMinutes() + timeValue);
      break;
    case 'w': // weeks
      now.setDate(now.getDate() + timeValue * 7);
      break;
    default:
      throw new Error(
        "Invalid time unit. Use 'd' for days, 'm' for minutes, or 'w' for weeks.",
      );
  }

  return now;
};

export const getCookieParamForTokens = (tokens: {
  accessToken: string;
  refreshToken?: string;
}) => {
  const cookies = [];
  if (tokens.accessToken) {
    cookies.push([
      'authToken',
      `Bearer ${tokens.accessToken}`,
      {
        expires: calculateExpiry(process.env.JWT_EXPIRY as string),
        httpOnly: true,
        secure: true,
        signed: true,
      },
    ]);
  }
  if (tokens.refreshToken) {
    cookies.push([
      'refreshToken',
      `Bearer ${tokens.refreshToken}`,
      {
        expires: calculateExpiry(
          process.env.JWT_REFRESH_EXPIRY as string,
        ),
        httpOnly: true,
        secure: true,
        signed: true,
      },
    ]);
  }

  return cookies;
};

export const normalizeString = (str: string) =>
  str?.toLowerCase().trim();

export const generateShortHex = (): string => {
  // Get the current time in milliseconds as a hex value
  const timeHex = Date.now().toString(16);

  // Generate a random 4-byte hex string
  const randomHex = Math.floor(Math.random() * 0xffffffff)
    .toString(16)
    .padStart(8, '0');

  // Combine time-based and random hex values, and shorten
  const shortHex = (timeHex + randomHex).slice(0, 12); // Limit to 12 characters

  return shortHex;
};
