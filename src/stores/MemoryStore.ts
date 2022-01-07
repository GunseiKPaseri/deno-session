import { SessionStore } from "../sessions.ts";

export class MemoryStore<SessionData> implements SessionStore<SessionData>{
    #data:Map<string, SessionData> = new Map();
    constructor() {
  
    }
    sessionExists(sessionId:string) {
      return this.#data.has(sessionId)
    }
  
    getSessionById(sessionId:string) {
      const got = this.#data.get(sessionId);
      return Promise.resolve(got ? got : null);
    }
  
    createSession(sessionId:string, initialSessionData: SessionData) {
      this.#data.set(sessionId, initialSessionData);
      return Promise.resolve(initialSessionData);
    }
  
    persistSessionData(sessionId:string, sessionData: SessionData) {
      return new Promise<void>((resolve) => {
        this.#data.set(sessionId, sessionData)
        resolve();
      });
    }
  
    deleteSession(sessionId: string) {
      return Promise.resolve(this.#data.delete(sessionId));
    }
  }
  