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
interface IpHeaders {
  "x-forwarded-for"?: string;
  "x-real-ip"?: string;
  "x-forwarded-proto"?: string;
  "x-forwarded-port"?: string;
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
    headers: {
      type: "object",
      properties: {
        "x-real-ip": {
          type: "string",
        },
      },
    },
  },
};

server.post<{
  Body: SetBody;
  Headers: IpHeaders;
}>("/set", opts, async (req, res) => {
  console.log(req.body);
  if (!req.body.url.match(urlRegex({ exact: true }))) {
    res.code(400).send({ error: "Invalid URL" });
  }

  console.log(req.headers["x-real-ip"]);
  if (!req.headers["x-real-ip"])
    return res.code(400).send({ error: "Invalid IP" });

  await client.set(
    req.headers["x-real-ip"],
    req.body.url.startsWith("http") ? req.body.url : "https://" + req.body.url
  );

  res.code(200).send({ message: "ok" });
});

server.get<{ Headers: IpHeaders }>("/get", async (req, res) => {
  if (!req.headers["x-real-ip"])
    return res.code(400).send({ error: "Invalid IP" });

  const url = await client.get(req.headers["x-real-ip"]);
  console.log(url, typeof url);

  if (!url) {
    res.code(404).send({ error: "No URL found" });
  }

  res.code(200).send({ url });
});

server.listen(8080, "0.0.0.0", async (err, address) => {
  if (err) console.error(err);

  await client.connect();
});
