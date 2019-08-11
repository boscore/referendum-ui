import Vue from 'vue'
import Router from 'vue-router'
// import Referendum from './views/Referendum.vue'
// import Auditor from './views/Auditor.vue'
// import CreateProposal from './views/CreateProposal.vue'
// import PollDetail from './views/PollDetail.vue'
// import RegisterAuditor from './views/RegisterAuditor.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('@/views/Referendum')
    },
    {
      path: '/help/process',
      name: 'process',
      component: () => import('@/components/help/PropProcess')
    },
    {
      path: '/help/tutorial',
      name: 'tutorial',
      component: () => import('@/components/help/VoteTutorial')
    },
    {
      path: '/referendum',
      name: 'referendum',
      component: () => import('@/views/Referendum')
    },
    {
      path: '/auditor',
      name: 'auditor',
      component: () => import('@/views/Auditor')
    },
    {
      path: '/auditor/register',
      name: 'register',
      component: () => import('@/views/RegisterAuditor')
    },
    {
      path: '/poll_detail',
      name: 'pull_detail',
      component: () => import('@/views/PollDetail')
    },
    {
      path: '/create_proposal',
      name: 'create_proposal',
      component: () => import('@/views/CreateProposal')
    },
    {
      path: '/*',
      name: '',
      component: () => import('@/views/Referendum'),
      redirect: '/'
    }
  ]
})
