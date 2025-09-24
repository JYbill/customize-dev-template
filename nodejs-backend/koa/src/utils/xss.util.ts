import * as xss from "xss";

import { config } from "#config";

const { whiteList } = config.xss;

const filterXSS = new xss.FilterXSS({ whiteList });

const xssProcess = (s: string) => filterXSS.process(s);

export { xssProcess };
