let IndexView = resolve => require(['../view/IndexView.vue'], resolve)
let DetailView = resolve => require(['../view/DetailView.vue'], resolve)
let QuestView = resolve => require(['../view/QuestView.vue'], resolve)

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
          path: '/detail/:id',
          name: 'DetailView',
          component: DetailView
      },
      {
          path: '/question/:id',
          name: 'QuestView',
          component: QuestView
      }
  ]
})

export default router