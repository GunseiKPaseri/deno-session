import { opineSessionMiddleware, OpineRequestWithSession } from '../mod.ts';
import {
  opine,
} from "../dep.ts";

const app = opine();

interface sd {
  count: number;
}

app.use(opineSessionMiddleware<sd>({count: 0}));

app.get("/", (req: OpineRequestWithSession<sd>, res) => {
  if(!req.session) return res.send(`there is no session`);
  req.session.save({count: req.session.data.count + 1});
  res.send(`you may reload.<br>session: ${JSON.stringify(req.session)} <br>sessionstate: ${JSON.stringify(req.session.data)}`);
});

app.get("/deletesession", async (req: OpineRequestWithSession<sd>, res) => {
  if(!req.session) return res.send(`there is no session`);
 
  await req.session.delete();
 
  res.send(`you may reload.<br>`);
});

const PORT = 3005;
app.listen(
  PORT,
  () => console.log(`server has started on http://localhost:${PORT} 🚀`),
);