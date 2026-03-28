// @ts-nocheck
import { default as __fd_glob_4 } from "../content/docs/guides/meta.json?collection=meta"
import { default as __fd_glob_3 } from "../content/docs/getting-started/meta.json?collection=meta"
import * as __fd_glob_2 from "../content/docs/guides/advanced-usage.mdx?collection=docs"
import * as __fd_glob_1 from "../content/docs/getting-started/installation.mdx?collection=docs"
import * as __fd_glob_0 from "../content/docs/getting-started/index.mdx?collection=docs"
import { server } from 'fumadocs-mdx/runtime/server';
import type * as Config from '../source.config';

const create = server<typeof Config, import("fumadocs-mdx/runtime/types").InternalTypeConfig & {
  DocData: {
  }
}>({"doc":{"passthroughs":["extractedReferences"]}});

export const docs = await create.doc("docs", "content/docs", {"getting-started/index.mdx": __fd_glob_0, "getting-started/installation.mdx": __fd_glob_1, "guides/advanced-usage.mdx": __fd_glob_2, });

export const meta = await create.meta("meta", "content/docs", {"getting-started/meta.json": __fd_glob_3, "guides/meta.json": __fd_glob_4, });