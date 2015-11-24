'use strict'

import THREE from 'three'
import TweenMax from 'gsap'
import _ from 'lodash'

import {InteractionScene} from './interaction-scene.js'
import {generatePositionsArray, getRandomPosition} from './position-utils.js'

import vertexShader from '../shaders/circular-stripes.vert!text'
import fragmentShader from '../shaders/circular-stripes.frag!text'

export class SpinScene extends InteractionScene {
  constructor(screen, scene, clock, $instruction, leapManager) {
    super(screen, scene, clock, $instruction, leapManager)

    // contra movement triangle count
    this.CONTRA_AMOUNT = 3

    // name of the scene
    this.name = 'spin-scene'

    // setup the meshes for this scene
    for (let i = 0; i < 25; i++) {
      let radius = 25 + (Math.random() * 50)
      this.createMesh(
        this.createTriangleGeometry(radius),
        {
          uniforms: null,
          vertex: vertexShader,
          fragment: fragmentShader
        }
      )
    }
  }

  activate() {
    // positions for the triangles
    // IMPORTANT: width and height is not screen width and height but width and height in 3D space
    // todo: cast a ray to detect min/max x/y from the 2d screen canvas onto the 3d world
    // currently just using an approximation
    let boundingBox = {w: this.screen.w / 2, h: this.screen.h / 2}
    let positions = generatePositionsArray(boundingBox.w, boundingBox.h, 35, 0)

    // position them randomly but distributed somewhat evenly
    _.each(this.meshes, (mesh) => {
      let pos = getRandomPosition(positions, true)
      mesh.position.x = pos.x - (boundingBox.w / 2)
      mesh.position.y = pos.y - (boundingBox.h / 2)
    })

    // pick some random meshes for the contra movement
    this.contraTriangles = _.take(_.shuffle(this.meshes), this.CONTRA_AMOUNT)

    // call super to show objects
    super.activate()
  }

  animate() {
    super.animate()

    // rotate all
    _.each(this.meshes, (mesh) => {
      let strength = this.leapManager.rollStrength
      TweenMax.to(mesh.rotation, 0.25, { z: strength })
    })

    // contra rotate other
    _.each(this.contraTriangles, (mesh) => {
      let contraStrength = -this.leapManager.rollStrength
      TweenMax.to(mesh.rotation, 0.25, { z: contraStrength })
    })
  }

  createTriangleGeometry(radius) {
    let geometry = new THREE.Geometry()
    geometry.vertices.push(new THREE.Vector3(0, radius, 0))
    geometry.vertices.push(new THREE.Vector3(-radius, -radius, 0))
    geometry.vertices.push(new THREE.Vector3(radius, -radius, 0))

    geometry.faces.push(new THREE.Face3(0, 1, 2))
    geometry.computeFaceNormals()

    return geometry
  }
}
