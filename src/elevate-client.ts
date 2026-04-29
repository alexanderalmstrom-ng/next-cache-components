import type {
  Config,
  Session,
  SessionMetadata,
  Touchpoint,
} from "@apptus/esales-api";
import { elevate } from "@apptus/esales-api";
import { env } from "~/env";

type ElevateSessionInput = Session | SessionMetadata;

type ElevateClientOptions = {
  clusterId?: string;
  locale?: string;
  market?: string;
  session: ElevateSessionInput;
  touchpoint?: Touchpoint;
};

function createElevateSession(session: ElevateSessionInput): Session {
  if (typeof session === "function") {
    return session;
  }

  return () => session;
}

function getElevateConfig(options: ElevateClientOptions): Config {
  return {
    clusterId: options.clusterId ?? env.VOYADO_ELEVATE_CLUSTER_ID,
    market: options.market ?? env.VOYADO_ELEVATE_MARKET,
    locale: options.locale ?? env.VOYADO_ELEVATE_LOCALE,
    touchpoint: options.touchpoint ?? env.VOYADO_ELEVATE_TOUCHPOINT,
    session: createElevateSession(options.session),
  };
}

export function createElevateClient(options: ElevateClientOptions) {
  return elevate(getElevateConfig(options));
}

export const elevateClient = {
  create: createElevateClient,
};

export type { ElevateClientOptions, ElevateSessionInput };
