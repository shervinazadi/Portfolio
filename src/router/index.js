import Vue from 'vue'
import Router from 'vue-router'
import Dashboard from '@/components/Dashboard'
import NewEmployee from '@/components/NewEmployee'
import EditEmployee from '@/components/EditEmployee'
import ViewEmployee from '@/components/ViewEmployee'
import ViewSystem from '@/components/ViewSystem'
import Login from '@/components/Login';
import Register from '@/components/Register';
import Playboard from '@/components/Playboard';
import RealtimePlayboard from '@/components/RealtimePlayboard';
import threeD from '@/components/threeD';
import RealtimeThreeD from '@/components/RealtimeThreeD';
import Field from '@/components/Field';
import firebase from 'firebase'

Vue.use(Router)

let router = new Router({
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: Dashboard,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/threed',
      name: 'threed',
      component: threeD,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/field',
      name: 'field',
      component: Field,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/rtthreed',
      name: 'rtthreed',
      component: RealtimeThreeD,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/play',
      name: 'playboard',
      component: Playboard,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/rtplay',
      name: 'rtplayboard',
      component: RealtimePlayboard,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
      meta: {
        requiresGuest: true
      }
    },
    {
      path: '/register',
      name: 'register',
      component: Register,
      meta: {
        requiresGuest: true
      }
    },
    {
      path: '/new',
      name: 'new-employee',
      component: NewEmployee,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/edit/:employee_id',
      name: 'edit-employee',
      component: EditEmployee,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/:employee_id',
      name: 'view-employee',
      component: ViewEmployee,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/systems/:system_id',
      name: 'view-system',
      component: ViewSystem,
      meta: {
        requiresAuth: true
      }
    },
  ]
})


//Nav Guards

router.beforeEach((to, from, next ) => {
  //check for requiredAuth guard
  if(to.matched.some(record => record.meta.requiresAuth)) {
    //check if we are NOT signed in to firebase
    if(!firebase.auth().currentUser) {
      //go to login page
      next({
        path: '/login',
        querry: {
          redirect: to.fullPath
        }
      })
    } else {
      //proceed to the rout
      next()
    }
  } else if(to.matched.some(record => record.meta.requiresGuest)) {
    //check if we are signed in to firebase
    if(firebase.auth().currentUser) {
      //proceed to the rout
      next()
      //go to login page
      next({
        path: '/',
        querry: {
          redirect: to.fullPath
        }
      })
    } else {
      //proceed to the rout
      next()
    }
  } else {
    //proceed to the rout
    next()
  }
})

export default router