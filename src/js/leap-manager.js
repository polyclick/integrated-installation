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
    this.rollStrength = 0.0
    this.heightStrength = 0.5
    this.widthStrength = 0.5

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

      // get first hand
      let handsMap = this.currentFrame.handsMap
      let hand = handsMap[Object.keys(handsMap)[0]]

      // grab strength
      this.grabStrength = hand.grabStrength

      // roll strength
      this.rollStrength = hand.roll()

      // height strength
      let MIN_HEIGHT_DISTANCE = 75
      let MAX_HEIGHT_DISTANCE = 175
      this.heightStrength = clamp((hand.stabilizedPalmPosition[1] - MIN_HEIGHT_DISTANCE) / MAX_HEIGHT_DISTANCE, 0, 1)

      // width strength
      let MAX_WIDTH_DISTANCE = 150
      this.widthStrength = clamp(hand.stabilizedPalmPosition[0] / MAX_WIDTH_DISTANCE, -1, 1)

      // cache previous frame
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
