import Vue from 'vue'
import Vuex from 'vuex'
import { API_URL } from '@/assets/constants.js'
import util from '@/util.js'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    language: 'en',
    scatter: null,
    currentProposal: null,
    accounts: null,
    votes: [],
    proposals: null,
    proxies: null,
    screenWidth: -1,
    summaries: {},
    isPC: true
  },
  mutations: {
    setScatter (state, payload) {
      state.scatter = payload.scatter
    },
    setCurrentProposal (state, payload) {
      state.currentProposal = payload.proposal
    },
    setProposals (state, payload) {
      state.proposals = payload.proposals
    },
    setAccounts (state, payload) {
      state.accounts = payload.accounts
    },
    setProxies (state, payload) {
      state.proxies = payload.proxies
    },
    setVotes (state, payload) {
      state.votes = payload.votes
    },
    addVote (state, payload) {
      state.votes.push(payload.vote)
      if (state.accounts[payload.vote.voter]) {
        state.accounts[payload.vote.voter].votes[payload.vote.proposal_name] = payload.vote
      } else {
        let votes = {}
        votes[payload.vote.proposal_name] = payload.vote
        state.accounts[payload.vote.voter] = {
          is_proxy: false,
          proxy: '',
          staked: 0,
          votes: votes
        }
        state.accounts = Object.assign({}, state.accounts)
      }
    },
    deleteVote (state, payload) {
      state.votes.forEach((vote, index) => {
        if (payload.vote.voter === vote.voter && payload.vote.proposal_name === vote.proposal_name) {
          state.votes.splice(index, 1)
        }
      })
      let votes = { ...state.accounts[payload.vote.voter].votes }
      delete votes[payload.vote.proposal_name]
      state.accounts[payload.vote.voter].votes = votes
    },
    setScreenWidth (state, payload) {
      state.screenWidth = payload.screenWidth
    },
    setSummaries (state, payload) {
      state.summaries = payload.summaries
    },
    setIsPC (state, payload) {
      state.isPC = payload.isPC
    }
  },
  actions: {
    setScreenWidth ({ commit }, payload) {
      commit('setScreenWidth', { screenWidth: payload.screenWidth })
    },
    setScatter ({ commit }, payload) {
      commit('setScatter', { scatter: payload.scatter })
    },
    setCurrentProposal ({ commit }, payload) {
      commit('setCurrentProposal', { proposal: payload.proposal })
    },
    getProposals ({ commit, dispatch }, payload) {
      fetch(API_URL.API_POLL_TALLY).then(res => res.json()).then(res => { console.log(res) })
      fetch(API_URL.API_GET_ALL_PROPOSALS)
        .then(res => {
          if (res.status !== 200) {
            console.log(res.statusText)
          }
          return res.json()
        })
        .then(res => {
          Object.keys(res).forEach(key => {
            try {
              if (res[key].proposal.proposal_json) {
                res[key].proposal.proposal_json = JSON.parse(util.transSpecialChar(res[key].proposal.proposal_json))
                res[key].proposal.proposal_json.content = util.unTransSpecialChar(res[key].proposal.proposal_json.content)
              } else {
                res[key].proposal.proposal_json = {
                  type: '',
                  content: ''
                }
              }
            } catch (e) {
              console.log(e)
              console.log(key + ' invalid proposal_json')
              res[key].proposal.proposal_json = {
                type: '',
                content: ''
              }
            }
          })
          if (payload && payload.hasOwnProperty('proposalName')) {
            dispatch('setCurrentProposal', { proposal: res[payload.proposalName] })
          }
          commit('setProposals', { proposals: res })
        })
        .catch(e => {
          console.log(e)
        })
    },
    getAccounts ({ commit }, payload) {
      fetch(API_URL.API_GET_ALL_ACCOUNTS)
        .then(res => {
          if (res.status !== 200) {
            console.log(res.statusText)
          }
          return res.json()
        })
        .then(res => {
          commit('setAccounts', { accounts: res })
        })
        .catch(e => {
          console.log(e)
        })
    },
    getProxies ({ commit }, payload) {
      fetch(API_URL.API_GET_ALL_PROXIES)
        .then(res => {
          if (res.status !== 200) {
            console.log(res.statusText)
          }
          return res.json()
        })
        .then(res => {
          commit('setProxies', { proxies: res })
        })
        .catch(e => {
          console.log(e)
        })
    },
    getVotes ({ commit }, payload) {
      fetch(API_URL.API_GET_ALL_VOTES)
        .then(res => {
          if (res.status !== 200) {
            console.log(res.statusText)
          }
          return res.json()
        })
        .then(res => {
          res.forEach(vote => {
            if (vote.vote_json) {
              try {
                vote.vote_json = JSON.parse(util.transSpecialChar(vote.vote_json))
                vote.vote_json.comment = util.unTransSpecialChar(vote.vote_json.comment)
              } catch (e) {
                console.log(e)
                console.log(vote.voter + 'invalid vote_json')
              }
            } else {
              vote.vote_json = null
            }
          })
          commit('setVotes', { votes: res })
        })
        .catch(e => {
          console.log(e)
        })
    },
    getSummaries ({ commit }) {
      fetch(API_URL.API_GET_SUMMARIES).then(res => res.json())
        .then(res => {
          commit('setSummaries', { summaries: res })
        }).catch(e => {
          console.log(e)
        })
    }
  }
})
