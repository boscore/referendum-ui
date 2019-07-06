
// export const EOSFORUM = 'eosio.forum'
// // 'eosforumdapp'

// export const NETWORK = {
//   blockchain: 'eos',
//   protocol: 'https',

//   host: 'bos-testnet.eosphere.io',

//   port: 443,
//   chainId: '33cc2426f1b258ef8c798c34c0360b31732ea27a2d7e35a65797850a86d1ba85'
// }

// export const NODE_ENDPOINT = 'https://bos-testnet.eosphere.io'

// // const BACKEND_URL = `https://boswps.eosplay.me`
// const BACKEND_URL = `https://boswps-test.eosplay.me`
// export const API_URL = {
//   API_GET_PRODUCERS: BACKEND_URL + '/getBPs',
//   API_GET_ALL_PROPOSALS: BACKEND_URL + '/getAllProposals',
//   API_GET_PROPOSAL: BACKEND_URL + '/getProposal',
//   API_APPLY_REVIEW: BACKEND_URL + '/review',
//   API_APPLY_FINISH: BACKEND_URL + '/finish',
//   API_GET_ALL_CANDIDATES: BACKEND_URL + '/getAllAuditors',
//   API_POLL_TALLY: 'https://s3.amazonaws.com/bostest.referendum/referendum/forum.tallies/latest.json',
//   API_AUDITOR_CONFIG: 'https://s3.amazonaws.com/bostest.referendum/auditor.bos/config/latest.json',
//   API_AUDITOR_BIOS: 'https://s3.amazonaws.com/bostest.referendum/auditor.bos/bios/latest.json',
//   API_GET_ALL_VOTES: 'https://s3.amazonaws.com/bostest.referendum/eosio.forum/vote/latest.json',
//   API_GET_ALL_ACCOUNTS: 'https://s3.amazonaws.com/bostest.referendum/referendum/forum.accounts/latest.json',
//   API_GET_ALL_PROXIES: 'https://s3.amazonaws.com/bostest.referendum/referendum/forum.proxies/latest.json',
//   API_GET_SUMMARIES: 'https://s3.amazonaws.com/bostest.referendum/eosio/stats/latest.json',
//   API_AUDITOR_TALLY: 'https://s3.amazonaws.com/bostest.referendum/referendum/auditor.tallies/latest.json'
// }

export const EOSFORUM = 'eosio.forum'

export const NETWORK = {
  blockchain: 'eos',
  protocol: 'https',
  host: 'api.bossweden.org',
  port: 443,
  chainId: 'd5a3d18fbb3c084e3b1f3fa98c21014b5f3db536cc15d08f9f6479517c6a3d86'
}

export const NODE_ENDPOINT = 'https://api.bossweden.org'
const BACKEND_URL = 'https://boswps.eosplay.me'
// `https://api.boswps.io`

export const API_URL = {
  API_GET_PRODUCERS: BACKEND_URL + '/getBPs',
  API_GET_ALL_PROPOSALS: BACKEND_URL + '/getAllProposals',
  API_GET_PROPOSAL: BACKEND_URL + '/getProposal',
  API_APPLY_REVIEW: BACKEND_URL + '/review',
  API_APPLY_FINISH: BACKEND_URL + '/finish',
  API_GET_ALL_CANDIDATES: BACKEND_URL + '/getAllAuditors',
  API_POLL_TALLY: 'https://s3.amazonaws.com/bos.referendum/referendum/forum.tallies/latest.json',
  API_AUDITOR_CONFIG: 'https://s3.amazonaws.com/bos.referendum/auditor.bos/config/latest.json',
  API_AUDITOR_BIOS: 'https://s3.amazonaws.com/bos.referendum/auditor.bos/bios/latest.json',
  API_AUDITOR_ACCOUNTS: 'https://s3.amazonaws.com/bos.referendum/referendum/auditor.accounts/latest.json',
  API_GET_ALL_VOTES: 'https://s3.amazonaws.com/bos.referendum/eosio.forum/vote/latest.json',
  API_GET_ALL_ACCOUNTS: 'https://s3.amazonaws.com/bos.referendum/referendum/forum.accounts/latest.json',
  API_GET_ALL_PROXIES: 'https://s3.amazonaws.com/bos.referendum/referendum/forum.proxies/latest.json',
  API_GET_SUMMARIES: 'https://s3.amazonaws.com/bos.referendum/eosio/stats/latest.json',
  API_AUDITOR_TALLY: 'https://s3.amazonaws.com/bos.referendum/referendum/auditor.tallies/latest.json'
}
