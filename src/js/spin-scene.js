'use strict'

import THREE from 'three'
import TweenMax from 'gsap'
import _ from 'lodash'

import {InteractionScene} from './interaction-scene.js'

import vertexShader from '../shaders/circular.vert!text'
import fragmentShader from '../shaders/circular.frag!text'

export class SpinScene extends InteractionScene {
  constructor(scene, clock, leapManager) {
    super(scene, clock, leapManager)

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
    let boundingBox = {w: window.innerWidth / 2, h: window.innerHeight / 2}
    let positions = this.generatePositionsArray(boundingBox.w, boundingBox.h, 35, 0)

    // position them randomly but distributed somewhat evenly
    _.each(this.meshes, (mesh) => {
      let pos = this.getRandomPosition(positions, true)
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

  // Returns a random integer between min (included) and max (excluded)
  // Using Math.round() will give you a non-uniform distribution!
  getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min
  }

  // generate random positions
  generatePositionsArray(maxX, maxY, safeRadius, irregularity) {
    let positionsArray = []
    let r, c
    let rows
    let columns

    // count the amount of rows and columns
    rows = Math.floor(maxY / safeRadius)
    columns = Math.floor(maxX / safeRadius)

    // loop through rows
    for (r = 1; r <= rows; r += 1) {
      // loop through columns
      for (c = 1; c <= columns; c += 1) {
        positionsArray.push({
          x: Math.round(maxX * c / columns) + this.getRandomInt(irregularity * -1, irregularity),
          y: Math.round(maxY * r / rows) + this.getRandomInt(irregularity * -1, irregularity)
        })
      }
    }

    // return array
    return positionsArray
  }

  // get random position from positions array
  getRandomPosition(array, removeTaken) {
    let randomIndex
    let coordinates

    // get random index
    randomIndex = this.getRandomInt(0, array.length - 1)

    // get random item from array
    coordinates = array[randomIndex]

    // check if remove taken
    if (removeTaken) {

      // remove element from array
      array.splice(randomIndex, 1)
    }

    // return position
    return coordinates
  }
}
