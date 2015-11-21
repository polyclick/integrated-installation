'use strict'

import THREE from 'three'
import _ from 'lodash'

import vertexShader from '../shaders/screensaver.vert!text'
import fragmentShader from '../shaders/screensaver.frag!text'

export class ScreenSaver {
  constructor(scene, clock) {
    this.scene = scene
    this.clock = clock

    let geometry = new THREE.PlaneGeometry(1000, 1000)
    let material = new THREE.ShaderMaterial({
      uniforms: {
        u_time: { type: 'f', value: 1.0 },
        u_resolution: { type: 'v2', value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        u_mode: { type: '1i', value: 0 },
        u_amount: { type: 'f', value: 20.0 },
        u_speed: { type: 'f', value: 10.0 },
        u_mask: { type: '1i', value: 0 }
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader
    })
    this.mesh = new THREE.Mesh(geometry, material)
    this.scene.add(this.mesh)

    this.modes = [0, 1]
    this.previousMode = null
    this.showing = false;

    this.queueNextMode()
  }

  animate() {
    let elasped = this.clock.getElapsedTime()
    this.mesh.material.uniforms.u_time.value = elasped
  }

  queueNextMode() {
    let mode = _.sample(_.without(this.modes, this.previousMode))
    this.previousMode = mode

    // amount of bands
    let amount = 10.0 + (Math.random() * 80.0)

    // the speeds they are moving
    let speed = 10.0 + (Math.random() * 40.0)

    // backward or forward (-1 or 1)
    let direction = parseInt(Math.round(Math.random()), 10) ? -1 : 1

    // should mask?
    let mask = parseInt(Math.round(Math.random()), 10) ? 0 : 1

    // only rotate when no mask was set
    let shouldRotate = !mask && parseInt(Math.round(Math.random()), 10)
    this.mesh.rotation.z = shouldRotate ? Math.PI / 180 * 45.0 : 0

    // if rotate was picked, resize sometimes
    let shouldResize = shouldRotate && parseInt(Math.round(Math.random()), 10)
    let scalefactor = shouldResize ? window.innerHeight / window.innerWidth : 1.0
    this.mesh.scale.set(scalefactor, scalefactor, scalefactor)

    // set uniforms
    this.mesh.material.uniforms.u_mode.value = mode
    this.mesh.material.uniforms.u_amount.value = amount
    this.mesh.material.uniforms.u_speed.value = speed * direction
    this.mesh.material.uniforms.u_mask.value = mask

    setTimeout(() => {
      this.queueNextMode()
    }, 350 + (Math.random() * 3500))
  }

  show() {
    this.mesh.visible = true
    this.showing = true;
  }

  hide() {
    this.mesh.visible = false
    this.showing = false;
  }
}
