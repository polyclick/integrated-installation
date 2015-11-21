'use strict'

import THREE from 'three'
import TweenMax from 'gsap'

import {InteractionScene} from './interaction-scene.js'

import vertexShader from '../shaders/pulse.vert!text'
import fragmentShader from '../shaders/pulse.frag!text'

export class BounceScene extends InteractionScene {
  constructor($instruction, scene, clock, leapManager) {
    super($instruction, scene, clock, leapManager)

    // name of the scene
    this.name = 'bounce-scene'

    // setup the mesh for this scene
    this.mesh = this.createMesh(
      new THREE.PlaneGeometry(500, 500, 4, 1000),
      {
        uniforms: {
          u_mouse: { type: 'f', value: 0.0 }
        },
        vertex: vertexShader,
        fragment: fragmentShader
      }
    )

    // set initial position
    this.mesh.position.z = 100
    this.mesh.rotation.y = Math.PI / 180 * -55
  }

  animate() {
    super.animate()

    // set mouse uniform
    let strength = -this.leapManager.heightStrength
    TweenMax.to(this.mesh.material.uniforms.u_mouse, 0.5, {
      value: strength
    })
  }
}
