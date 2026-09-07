import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

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
  '/04-algorithms-software/07-motion-planning': redirectTo('/05-brain-perception-planning-vla-wam/02-motion-planning'),
  '/04-algorithms-software/08-ros2-software-architecture': redirectTo('/06-software-tools-simulation/01-ros2-software-architecture'),
  '/05-perception-manipulation-vla': redirectTo('/05-brain-perception-planning-vla-wam/01-perception-system'),
  '/05-perception-manipulation-vla/01-perception-system': redirectTo('/05-brain-perception-planning-vla-wam/01-perception-system'),
  '/05-perception-manipulation-vla/02-dual-arm-manipulation-and-dexterous-hands': redirectTo('/05-brain-perception-planning-vla-wam/03-dual-arm-manipulation-and-dexterous-hands'),
  '/05-perception-manipulation-vla/03-learning-control-and-imitation-learning': redirectTo('/05-brain-perception-planning-vla-wam/04-learning-control-and-imitation-learning'),
  '/05-perception-manipulation-vla/04-vla-and-advanced-ai': redirectTo('/05-brain-perception-planning-vla-wam/05-vla-and-advanced-ai'),
  '/06-simulation-tools-integration': redirectTo('/06-software-tools-simulation/01-ros2-software-architecture'),
  '/06-simulation-tools-integration/01-mujoco': redirectTo('/06-software-tools-simulation/02-mujoco'),
  '/06-simulation-tools-integration/02-isaac-sim-isaac-lab': redirectTo('/06-software-tools-simulation/03-isaac-sim-isaac-lab'),
  '/06-simulation-tools-integration/03-gazebo-rviz2-foxglove': redirectTo('/06-software-tools-simulation/04-gazebo-rviz2-foxglove'),
  '/06-simulation-tools-integration/04-kinematics-dynamics-libraries': redirectTo('/06-software-tools-simulation/05-kinematics-dynamics-libraries'),
  '/06-simulation-tools-integration/05-sim-to-real': redirectTo('/06-software-tools-simulation/06-sim-to-real'),
};

export default defineConfig({
  site: 'https://cionhuang.github.io',
  base: siteBase,
  redirects: chapterRedirects,
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
        { label: '系统总览', items: [{ autogenerate: { directory: '01-system-overview' } }] },
        { label: '机械', items: [{ autogenerate: { directory: '02-mechanics' } }] },
        { label: '电气与嵌入式', items: [{ autogenerate: { directory: '03-electrical-embedded' } }] },
        { label: '小脑：模型与实时运控', items: [{ autogenerate: { directory: '04-cerebellum-realtime-control' } }] },
        { label: '大脑：感知、规划、VLA 与 WAM', items: [{ autogenerate: { directory: '05-brain-perception-planning-vla-wam' } }] },
        { label: '软件与工具链', items: [{ autogenerate: { directory: '06-software-tools-simulation' } }] },
        { label: '工程实践与安全', items: [{ autogenerate: { directory: '07-engineering-practice-safety' } }] },
      ],
      tableOfContents: { minHeadingLevel: 2, maxHeadingLevel: 3 },
      pagination: true,
      customCss: ['./src/styles/custom.css'],
    }),
  ],
});
