let IndexView = resolve => require(['../view/IndexView.vue'], resolve)
let DetailView = resolve => require(['../view/DetailView.vue'], resolve)

 const router = new VueRouter({
  routes: [
    {
      path: '/',
      redirect: '/index'
    },
    {
      path: '/index',
      name: 'IndexView',
      component: IndexView
    },
      {
          path: '/detail/:id/:hidden',
          name: 'DetailView',
          component: DetailView
      }

  ]
})

export default router