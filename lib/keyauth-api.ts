// KeyAuth Seller API Client (proxied through /api/keyauth to avoid CORS/403/423)
// Documentation: https://keyauthdocs.apidog.io/

const KEYAUTH_API_BASE = "/api/keyauth";

export interface KeyAuthResponse<T = unknown> {
  success: boolean;
  message: string;
  [key: string]: T | boolean | string;
}

export interface License {
  id: string;
  key: string;
  note: string;
  expires: string;
  status: string;
  level: string;
  genby: string;
  gendate: string;
  usedon: string;
  usedby: string;
  app: string;
  banned: string;
}

export interface User {
  username: string;
  subscriptions: Subscription[];
  ip: string;
  hwid: string;
  createdate: string;
  lastlogin: string;
  cooldown: string;
  banned: string;
}

export interface Subscription {
  subscription: string;
  key: string;
  expiry: string;
  timeleft: number;
  level: string;
}

export interface AppFile {
  id: string;
  name: string;
  size: string;
  url: string;
  authed: string;
}

export interface Session {
  id: string;
  credential: string;
  ip: string;
  expiry: string;
  current: string;
}

export interface AppStats {
  totusers: string;
  totalkeys: string;
  onlineusers: string;
  totalfiles: string;
}

export interface AppDetails {
  name: string;
  ownerid: string;
  secret: string;
  version: string;
}

export interface SubscriptionPlan {
  name: string;
  level: string;
}

export interface Variable {
  varid: string;
  msg: string;
  authed: string;
}

export interface Webhook {
  webid: string;
  baselink: string;
  useragent: string;
  authed: string;
}

export interface Log {
  logid: string;
  date: string;
  data: string;
  credential: string;
  pcuser: string;
}

// Helper function to make API calls through the server-side proxy
async function keyauthRequest<T>(
  sellerKey: string,
  type: string,
  params: Record<string, string | number | boolean> = {}
): Promise<KeyAuthResponse<T>> {
  const searchParams = new URLSearchParams();
  searchParams.set("sellerkey", sellerKey);
  searchParams.set("type", type);

  Object.entries(params).forEach(([key, value]) => {
    searchParams.set(key, String(value));
  });

  const response = await fetch(`${KEYAUTH_API_BASE}?${searchParams.toString()}`);

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body?.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// Application Settings
export async function getAppDetails(sellerKey: string) {
  return keyauthRequest<{ appdetails: AppDetails }>(sellerKey, "appdetails");
}

export async function getStats(sellerKey: string) {
  return keyauthRequest<AppStats>(sellerKey, "stats");
}

export async function pauseApplication(sellerKey: string) {
  return keyauthRequest(sellerKey, "pauseapp");
}

export async function unpauseApplication(sellerKey: string) {
  return keyauthRequest(sellerKey, "unpauseapp");
}

export async function resetHash(sellerKey: string) {
  return keyauthRequest(sellerKey, "resethash");
}

// Licenses
export async function getAllLicenses(sellerKey: string, format = "json") {
  return keyauthRequest<{ keys: License[] }>(sellerKey, "fetchallkeys", { format });
}

export async function createLicense(
  sellerKey: string,
  options: {
    expiry: number;
    mask?: string;
    level?: number;
    amount?: number;
    owner?: string;
    character?: 1 | 2 | 3;
    note?: string;
    format?: string;
  }
) {
  return keyauthRequest<{ key?: string; keys?: string[] }>(sellerKey, "add", {
    expiry: options.expiry,
    mask: options.mask || "******-******-******-******-******-******",
    level: options.level || 1,
    amount: options.amount || 1,
    owner: options.owner || "",
    character: options.character || 2,
    note: options.note || "",
    format: options.format || "json",
  });
}

export async function deleteLicense(sellerKey: string, key: string, userToo = false) {
  return keyauthRequest(sellerKey, "del", { key, userToo: userToo ? 1 : 0 });
}

export async function deleteMultipleLicenses(sellerKey: string, keys: string[]) {
  return keyauthRequest(sellerKey, "delmultiple", { key: keys.join(",") });
}

export async function deleteAllLicenses(sellerKey: string) {
  return keyauthRequest(sellerKey, "delallkeys");
}

export async function deleteAllUsedLicenses(sellerKey: string) {
  return keyauthRequest(sellerKey, "delallusedkeys");
}

export async function deleteAllUnusedLicenses(sellerKey: string) {
  return keyauthRequest(sellerKey, "delallunusedkeys");
}

export async function getLicenseInfo(sellerKey: string, key: string) {
  return keyauthRequest<License>(sellerKey, "info", { key });
}

export async function verifyLicense(sellerKey: string, key: string) {
  return keyauthRequest(sellerKey, "verify", { key });
}

export async function banLicense(sellerKey: string, key: string, reason: string, userToo = false) {
  return keyauthRequest(sellerKey, "ban", { key, reason, userToo: userToo ? 1 : 0 });
}

export async function unbanLicense(sellerKey: string, key: string) {
  return keyauthRequest(sellerKey, "unban", { key });
}

export async function setLicenseNote(sellerKey: string, key: string, note: string) {
  return keyauthRequest(sellerKey, "setnote", { key, note });
}

export async function addTimeToUnusedLicenses(sellerKey: string, time: number) {
  return keyauthRequest(sellerKey, "addtime", { time });
}

// Users
export async function getAllUsers(sellerKey: string) {
  return keyauthRequest<{ users: User[] }>(sellerKey, "fetchallusers");
}

export async function getUserData(sellerKey: string, user: string) {
  return keyauthRequest<User>(sellerKey, "userdata", { user });
}

export async function createUser(
  sellerKey: string,
  options: {
    user: string;
    sub: string;
    expiry: number;
    pass?: string;
  }
) {
  return keyauthRequest(sellerKey, "adduser", {
    user: options.user,
    sub: options.sub,
    expiry: options.expiry,
    pass: options.pass || "",
  });
}

export async function deleteUser(sellerKey: string, user: string) {
  return keyauthRequest(sellerKey, "deluser", { user });
}

export async function deleteAllUsers(sellerKey: string) {
  return keyauthRequest(sellerKey, "delallusers");
}

export async function deleteAllExpiredUsers(sellerKey: string) {
  return keyauthRequest(sellerKey, "delexpusers");
}

export async function banUser(sellerKey: string, user: string, reason: string) {
  return keyauthRequest(sellerKey, "banuser", { user, reason });
}

export async function unbanUser(sellerKey: string, user: string) {
  return keyauthRequest(sellerKey, "unbanuser", { user });
}

export async function pauseUser(sellerKey: string, user: string) {
  return keyauthRequest(sellerKey, "pauseuser", { user });
}

export async function unpauseUser(sellerKey: string, user: string) {
  return keyauthRequest(sellerKey, "unpauseuser", { user });
}

export async function resetUserHwid(sellerKey: string, user: string) {
  return keyauthRequest(sellerKey, "resetuser", { user });
}

export async function resetAllUsersHwid(sellerKey: string) {
  return keyauthRequest(sellerKey, "resetalluser");
}

export async function extendUserExpiration(sellerKey: string, user: string, sub: string, expiry: number) {
  return keyauthRequest(sellerKey, "extend", { user, sub, expiry });
}

export async function subtractUserExpiration(sellerKey: string, user: string, sub: string, expiry: number) {
  return keyauthRequest(sellerKey, "subtract", { user, sub, expiry });
}

export async function changeUserPassword(sellerKey: string, user: string, password: string) {
  return keyauthRequest(sellerKey, "changepass", { user, password });
}

export async function changeUserEmail(sellerKey: string, user: string, email: string) {
  return keyauthRequest(sellerKey, "changeemail", { user, email });
}

export async function changeUsername(sellerKey: string, user: string, newUsername: string) {
  return keyauthRequest(sellerKey, "changeusername", { user, newUsername });
}

export async function addHwidToUser(sellerKey: string, user: string, hwid: string) {
  return keyauthRequest(sellerKey, "addhwid", { user, hwid });
}

export async function getUserLicense(sellerKey: string, user: string) {
  return keyauthRequest<{ key: string }>(sellerKey, "getkey", { user });
}

export async function getAllUsernames(sellerKey: string) {
  return keyauthRequest<{ usernames: string[] }>(sellerKey, "fetchallusernames");
}

export async function deleteUserSubscription(sellerKey: string, user: string, sub: string) {
  return keyauthRequest(sellerKey, "delsub", { user, sub });
}

export async function deleteUserVariable(sellerKey: string, user: string, varName: string) {
  return keyauthRequest(sellerKey, "deluservar", { user, var: varName });
}

export async function getUserVariable(sellerKey: string, user: string, varName: string) {
  return keyauthRequest<{ vardata: string }>(sellerKey, "getuservar", { user, var: varName });
}

export async function setUserVariable(sellerKey: string, user: string, varName: string, varData: string) {
  return keyauthRequest(sellerKey, "setuservar", { user, var: varName, data: varData });
}

export async function getAllUserVariables(sellerKey: string, user: string) {
  return keyauthRequest<{ vars: Variable[] }>(sellerKey, "fetchalluservars", { user });
}

export async function getAllUserSubscriptions(sellerKey: string, user: string) {
  return keyauthRequest<{ subs: Subscription[] }>(sellerKey, "fetchallusersubs", { user });
}

export async function setUserHwidCooldown(sellerKey: string, user: string, cooldown: number) {
  return keyauthRequest(sellerKey, "sethwidcooldown", { user, cooldown });
}

// Subscriptions
export async function getAllSubscriptions(sellerKey: string) {
  return keyauthRequest<{ subscriptions: SubscriptionPlan[] }>(sellerKey, "fetchallsubs");
}

export async function createSubscription(sellerKey: string, name: string, level: number) {
  return keyauthRequest(sellerKey, "addsub", { subname: name, sublevel: level });
}

export async function editSubscription(sellerKey: string, name: string, level: number) {
  return keyauthRequest(sellerKey, "editsub", { subname: name, sublevel: level });
}

export async function deleteSubscription(sellerKey: string, name: string) {
  return keyauthRequest(sellerKey, "delsub", { subname: name });
}

// Sessions
export async function getAllSessions(sellerKey: string) {
  return keyauthRequest<{ sessions: Session[] }>(sellerKey, "fetchallsessions");
}

export async function endSession(sellerKey: string, sessionId: string) {
  return keyauthRequest(sellerKey, "kill", { session: sessionId });
}

export async function endAllSessions(sellerKey: string) {
  return keyauthRequest(sellerKey, "killall");
}

// Files
export async function getAllFiles(sellerKey: string) {
  return keyauthRequest<{ files: AppFile[] }>(sellerKey, "fetchallfiles");
}

export async function getFile(sellerKey: string, fileId: string) {
  return keyauthRequest<{ contents: string }>(sellerKey, "fetchfile", { fileid: fileId });
}

export async function uploadFile(sellerKey: string, url: string, authed = true) {
  return keyauthRequest(sellerKey, "upload", { url, authed: authed ? 1 : 0 });
}

export async function deleteFile(sellerKey: string, fileId: string) {
  return keyauthRequest(sellerKey, "delfile", { fileid: fileId });
}

export async function deleteAllFiles(sellerKey: string) {
  return keyauthRequest(sellerKey, "delallfiles");
}

export async function editFile(sellerKey: string, fileId: string, url: string) {
  return keyauthRequest(sellerKey, "editfile", { fileid: fileId, url });
}

// Variables
export async function getAllVariables(sellerKey: string) {
  return keyauthRequest<{ vars: Variable[] }>(sellerKey, "fetchallvars");
}

export async function getVariable(sellerKey: string, varId: string) {
  return keyauthRequest<{ vardata: string }>(sellerKey, "fetchvar", { varid: varId });
}

export async function createVariable(sellerKey: string, varId: string, varData: string, authed = true) {
  return keyauthRequest(sellerKey, "addvar", { name: varId, data: varData, authed: authed ? 1 : 0 });
}

export async function deleteVariable(sellerKey: string, varId: string) {
  return keyauthRequest(sellerKey, "delvar", { varid: varId });
}

export async function deleteAllVariables(sellerKey: string) {
  return keyauthRequest(sellerKey, "delallvars");
}

export async function editVariable(sellerKey: string, varId: string, varData: string) {
  return keyauthRequest(sellerKey, "editvar", { varid: varId, data: varData });
}

// Webhooks
export async function getAllWebhooks(sellerKey: string) {
  return keyauthRequest<{ webhooks: Webhook[] }>(sellerKey, "fetchallwebhooks");
}

export async function createWebhook(sellerKey: string, baseUrl: string, userAgent: string, authed = true) {
  return keyauthRequest(sellerKey, "addwebhook", { baseurl: baseUrl, ua: userAgent, authed: authed ? 1 : 0 });
}

export async function deleteWebhook(sellerKey: string, webId: string) {
  return keyauthRequest(sellerKey, "delwebhook", { webid: webId });
}

export async function deleteAllWebhooks(sellerKey: string) {
  return keyauthRequest(sellerKey, "delallwebhooks");
}

// Logs
export async function getAllLogs(sellerKey: string) {
  return keyauthRequest<{ logs: Log[] }>(sellerKey, "fetchalllogs");
}

export async function deleteAllLogs(sellerKey: string) {
  return keyauthRequest(sellerKey, "delalllogs");
}

// Blacklists
export async function getAllBlacklists(sellerKey: string) {
  return keyauthRequest<{ blacklists: { hwid?: string; ip?: string; type: string }[] }>(
    sellerKey,
    "fetchallblacklists"
  );
}

export async function createBlacklist(
  sellerKey: string,
  type: "hwid" | "ip",
  data: string,
  blacklistType: "block" | "add"
) {
  return keyauthRequest(sellerKey, "black", { type, data, blacktype: blacklistType });
}

export async function deleteBlacklist(sellerKey: string, data: string, blacklistType: string) {
  return keyauthRequest(sellerKey, "delblack", { data, blacktype: blacklistType });
}

export async function deleteAllBlacklists(sellerKey: string) {
  return keyauthRequest(sellerKey, "delallblacklists");
}

// Aliases used by dashboard pages
export const getBlacklists = getAllBlacklists;
export const getLogs = getAllLogs;
export const getSubscriptions = getAllSubscriptions;

// Redeem a license key via the KeyAuth *user-facing* API (proxied server-side)
// appName must match the KeyAuth application name exactly
export async function redeemLicense(
  appName: string,
  ownerid: string,
  licenseKey: string,
  version = "1.0"
): Promise<{ success: boolean; message: string }> {
  const response = await fetch("/api/keyauth-user", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: "license",
      key: licenseKey,
      name: appName,
      ownerid,
      ver: version,
    }),
  });
  return response.json();
}

// Type aliases used by dashboard pages
export type Blacklist = { hwid?: string; ip?: string; type: string };
export type LogEntry = Log;

// Whitelists
export async function addToWhitelist(sellerKey: string, ip: string) {
  return keyauthRequest(sellerKey, "addwhite", { ip });
}

export async function deleteWhitelist(sellerKey: string, ip: string) {
  return keyauthRequest(sellerKey, "delwhite", { ip });
}

export async function deleteAllWhitelists(sellerKey: string) {
  return keyauthRequest(sellerKey, "delallwhite");
}

// Resellers / Managers
export async function getAllResellers(sellerKey: string) {
  return keyauthRequest<{ accounts: { user: string; role: string; balance: number }[] }>(
    sellerKey,
    "fetchallresellers"
  );
}

export async function getResellerBalance(sellerKey: string, user: string) {
  return keyauthRequest<{ balance: number }>(sellerKey, "getbalance", { user });
}

export async function addResellerBalance(sellerKey: string, user: string, balance: number) {
  return keyauthRequest(sellerKey, "addbalance", { user, balance });
}

export async function createReseller(sellerKey: string, user: string, pass: string, role: "reseller" | "manager") {
  return keyauthRequest(sellerKey, "addaccount", { user, pass, role });
}

export async function deleteReseller(sellerKey: string, user: string) {
  return keyauthRequest(sellerKey, "delaccount", { user });
}

// Web Loader
export async function getAllWebLoaderButtons(sellerKey: string) {
  return keyauthRequest<{
    buttons: { buttonid: string; text: string; value: string; type: string }[];
  }>(sellerKey, "fetchallwebbtn");
}

export async function createWebLoaderButton(
  sellerKey: string,
  text: string,
  value: string,
  type: "file" | "url" | "text"
) {
  return keyauthRequest(sellerKey, "addwebbtn", { text, value, type });
}

export async function deleteWebLoaderButton(sellerKey: string, buttonId: string) {
  return keyauthRequest(sellerKey, "delwebbtn", { buttonid: buttonId });
}

export async function deleteAllWebLoaderButtons(sellerKey: string) {
  return keyauthRequest(sellerKey, "delallwebbtn");
}
