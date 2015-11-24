'use strict'

import THREE from 'three'
import TweenMax from 'gsap'
import Power2 from 'gsap'
import $ from 'jquery'
import _ from 'lodash'

import {LeapManager} from './leap-manager.js'

import {GrabScene} from './grab-scene.js'
import {BounceScene} from './bounce-scene.js'
import {SpinScene} from './spin-scene.js'
import {StrafeScene} from './strafe-scene.js'
import {ScreenSaver} from './screen-saver.js'

class App {
  constructor() {

    // positioning logic
    this.SHOULD_FILL_SCREEN = true
    this.WIDTH = 1000
    this.HEIGHT = 1000
    this.TOP = 100
    this.LEFT = 100

    // pick a random scene when a hand enters?
    this.RANDOM_SCENE_ORDER = false

    // time in ms to wait after hand was lost to return to screensaver
    this.IDLE_TIMEOUT = 1000

    this.screen = { w: 0, h: 0 }

    this.renderer = null
    this.camera = null
    this.scene = null
    this.clock = null

    this.leapManager = null

    this.scenes = null
    this.activeScene = null
    this.previousSceneName = ''
    this.currentSceneIndex = 0

    this.idleTimeout = null
    this.resizeTimeout = null

    this.$container = $('.container')
    this.$title = $('.title')
    this.$blocker = $('.blocker')
    this.$instructionGrab = $('.instruction.grab')
    this.$instructionRoll = $('.instruction.roll')
    this.$instructionVMove = $('.instruction.v-move')
    this.$instructionHMove = $('.instruction.h-move')

    this.init()
    this.logResolutionDetails()
  }

  init() {
    // set screen size
    this.screen.w = this.SHOULD_FILL_SCREEN ? window.innerWidth : this.WIDTH
    this.screen.h = this.SHOULD_FILL_SCREEN ? window.innerHeight : this.HEIGHT

    // container
    this.$container
      .width(this.screen.w)
      .height(this.screen.h)

    if (!this.SHOULD_FILL_SCREEN) {
      this.$container.css({
        top: this.TOP + 'px',
        left: this.LEFT + 'px'
      })
    }

    // renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true })
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.setSize(this.screen.w, this.screen.h)
    this.$container.append(this.renderer.domElement)

    // camera
    this.camera = new THREE.PerspectiveCamera(70, this.screen.w / this.screen.h, 1, 1000)
    this.camera.position.z = 400

    // scene
    this.scene = new THREE.Scene()

    // clock
    this.clock = new THREE.Clock()

    // leap manager
    this.leapManager = new LeapManager()
    this.leapManager.subscribe('hand-entered', () => {
      this.handleHandHasEntered()
    })
    this.leapManager.subscribe('hand-left', () => {
      this.handleHandHasLeft()
    })

    // scenes
    this.scenes = [
      new GrabScene(this.screen, this.scene, this.clock, this.$instructionGrab, this.leapManager),
      new BounceScene(this.screen, this.scene, this.clock, this.$instructionVMove, this.leapManager),
      new SpinScene(this.screen, this.scene, this.clock, this.$instructionRoll, this.leapManager),
      new StrafeScene(this.screen, this.scene, this.clock, this.$instructionHMove, this.leapManager)
    ]

    // screensaver scene
    this.screensaver = new ScreenSaver(this.screen, this.scene, this.clock)
    this.screensaver.show()

    // blocker
    this.hideBlocker()

    // render & animation ticker
    TweenMax.ticker.fps(60)
    TweenMax.ticker.addEventListener('tick', this.tick.bind(this))

    // resize
    window.addEventListener('resize', this.resize.bind(this), false)
  }

  tick() {
    this.animate()
    this.render()
  }

  animate() {
    this.screensaver.animate()

    if (this.activeScene)
      this.activeScene.animate()
  }

  render() {
    this.renderer.render(this.scene, this.camera)
  }

  resize() {
    clearTimeout(this.resizeTimeout)

    // update camera
    this.camera.aspect = this.screen.w / this.screen.h
    this.camera.updateProjectionMatrix()

    // update renderer
    this.renderer.setSize(this.screen.w, this.screen.h)

    // resize timeout
    // automatically reloads page when resizing completes
    this.resizeTimeout = setTimeout(() => {
      clearTimeout(this.resizeTimeout)
      location.reload()
    }, 1500)
  }

  handleHandHasEntered() {

    // clear idle timeout and hide blocker
    clearTimeout(this.idleTimeout)
    this.hideBlocker()

    // if screensaver was showing, pick a random scene
    // else, by hiding the blocker (see above, we are back at the active scene)
    if (this.screensaver.showing) {

      // get the next scene to activate
      this.activeScene = this.getNextScene()
      this.activeScene.activate()

      // keep track of last scene name for next cycle
      this.previousSceneName = this.activeScene.name

      // hide screensaver & title
      this.screensaver.hide()
      this.$title.hide()
    }
  }

  getNextScene() {
    if (this.RANDOM_SCENE_ORDER) {

      // filter list to leave out last scene (no duplicates after each other)
      let filtered = this.scenes
      if (this.scenes.length > 1) {
        filtered = _.filter(this.scenes, (scene) => {
          return scene.name !== this.previousSceneName
        })
      }

      // return random
      return _.sample(filtered)

    }

    // next in line
    this.currentSceneIndex++
    return this.scenes[this.currentSceneIndex % this.scenes.length]
  }

  handleHandHasLeft() {
    clearTimeout(this.idleTimeout)

    // start timeout for returning to screensaver
    this.idleTimeout = setTimeout(() => {
      clearTimeout(this.idleTimeout)
      this.handleHandHasLeftTimeoutReached()
    }, this.IDLE_TIMEOUT)

    // and start fading in the blocker
    this.fadeInBlocker(this.IDLE_TIMEOUT / 1000)
  }

  handleHandHasLeftTimeoutReached() {
    if (this.activeScene) {
      _.each(this.scenes, (scene) => {
        scene.deactivate()
      })

      this.screensaver.show()
      this.$title.show()
      this.hideBlocker()
    }
  }

  logResolutionDetails() {
    let w = window.innerWidth
    let h = window.innerHeight
    let r = this.gcd(w, h)

    console.log(`Resolution changed to: ${w}px x ${h}px (${w / r}:${h / r})`)
  }

  gcd(a, b) {
    return (b === 0) ? a : this.gcd(b, a % b)
  }

  hideBlocker() {
    TweenMax.to(this.$blocker, 0, { alpha: 0 })
  }

  fadeInBlocker(time) {
    TweenMax.to(this.$blocker, time, { alpha: 1, ease: Power2.easeIn })
  }
}

// export already created instance
export let app = new App()
