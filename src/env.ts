import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

const requiredString = z.string().min(1);
const elevateTouchpointSchema = z.enum(["desktop", "mobile"]);

export const env = createEnv({
  server: {
    CONTENTFUL_ACCESS_TOKEN: requiredString,
    CONTENTFUL_ENVIRONMENT: requiredString.default("master"),
    CONTENTFUL_PREVIEW_ACCESS_TOKEN: requiredString.optional(),
    CONTENTFUL_SPACE_ID: requiredString,
    VOYADO_ELEVATE_CLUSTER_ID: requiredString,
    VOYADO_ELEVATE_LOCALE: requiredString,
    VOYADO_ELEVATE_MARKET: requiredString,
    VOYADO_ELEVATE_TOUCHPOINT: elevateTouchpointSchema.default("desktop"),
  },
  experimental__runtimeEnv: process.env,
});
