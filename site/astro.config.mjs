import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// GitHub Pages 项目站：https://cionhuang.github.io/A_Brief_Tutorial_of_Humanoid_Robot/
export default defineConfig({
  site: 'https://cionhuang.github.io',
  base: '/A_Brief_Tutorial_of_Humanoid_Robot',
  integrations: [
    starlight({
      title: '《“听懂”具身智能——以人形机器人为例》',
      locales: {
        root: {
          label: '简体中文',
          lang: 'zh-CN',
        },
      },
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/cionHuang/A_Brief_Tutorial_of_Humanoid_Robot',
        },
      ],
      sidebar: [
        { label: '系统总览', items: [{ autogenerate: { directory: '01-system-overview' } }] },
        { label: '机械', items: [{ autogenerate: { directory: '02-mechanics' } }] },
        { label: '电气与嵌入式', items: [{ autogenerate: { directory: '03-electrical-embedded' } }] },
        { label: '算法与软件', items: [{ autogenerate: { directory: '04-algorithms-software' } }] },
        { label: '感知、Manipulation 与 VLA', items: [{ autogenerate: { directory: '05-perception-manipulation-vla' } }] },
        { label: '仿真、工具与系统集成', items: [{ autogenerate: { directory: '06-simulation-tools-integration' } }] },
        { label: '工程实践与安全', items: [{ autogenerate: { directory: '07-engineering-practice-safety' } }] },
      ],
      tableOfContents: { minHeadingLevel: 2, maxHeadingLevel: 3 },
      pagination: true,
    }),
  ],
});
