import fastify, { FastifyInstance, RouteShorthandOptions } from "fastify";
import { Server, IncomingMessage, ServerResponse } from "http";
import urlRegex from "url-regex-safe";
import { createClient } from "redis";
import cors from "fastify-cors";

const server: FastifyInstance<Server, IncomingMessage, ServerResponse> =
  fastify({ logger: true });
const client = createClient();

server.register(cors);

interface SetBody {
  url: string;
}

const opts: RouteShorthandOptions = {
  schema: {
    body: {
      type: "object",
      properties: {
        url: {
          type: "string",
        },
      },
    },
  },
};

server.post<{
  Body: SetBody;
}>("/set", opts, async (req, res) => {
  console.log(req.body);
  if (!req.body.url.match(urlRegex({ exact: true }))) {
    res.code(400).send({ error: "Invalid URL" });
  }
  console.log(req.body.url);
  await client.set(req.ip, req.body.url);

  res.code(200).send({ message: "ok" });
});

server.get<{}>("/get", async (req, res) => {
  const url = await client.get(req.ip);
  console.log(url, typeof url);

  if (!url) {
    res.code(404).send({ error: "No URL found" });
  }

  res.code(200).send({ url });
});

server.listen(8080, async (err, address) => {
  if (err) console.error(err);

  await client.connect();
});
