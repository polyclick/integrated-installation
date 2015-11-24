'use strict'

import THREE from 'three'
import TweenMax from 'gsap'
import _ from 'lodash'

import {InteractionScene} from './interaction-scene.js'

import vertexShader from '../shaders/horizontal-marching-stripes.vert!text'
import fragmentShader from '../shaders/horizontal-marching-stripes.frag!text'

export class GrabScene extends InteractionScene {
  constructor(screen, scene, clock, $instruction, leapManager) {
    super(screen, scene, clock, $instruction, leapManager)

    this.MIN_SCALE = 0.025
    this.MAX_SCALE = 1.00

    // name of the scene
    this.name = 'grab-scene'

    // the active mesh
    this.activeMesh = null

    // orb-like geometries
    this.geometries = [
      new THREE.SphereGeometry(250, 32, 32),
      new THREE.IcosahedronGeometry(250, 0),
      new THREE.IcosahedronGeometry(250, 1),
      new THREE.DodecahedronGeometry(250, 0),
      new THREE.DodecahedronGeometry(250, 1),
      new THREE.OctahedronGeometry(250, 0),
      new THREE.OctahedronGeometry(250, 1)
    ]

    // create meshes
    _.each(this.geometries, (geometry) => {
      this.createMesh(
        geometry,
        {
          uniforms: null,
          vertex: vertexShader,
          fragment: fragmentShader
        }
      )
    })
  }

  // override activate for this scene
  activate() {
    this.activeMesh = _.sample(this.meshes)
    this.activeMesh.visible = true
    console.log(this.activeMesh.geometry)
    this.teaseInstruction()
  }

  animate() {
    super.animate()

    if (this.activeMesh) {

      // overall scale
      let scale = this.MAX_SCALE - (this.leapManager.grabStrength * (this.MAX_SCALE - this.MIN_SCALE))
      TweenMax.to(this.activeMesh.scale, 0.1, {
        x: scale,
        y: scale,
        z: scale
      })

      // follow hand rotion
      TweenMax.to(this.activeMesh.rotation, 0.5, {
        z: this.leapManager.rollStrength
      })
    }
  }
}
