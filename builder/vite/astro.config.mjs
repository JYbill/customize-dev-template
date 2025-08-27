export default defineConfig({
    site: "https://blog.jybill.top",
    vite: {
      build: {
        minify: false, // 禁用压缩
      },

      // SSR相关配置
      ssr: {
        // 外部依赖，由nodejs引入
        external: ["node:fs/promises", "node:path", "node:buffer"],
        // 构建称为SSR页面的内部依赖，由浏览器<script>引入
        noExternal: ["readingTime"],
      },
      plugins: [
        // build产物可视化分析
        visualizer({
          emitFile: true,
          filename: "stats.html",
        }),
      ],
    },

    // 集成插件
    integrations: [tailwind(), react(), mdx(), sitemap()],

    // CSS作用域策略
    scopedStyleStrategy: "class",

    // md插件配置
    markdown: {
      syntaxHighlight: false,
      extendDefaultPlugins: true,
      rehypePlugins: [
        [rehypePrettyCode, prettyCodeOptions],
        rehypeSlug,
        [
          rehypeAutolinkHeadings,
          {
            properties: {
              className: ["anchor"],
            },
          },
        ],
      ],
      shikiConfig: {
        // @ts-ignore
        theme,
      },
    },
  
    // SSG优先
    output: "static",

    // cloudflare适配器配置
    adapter: cloudflare({
      imageService: "cloudflare",
      platformProxy: {
        enabled: true,
        configPath: "wrangler.json",
        experimentalRegistry: false,
        persist: {
          path: ".cache/v3",
        },
      },
    }),
  });