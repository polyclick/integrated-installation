'use strict'

import THREE from 'three'
import TweenMax from 'gsap'
import _ from 'lodash'

import {InteractionScene} from './interaction-scene.js'
import {generatePositionsArray, getRandomPosition} from './position-utils.js'

import vertexShader from '../shaders/angled-stripes.vert!text'
import fragmentShader from '../shaders/angled-stripes.frag!text'

export class StrafeScene extends InteractionScene {
  constructor(screen, scene, clock, $instruction, leapManager) {
    super(screen, scene, clock, $instruction, leapManager)

    // name of the scene
    this.name = 'strafe-scene'

    // max z depth
    this.MAX_DEPTH = -500
    this.MAX_STRAFE_MOVEMENT = 250

    // setup the meshes for this scene
    for (let i = 0; i < 25; i++) {
      this.createMesh(
        new THREE.PlaneGeometry(2000, 100, 4, 4),
        {
          uniforms: {
            u_depth: { type: 'f', value: 0.0 }
          },
          vertex: vertexShader,
          fragment: fragmentShader
        }
      )
    }
  }

  activate() {
    // positions for the bands
    // bounding box is an approximation 3d bounding box of the height and depth
    let boundingBox = {w: -this.MAX_DEPTH, h: this.screen.h}
    let positions = generatePositionsArray(boundingBox.w, boundingBox.h, 35, 0)

    // position them randomly but distributed somewhat evenly
    _.each(this.meshes, (mesh, index) => {

      // first mesh get centered position
      let y = 0
      let z = -20

      // others get positioned randomly in height and depth
      if(index) {
        let pos = getRandomPosition(positions, true)
        y = pos.y - (boundingBox.h / 2)
        z = -pos.x

        // y = (-boundingBox.h / 2) + (Math.random() * boundingBox.h)
        // z = Math.random() * this.MAX_DEPTH
      }

      // position
      mesh.position.y = y
      mesh.position.z = z
    })

    // call super to show objects
    super.activate()
  }

  animate() {
    super.animate()

    // move all, and let their shader know their z depth (normalized)
    _.each(this.meshes, (mesh, index) => {

      // move horizontally
      let strength = this.leapManager.widthStrength
      TweenMax.to(mesh.position, 0.25, {
        x: strength * (this.MAX_STRAFE_MOVEMENT * ( 1 - (mesh.position.z / this.MAX_DEPTH * 2.0)))
      })

      // set depth for fake fogging
      let depth = 1 - (mesh.position.z / this.MAX_DEPTH)
      mesh.material.uniforms.u_depth.value = depth
    })
  }
}
