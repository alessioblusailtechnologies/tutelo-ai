export interface FetchedEmail {
  externalId: string;
  from: string;
  fromEmail: string;
  subject: string;
  body: string;
  receivedAt: string; // ISO string
}

export interface EmailFetchResult {
  emails: FetchedEmail[];
  newAccessToken?: string; // if token was refreshed
}
