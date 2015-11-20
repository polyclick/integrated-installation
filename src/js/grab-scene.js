'use strict'

import THREE from 'three'

import {InteractionScene} from './interaction-scene.js'

import vertexShader from '../shaders/horizontal-marching-stripes.vert!text'
import fragmentShader from '../shaders/horizontal-marching-stripes.frag!text'

export class GrabScene extends InteractionScene {
  constructor(scene, clock, leapManager) {
    super(scene, clock, leapManager)

    this.MIN_SCALE = 0.05
    this.MAX_SCALE = 1.00

    // name of the scene
    this.name = 'grab-scene'

    // create the mesh for this scene
    this.mesh = this.createMesh(
      new THREE.SphereGeometry(200, 32, 32),
      // new THREE.IcosahedronGeometry(200, 0),
      // new THREE.IcosahedronGeometry(200, 1),
      // new THREE.DodecahedronGeometry(200, 0),
      // new THREE.DodecahedronGeometry(200, 1),
      // new THREE.OctahedronGeometry(200, 0),
      // new THREE.OctahedronGeometry(200, 1),
      {
        uniforms: null,
        vertex: vertexShader,
        fragment: fragmentShader
      }
    )
  }

  animate() {
    super.animate()

    let scale = this.MAX_SCALE - (this.leapManager.grabStrength * (this.MAX_SCALE - this.MIN_SCALE))
    this.mesh.scale.set(scale, scale, scale)
    this.mesh.rotation.x += 0.005
    this.mesh.rotation.y += 0.0075
    this.mesh.rotation.z += 0.005

    //if (this.mesh)
      //this.mesh.scale.set(this.leapManager.grabStrength)
  }
}
