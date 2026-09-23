import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { unified } from '@astrojs/markdown-remark';

// GitHub Pages 项目站：https://cionhuang.github.io/A_Brief_Tutorial_of_Humanoid_Robot/
const siteBase = '/A_Brief_Tutorial_of_Humanoid_Robot';
const redirectTo = (path) => `${siteBase}${path}`;
const chapterRedirects = {
  '/04-algorithms-software': redirectTo('/04-cerebellum-realtime-control/01-robot-mathematics-foundations'),
  '/04-algorithms-software/01-robot-mathematics-foundations': redirectTo('/04-cerebellum-realtime-control/01-robot-mathematics-foundations'),
  '/04-algorithms-software/02-kinematics': redirectTo('/04-cerebellum-realtime-control/02-kinematics'),
  '/04-algorithms-software/03-dynamics': redirectTo('/04-cerebellum-realtime-control/03-dynamics'),
  '/04-algorithms-software/04-state-estimation': redirectTo('/04-cerebellum-realtime-control/04-state-estimation'),
  '/04-algorithms-software/05-basic-control': redirectTo('/04-cerebellum-realtime-control/05-basic-control'),
  '/04-algorithms-software/06-balance-and-whole-body-control': redirectTo('/04-cerebellum-realtime-control/06-balance-and-whole-body-control'),
  '/04-algorithms-software/07-motion-planning': redirectTo('/05-brain-perception-planning-vla-wam/03-motion-planning'),
  '/04-algorithms-software/08-ros2-software-architecture': redirectTo('/06-software-tools-simulation/01-ros2-software-architecture'),
  '/05-perception-manipulation-vla': redirectTo('/05-brain-perception-planning-vla-wam/02-perception-system'),
  '/05-perception-manipulation-vla/01-perception-system': redirectTo('/05-brain-perception-planning-vla-wam/02-perception-system'),
  '/05-perception-manipulation-vla/02-dual-arm-manipulation-and-dexterous-hands': redirectTo('/05-brain-perception-planning-vla-wam/04-dual-arm-manipulation-and-dexterous-hands'),
  '/05-perception-manipulation-vla/03-learning-control-and-imitation-learning': redirectTo('/05-brain-perception-planning-vla-wam/05-learning-control-and-imitation-learning'),
  '/05-perception-manipulation-vla/04-vla-and-advanced-ai': redirectTo('/05-brain-perception-planning-vla-wam/06-vla-and-advanced-ai'),
  '/06-simulation-tools-integration': redirectTo('/06-software-tools-simulation/01-ros2-software-architecture'),
  '/06-simulation-tools-integration/01-mujoco': redirectTo('/06-software-tools-simulation/02-mujoco'),
  '/06-simulation-tools-integration/02-isaac-sim-isaac-lab': redirectTo('/06-software-tools-simulation/03-isaac-sim-isaac-lab'),
  '/06-simulation-tools-integration/03-gazebo-rviz2-foxglove': redirectTo('/06-software-tools-simulation/04-gazebo-rviz2-foxglove'),
  '/06-simulation-tools-integration/04-kinematics-dynamics-libraries': redirectTo('/06-software-tools-simulation/05-kinematics-dynamics-libraries'),
  // 第五章插入 5.1 后，原 5.1–5.6 顺延为 5.2–5.7：旧小节 URL 重定向到新路径（原 5.7 对应的“到 G1 控制接口”一节已删除）
  '/05-brain-perception-planning-vla-wam/01-perception-system': redirectTo('/05-brain-perception-planning-vla-wam/02-perception-system'),
  '/05-brain-perception-planning-vla-wam/02-motion-planning': redirectTo('/05-brain-perception-planning-vla-wam/03-motion-planning'),
  '/05-brain-perception-planning-vla-wam/03-dual-arm-manipulation-and-dexterous-hands': redirectTo('/05-brain-perception-planning-vla-wam/04-dual-arm-manipulation-and-dexterous-hands'),
  '/05-brain-perception-planning-vla-wam/04-learning-control-and-imitation-learning': redirectTo('/05-brain-perception-planning-vla-wam/05-learning-control-and-imitation-learning'),
  '/05-brain-perception-planning-vla-wam/05-vla-and-advanced-ai': redirectTo('/05-brain-perception-planning-vla-wam/06-vla-and-advanced-ai'),
  '/05-brain-perception-planning-vla-wam/06-wam-world-action-model': redirectTo('/05-brain-perception-planning-vla-wam/07-wam-world-action-model'),
  // 第一章由 4 节收敛为 3 节：原 1.4 的内容并入 1.3，旧 URL 重定向
  '/01-system-overview/04-from-task-to-motor': redirectTo('/01-system-overview/03-humanoid-robot-system-architecture'),
};

// 审阅模式的页面辅助：hover 段落显示源文件行号，点击复制
const REVIEW = !!process.env.REVIEW;
const reviewHead = REVIEW
  ? [
      {
        tag: 'style',
        content:
          '.srcline{display:block;height:0;overflow:hidden}' +
          '.srcline-badge{position:fixed;top:.5rem;right:.75rem;z-index:60;font-size:12px;padding:3px 8px;border-radius:999px;background:var(--sl-color-accent-low);color:var(--sl-color-accent-high);opacity:.85;pointer-events:none}' +
          '.srcline-chip{position:fixed;bottom:1rem;right:1rem;z-index:60;font-family:var(--sl-font-mono,monospace);font-size:12px;padding:6px 10px;border-radius:6px;background:var(--sl-color-bg-nav);border:1px solid var(--sl-color-gray-5);color:var(--sl-color-text);cursor:pointer;box-shadow:0 4px 14px rgba(0,0,0,.25)}',
      },
      {
        tag: 'script',
        content:
          '(function(){' +
          'function ready(f){if(document.readyState!=="loading")f();else document.addEventListener("DOMContentLoaded",f)}' +
          'ready(function(){' +
          'var chip=document.createElement("div");chip.className="srcline-chip";chip.hidden=true;document.body.appendChild(chip);' +
          'var badge=document.createElement("div");badge.className="srcline-badge";badge.textContent="审阅模式 · hover 段落看源行号";document.body.appendChild(badge);' +
          'var cur=null;' +
          'function anchorFor(el){var n=el;while(n&&n!==document.body){var p=n.previousElementSibling;while(p){if(p.classList&&p.classList.contains("srcline"))return p;p=p.previousElementSibling}n=n.parentElement}return null}' +
          'var srcMap=null,srcLoading=false;' +
                    'function norm(s){s=s||"";s=s.replace(/Section titled[^”]*”/g,"");' +
          'var i=s.indexOf("](");while(i>=0){var j=s.lastIndexOf("[",i);var k=s.indexOf(")",i);if(j<0||k<0){break}s=s.slice(0,j)+s.slice(j+1,i)+s.slice(k+1);i=s.indexOf("](",j)}' +
          'return s.replace(/[*`]/g,"").replace(/\\s+/g,"")}' +
          'function lookupByText(el){' +
          'if(!srcMap){if(!srcLoading){srcLoading=true;fetch("/A_Brief_Tutorial_of_Humanoid_Robot/__review-sources.json").then(function(r){return r.json()}).then(function(j){srcMap=j}).catch(function(){srcMap={}})}return null}' +
          'var raw=(el.textContent||"").replace(/Section titled[^”]*”/g,"");' +
          'var parts=raw.split("\\n").map(norm).filter(function(x){return x.length>=6});parts.push(norm(raw));' +
          'var lens=[24,16,12,8,6];' +
          'for(var pi=0;pi<parts.length;pi++){var full=parts[pi];' +
          'for(var L=0;L<lens.length;L++){var needle=full.slice(0,lens[L]);if(needle.length<6)break;' +
          'for(var f in srcMap){var lines=srcMap[f];for(var i=0;i<lines.length;i++){if(norm(lines[i]).indexOf(needle)>=0)return f+":"+(i+1)}}}}return null}' +
          'function resolve(el){var a=anchorFor(el);if(a)return a.getAttribute("data-src");return lookupByText(el)}' +
          'document.addEventListener("mouseover",function(e){var el=e.target.closest&&e.target.closest("p,h2,h3,h4,li,td,blockquote");if(!el){chip.hidden=true;return}var src=resolve(el);if(!src){chip.hidden=true;return}cur=src;chip.textContent=cur+"　（点击复制）";chip.hidden=false},true);' +
          'chip.addEventListener("click",function(){if(!cur)return;navigator.clipboard.writeText(cur).then(function(){chip.textContent="已复制："+cur;setTimeout(function(){chip.hidden=true},1200)})});' +
          '});})();',
      },
    ]
  : [];

export default defineConfig({
  site: 'https://cionhuang.github.io',
  base: siteBase,
  redirects: chapterRedirects,
  markdown: {
    processor: unified({
      remarkPlugins: [remarkMath],
      rehypePlugins: [rehypeKatex],
    }),
  },
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
        { label: '从这里开始', items: [{ autogenerate: { directory: '00-reading-guides' } }] },
        { label: '第 1 章 系统总览', items: [{ autogenerate: { directory: '01-system-overview' } }] },
        { label: '第 2 章 机械与本体', items: [{ autogenerate: { directory: '02-mechanics' } }] },
        { label: '第 3 章 电气与嵌入式', items: [{ autogenerate: { directory: '03-electrical-embedded' } }] },
        { label: '第 4 章 小脑：模型、状态估计与实时运控', items: [{ autogenerate: { directory: '04-cerebellum-realtime-control' } }] },
        { label: '第 5 章 大脑：感知、规划、VLA 与 WAM', items: [{ autogenerate: { directory: '05-brain-perception-planning-vla-wam' } }] },
        { label: '第 6 章 软件与工具链', items: [{ autogenerate: { directory: '06-software-tools-simulation' } }] },
        { label: '附录', items: [{ autogenerate: { directory: '07-appendix' } }] },
      ],
      tableOfContents: { minHeadingLevel: 2, maxHeadingLevel: 3 },
      pagination: true,
      customCss: ['./src/styles/custom.css'],
      head: reviewHead,
    }),
  ],
});
