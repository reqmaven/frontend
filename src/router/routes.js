const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: 'project/:id', component: () => import('pages/ProjectPage.vue'), props: true },
      {
        path: 'requirement-source/:id',
        component: () => import('pages/RequirementSourcePage.vue'),
        props: true,
      },
      {
        path: 'requirement/:id',
        component: () => import('pages/RequirementPage.vue'),
        props: true,
      },
    ],
  },
  {
    path: '/requirements/',
    component: () => import('layouts/TableLayout.vue'),
    children: [{ path: '', component: () => import('pages/TableViewPage.vue') }],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
