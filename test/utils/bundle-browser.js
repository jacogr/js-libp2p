'use strict'

const WS = require('libp2p-websockets')
const WebRTCStar = require('libp2p-webrtc-star')
const WebSocketStar = require('libp2p-websocket-star')
const Bootstrap = require('libp2p-railing')
const SPDY = require('libp2p-spdy')
const MPLEX = require('libp2p-mplex')
const KadDHT = require('libp2p-kad-dht')
const SECIO = require('libp2p-secio')
const defaultsDeep = require('lodash.defaultsdeep')
const libp2p = require('../..')

function mapMuxers (list) {
  return list.map((pref) => {
    if (typeof pref !== 'string') { return pref }
    switch (pref.trim().toLowerCase()) {
      case 'spdy': return SPDY
      case 'mplex': return MPLEX
      default:
        throw new Error(pref + ' muxer not available')
    }
  })
}

function getMuxers (options) {
  if (options) {
    return mapMuxers(options)
  } else {
    return [MPLEX, SPDY]
  }
}

class Node extends libp2p {
  constructor (_options) {
    _options = _options || {}

    const wrtcStar = new WebRTCStar({ id: _options.peerInfo.id })
    const wsStar = new WebSocketStar({ id: _options.peerInfo.id })

    const defaults = {
      modules: {
        transport: [
          new WS(),
          wrtcStar,
          wsStar
        ],
        streamMuxer: getMuxers(_options.muxer),
        connEncryption: [
          SECIO
        ],
        peerDiscovery: [
          // TODO add tags to all Discovery Mechanisms
          // wrtcStar.discovery,
          // wsStar.discovery,
          Bootstrap
        ],
        peerRouting: [],
        contentRouting: [],
        dht: KadDHT
      },
      config: {
        peerDiscovery: {
          webRTCStar: {
            enabled: true
          },
          websocketStar: {
            enabled: true
          },
          bootstrap: {
            interval: 10000,
            enabled: false,
            list: _options.boostrapList
          }
        }
      }
    }

    defaultsDeep(_options, defaults)

    super(_options)
  }
}

module.exports = Node
