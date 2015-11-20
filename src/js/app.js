'use strict'

import THREE from 'three'
import TweenMax from 'gsap'
import $ from 'jquery'
import _ from 'lodash'

import {LeapManager} from './leap-manager.js'

import {GrabScene} from './grab-scene.js'
import {BounceScene} from './bounce-scene.js'
import {SpinScene} from './spin-scene.js'
import {SliceScene} from './slice-scene.js'
import {ScreenSaver} from './screen-saver.js'

//
//  More shaders with black/white
//    https://www.shadertoy.com/view/llsSzH
//
//
//

class App {
  constructor() {
    this.IDLE_TIMEOUT = 250

    this.renderer = null
    this.camera = null
    this.scene = null
    this.clock = null

    this.leapManager = null

    this.scenes = null
    this.activeScene = null
    this.previousSceneName = ''

    this.idleTimeout = null

    this.init()
  }

  init() {
    // renderer
    this.renderer = new THREE.WebGLRenderer({ alpha: false, antialias: true, preserveDrawingBuffer: true })
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    //this.renderer.autoClearColor = false;
    document.body.appendChild(this.renderer.domElement)

    // camera
    this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000)
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
      new GrabScene(this.scene, this.clock, this.leapManager),
      new BounceScene(this.scene, this.clock, this.leapManager),
      new SpinScene(this.scene, this.clock, this.leapManager)
    ]

    // screensaver scene
    this.screensaver = new ScreenSaver(this.scene, this.clock)

    // render & animation ticker
    TweenMax.ticker.fps(60)
    TweenMax.ticker.addEventListener('tick', this.tick.bind(this))

    // resize
    window.addEventListener('resize', this.resize.bind(this), false)

    $(window).mousedown(() => {
      this.handleHandHasEntered()
    })

    $(window).mouseup(() => {
      this.handleHandHasLeft()
    })
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
    // update camera
    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.updateProjectionMatrix()

    // update renderer
    this.renderer.setSize(window.innerWidth, window.innerHeight)
  }

  handleHandHasEntered() {
    clearTimeout(this.idleTimeout)

    // filter list to leave out last scene (no duplicates after each other)
    let filtered = this.scenes
    if (this.scenes.length > 1) {
      filtered = _.filter(this.scenes, (scene) => {
        return scene.name !== this.previousSceneName
      })
    }

    // activate scene
    this.activeScene = _.sample(filtered)
    this.activeScene.activate()

    // keep track of last scene name for next cycle
    this.previousSceneName = this.activeScene.name

    // hide screensaver
    this.screensaver.hide()
  }

  handleHandHasLeft() {
    clearTimeout(this.idleTimeout)
    this.idleTimeout = setTimeout(() => {
      this.handleHandHasLeftTimeoutReached()
    }, this.IDLE_TIMEOUT)
  }

  handleHandHasLeftTimeoutReached() {
    if (this.activeScene) {
      this.screensaver.show()
      this.activeScene.deactivate()
    }
  }
}

// export already created instance
export let app = new App()
