import Fastify, {
  type FastifyInstance,
  type FastifyReply,
  type FastifyRequest
} from "fastify";
import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import { createDatabase, createPool, type AppDatabase } from "./db/client.js";
import { getEnv, type AppEnv } from "./config/env.js";
import { conditions, moods, temperatureBands, type Mood } from "./config/constants.js";
import { AppError } from "./utils/errors.js";
import { hashPassword, verifyPassword } from "./auth/password.js";
import {
  createUser,
  deleteSavedOutfit,
  findUserByEmail,
  findUserById,
  getRecommendations,
  listSavedOutfits,
  saveOutfit,
  type SavePayload
} from "./services/recommendations.js";
import { resolveGeoWeather, resolveManualWeather } from "./services/weather.js";

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: { sub: string; email: string };
    user: { sub: string; email: string };
  }
}

type BuildAppOptions = {
  env?: AppEnv;
  db?: AppDatabase;
};

type LoginBody = {
  email: string;
  password: string;
};

type ManualRecommendationBody = {
  mood: Mood;
  weather: {
    source: "manual";
    temperatureC: number;
    condition: (typeof conditions)[number];
  };
};

type GeoRecommendationBody = {
  mood: Mood;
  weather: {
    source: "geo";
    latitude: number;
    longitude: number;
  };
};

function validationFieldErrors(
  issues: Array<{ instancePath?: string; message?: string; params?: { missingProperty?: string } }>
) {
  return Object.fromEntries(
    issues.map((issue) => {
      const instancePath = issue.instancePath?.replace(/^\//, "");
      const missingProperty = issue.params?.missingProperty;
      const key = instancePath || missingProperty || "body";
      return [key, issue.message || "Invalid value."];
    })
  );
}

async function requireAuth(request: FastifyRequest) {
  try {
    await request.jwtVerify();
    return request.user.sub;
  } catch {
    throw new AppError(401, "UNAUTHORIZED", "Please log in to save and view outfits.");
  }
}

export async function buildApp(options: BuildAppOptions = {}): Promise<FastifyInstance> {
  const env = options.env ?? getEnv();
  const pool = options.db ? undefined : createPool(env.databaseUrl);
  const db = options.db ?? createDatabase(pool!);

  const app = Fastify();

  await app.register(cors, {
    origin: env.frontendOrigin,
    credentials: true
  });
  await app.register(cookie, {
    secret: env.cookieSecret
  });
  await app.register(jwt, {
    secret: env.jwtSecret,
    cookie: {
      cookieName: "session",
      signed: false
    }
  });

  app.addHook("onClose", async () => {
    if (pool) {
      await pool.end();
    }
  });

  app.setErrorHandler((error, _request, reply) => {
    const validationError = error as {
      validation?: Array<{ instancePath?: string; message?: string; params?: { missingProperty?: string } }>;
    };

    if (validationError.validation) {
      reply.status(400).send({
        error: {
          code: "INVALID_INPUT",
          message: "Please review the highlighted fields.",
          fieldErrors: validationFieldErrors(validationError.validation)
        }
      });
      return;
    }

    if (error instanceof AppError) {
      reply.status(error.statusCode).send({
        error: {
          code: error.code,
          message: error.message,
          fieldErrors: error.fieldErrors
        }
      });
      return;
    }

    reply.status(500).send({
      error: {
        code: "INTERNAL_ERROR",
        message: "Something went wrong on our side."
      }
    });
  });

  app.get("/health", async () => ({ status: "ok" }));

  app.get("/api/auth/me", async (request) => {
    const userId = await requireAuth(request);
    const user = await findUserById(db, userId);
    if (!user) {
      throw new AppError(401, "UNAUTHORIZED", "Please log in again.");
    }

    return { user: { id: user.id, email: user.email } };
  });

  const authSchema = {
    body: {
      type: "object",
      required: ["email", "password"],
      properties: {
        email: { type: "string", format: "email" },
        password: { type: "string", minLength: 8 }
      }
    }
  };

  const setSessionCookie = async (
    reply: FastifyReply,
    user: { id: string; email: string }
  ) => {
    const token = await reply.jwtSign({ sub: user.id, email: user.email });
    reply.setCookie("session", token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: env.nodeEnv === "production"
    });
  };

  app.post<{ Body: LoginBody }>("/api/auth/register", { schema: authSchema }, async (request, reply) => {
    const passwordHash = await hashPassword(request.body.password);
    const user = await createUser(db, request.body.email, passwordHash);
    await setSessionCookie(reply, user);
    return { user };
  });

  app.post<{ Body: LoginBody }>("/api/auth/login", { schema: authSchema }, async (request, reply) => {
    const user = await findUserByEmail(db, request.body.email);
    if (!user) {
      throw new AppError(401, "INVALID_CREDENTIALS", "That email or password did not match.");
    }

    const matches = await verifyPassword(request.body.password, user.passwordHash);
    if (!matches) {
      throw new AppError(401, "INVALID_CREDENTIALS", "That email or password did not match.");
    }

    await setSessionCookie(reply, { id: user.id, email: user.email });
    return { user: { id: user.id, email: user.email } };
  });

  app.post("/api/auth/logout", async (_request, reply) => {
    reply.clearCookie("session", { path: "/" });
    return { ok: true };
  });

  app.post<{ Body: ManualRecommendationBody | GeoRecommendationBody }>(
    "/api/recommendations",
    {
      schema: {
        body: {
          oneOf: [
            {
              type: "object",
              required: ["mood", "weather"],
              properties: {
                mood: { type: "string", enum: [...moods] },
                weather: {
                  type: "object",
                  required: ["source", "temperatureC", "condition"],
                  properties: {
                    source: { type: "string", const: "manual" },
                    temperatureC: { type: "number", minimum: -50, maximum: 60 },
                    condition: { type: "string", enum: [...conditions] }
                  }
                }
              }
            },
            {
              type: "object",
              required: ["mood", "weather"],
              properties: {
                mood: { type: "string", enum: [...moods] },
                weather: {
                  type: "object",
                  required: ["source", "latitude", "longitude"],
                  properties: {
                    source: { type: "string", const: "geo" },
                    latitude: { type: "number", minimum: -90, maximum: 90 },
                    longitude: { type: "number", minimum: -180, maximum: 180 }
                  }
                }
              }
            }
          ]
        }
      }
    },
    async (request) => {
      const body = request.body;
      const resolvedWeather =
        body.weather.source === "manual"
          ? resolveManualWeather(body.weather.temperatureC, body.weather.condition)
          : await resolveGeoWeather(body.weather.latitude, body.weather.longitude);

      const suggestions = await getRecommendations(db, body.mood, resolvedWeather);

      return {
        weatherSummary: {
          source: resolvedWeather.source,
          temperatureC: resolvedWeather.temperatureC,
          condition: resolvedWeather.condition,
          tempBand: resolvedWeather.tempBand,
          summary: resolvedWeather.summary
        },
        suggestions
      };
    }
  );

  app.get("/api/saved-outfits", async (request) => {
    const userId = await requireAuth(request);
    const saved = await listSavedOutfits(db, userId);
    return { savedOutfits: saved };
  });

  app.post<{ Body: SavePayload }>(
    "/api/saved-outfits",
    {
      schema: {
        body: {
          type: "object",
          required: [
            "outfitTemplateId",
            "mood",
            "resolvedCondition",
            "resolvedTempBand",
            "resolvedTemperatureC",
            "weatherSummary",
            "title",
            "practicalNote",
            "paletteSnapshot",
            "itemsSnapshot"
          ],
          properties: {
            outfitTemplateId: { type: "string", minLength: 1 },
            mood: { type: "string", enum: [...moods] },
            resolvedCondition: { type: "string", enum: [...conditions] },
            resolvedTempBand: { type: "string", enum: [...temperatureBands] },
            resolvedTemperatureC: { type: "number" },
            weatherSummary: { type: "string", minLength: 1 },
            title: { type: "string", minLength: 1 },
            practicalNote: { type: "string", minLength: 1 },
            paletteSnapshot: {
              type: "array",
              minItems: 1,
              items: { type: "string" }
            },
            itemsSnapshot: {
              type: "array",
              minItems: 1,
              items: {
                type: "object",
                required: ["category", "name", "color"],
                properties: {
                  category: { type: "string", minLength: 1 },
                  name: { type: "string", minLength: 1 },
                  color: { type: "string", minLength: 1 }
                }
              }
            }
          }
        }
      }
    },
    async (request) => {
      const userId = await requireAuth(request);
      const savedOutfit = await saveOutfit(db, userId, request.body);
      return { savedOutfit };
    }
  );

  app.delete<{ Params: { id: string } }>(
    "/api/saved-outfits/:id",
    {
      schema: {
        params: {
          type: "object",
          required: ["id"],
          properties: {
            id: { type: "string", minLength: 1 }
          }
        }
      }
    },
    async (request) => {
      const userId = await requireAuth(request);
      await deleteSavedOutfit(db, userId, request.params.id);
      return { ok: true };
    }
  );

  return app;
}
