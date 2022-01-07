import { Cookie } from "../dep.ts";
import { MemoryStore } from "./stores/MemoryStore.ts";

type nullable<X> = X | null;

// refer to https://deno.land/std@0.120.0/http/cookie.ts
interface CookieOptions{
  /** Expiration date of the cookie. */
  expires?: Date;
  /** Max-Age of the Cookie. Max-Age must be an integer superior or equal to 0. */
  maxAge?: number;
  /** Specifies those hosts to which the cookie will be sent. */
  domain?: string;
  /** Indicates a URL path that must exist in the request. */
  path?: string;
  /** Indicates if the cookie is made using SSL & HTTPS. */
  secure?: boolean;
  /** Indicates that cookie is not accessible via JavaScript. */
  httpOnly?: boolean;
  /**
   * Allows servers to assert that a cookie ought not to
   * be sent along with cross-site requests.
   */
  sameSite?: "Strict" | "Lax" | "None";
}

const genCookie = (name: string, value: string, option: CookieOptions):Cookie => {
  return {name, value, ...option};
}


export class Session<SessionData>{
  readonly id;
  readonly option;

  #sessionData;
  #cookieOption: CookieOptions;
  constructor(id: string, sessionData:SessionData, option: SessionOptions<SessionData>){
    this.id = id;
    this.#sessionData = sessionData;
    this.option = option;
    this.#cookieOption = {...option.cookie};
  }
  get data(): SessionData {
    return this.#sessionData;
  }
  get cookie(): Cookie{
    return genCookie(this.option.name, this.id, this.#cookieOption);
  }

  async save(sessionData: SessionData){
    await this.option.store.persistSessionData(this.id, sessionData);
    this.#sessionData = sessionData;
  }
  async delete(){
    await this.option.store.deleteSession(this.id);
  }
}

export interface SessionStore<SessionData>{
  sessionExists(sessionId: string) : Promise<boolean> | boolean;
  getSessionById(sessionId: string) : Promise<nullable<SessionData>>;
  createSession(sessionId: string, initialSessionData: SessionData) : Promise<SessionData>;
  persistSessionData(sessionId:string, sessionData:SessionData):Promise<void>;
  deleteSession(sessionId: string) : Promise<boolean>;
}


/**
 * session middleware's option
 */
export interface SessionOptions<SessionData>{
  name :string,
  store: SessionStore<SessionData>,
  cookie: CookieOptions,
  genid: () => string,
}

/**
 * session middleware's default settings
 */
export const genOptionDefault = <SessionData>():SessionOptions<SessionData> => {
  return {
    name: 'connect.sid',
    store: new MemoryStore<SessionData>(),
    cookie: { path: '/', httpOnly: false, secure: false },
    genid: () => crypto.randomUUID(),
  };
}

