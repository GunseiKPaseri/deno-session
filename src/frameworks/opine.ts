import { OpineResponse, OpineRequest, NextFunction, Handler, ParamsDictionary, Params } from "../../dep.ts";
import { Session, SessionOptions, genOptionDefault } from "../sessions.ts";
import { getCookies } from "../../dep.ts";

export interface OpineRequestWithSession<SessionData,P extends Params = ParamsDictionary, ResBody = any, ReqQuery = any> extends OpineRequest<P,ResBody,ReqQuery> {
  session?: Session<SessionData>,
}

/**
 * opine's middleware to use session
 */
export function opineSessionMiddleware<SessionData>(initialSessionData: SessionData, options: Partial<SessionOptions<SessionData>> = {}): Handler{
  
  const op:SessionOptions<SessionData> = {...genOptionDefault<SessionData>(), ...options};

  return async (req: OpineRequest, res: OpineResponse<any>, next: NextFunction) => {
    // If you're using 'https', you should set the 'Secure' attribute.
    if(options.cookie?.secure === undefined){
      op.cookie.httpOnly = req.protocol === "https";
    }else{
      op.cookie.httpOnly = options.cookie?.secure;
    }
    
    const cookies = getCookies(req.headers);
    const sid = cookies[op.name];

    if (sid !== "" && await op.store.sessionExists(sid)) {
      // There is session
      const gotSession = (await op.store.getSessionById(sid))!;
      const session = new Session<SessionData>(sid, gotSession, op);

      Object.defineProperty(req, 'session', {value: session , writable: false});
      setSessionOpine<SessionData>(res, session);
    } else {
      // There is no session
      const newssid = op.genid();
      const createdSession = await op.store.createSession(newssid, initialSessionData);
      const session = new Session<SessionData>(newssid, createdSession, op);
      Object.defineProperty(req, 'session', {value: session, writable: false});
      setSessionOpine<SessionData>(res, session);
    }
    next();
  };
}

export function setSessionOpine<SessionData>(res: OpineResponse, session: Session<SessionData>) {
  res.cookie(session.option.name, session.id, session.cookie)
}
