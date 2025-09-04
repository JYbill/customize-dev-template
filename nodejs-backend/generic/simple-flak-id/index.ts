import flakeId from "simple-flakeid";

import { config } from "#config";

const generator = new flakeId.SnowflakeIdv1({ workerId: config.simpleFlake.FLAKE_WORK_ID });
export default generator;
