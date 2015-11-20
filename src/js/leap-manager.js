'use strict'

import Leap from 'leapjs'
import {handEntry} from 'leapmotion/leapjs-plugins'
import _ from 'lodash'
import clamp from 'clamp'

export class LeapManager {
  constructor() {
    this.previousFrame = null
    this.currentFrame = null
    this.grabStrength = 1.0
    this.jazzStrength = 1.0
    this.rollStrength = 1.0

    this.start()
  }

  start() {
    Leap.loop({ enableGestures: false }, (frame) => {
      if (!this.previousFrame)
        this.previousFrame = frame
      this.currentFrame = frame
      this.processFrame()
    })

    // enable enter/leave hand plugin
    .use('handEntry')
    .on('handFound', (hand) => {
      this.handleHandFound()
    })
    .on('handLost', (hand) => {
      this.handleHandLost()
    })
  }

  processFrame() {
    if (!_.isEmpty(this.currentFrame) && !_.isEmpty(this.currentFrame.handsMap)) {
      let handsMap = this.currentFrame.handsMap
      let hand = handsMap[Object.keys(handsMap)[0]]

      // grab strength
      this.grabStrength = hand.grabStrength
      //console.log('process frame', hand.grabStrength)

      // sphere radius
      //console.log(hand.sphereRadius)


      // jazz hands
      // https://developer.leapmotion.com/getting-started/javascript/developer-guide
      //this.jazzStrength = hand.scaleFactor(this.previousFrame)
      //console.log(this.jazzStrength)

      //this.rollStrength = clamp(-1 * hand.roll() / Math.PI, 0, 1)
      //console.log(this.rollStrength)
      this.rollStrength = hand.roll()

      let MIN_DISTANCE = 75
      let MAX_DISTANCE = 175
      this.heightStrength = clamp((hand.stabilizedPalmPosition[1] - MIN_DISTANCE) / MAX_DISTANCE, 0, 1)
      //console.log(this.heightStrength)

      this.previousFrame = this.currentFrame
    }

  }

  handleHandFound() {
    console.log('hand found')
    _.each(this.subscribers, (subscriber) => {
      if (subscriber.name === 'hand-entered')
        subscriber.callback()
    })
  }

  handleHandLost() {
    console.log('hand lost')
    _.each(this.subscribers, (subscriber) => {
      if (subscriber.name === 'hand-left')
        subscriber.callback()
    })
  }

  subscribe(name, callback) {
    if (!this.subscribers)
      this.subscribers = []

    this.subscribers.push({name: name, callback: callback})
  }
}
