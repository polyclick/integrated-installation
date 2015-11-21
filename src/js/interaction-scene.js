'use strict'

import THREE from 'three'
import TweenMax from 'gsap'
import _ from 'lodash'

export class InteractionScene {
  constructor($instruction, scene, clock, leapManager) {
    this.$instruction = $instruction
    this.scene = scene
    this.clock = clock
    this.leapManager = leapManager

    this.TEASE_TIMEOUT = 1000

    this.name = '-default-'

    this.meshes = []
    this.teaseTimeout

    this.hideInstruction(false)
  }

  activate() {
    console.log('activate scene: ' + this.name)
    _.each(this.meshes, (mesh) => {
      mesh.visible = true
    })

    this.teaseInstruction()
  }

  deactivate() {
    console.log('deactivate scene: ' + this.name)
    _.each(this.meshes, (mesh) => {
      mesh.visible = false
    })

    this.hideInstruction()
  }

  animate() {
    let elasped = this.clock.getElapsedTime()
    _.each(this.meshes, (mesh) => {
      mesh.material.uniforms.u_time.value = elasped
    })
  }

  createMesh(geometry, shader) {

    // all shaders automatically get time and resolution uniforms
    let uniforms = {
      u_time: { type: 'f', value: 1.0 },
      u_resolution: { type: 'v2', value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
    }

    // merged with uniforms in shader object
    if (shader.uniforms)
      uniforms = _.extend(uniforms, shader.uniforms)

    // create material
    let material = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: shader.vertex,
      fragmentShader: shader.fragment
    })

    // mesh
    let mesh = new THREE.Mesh(geometry, material)
    mesh.visible = false

    // add to scene, cache
    this.scene.add(mesh)
    this.meshes.push(mesh)

    // return reference
    return mesh
  }

  hideInstruction(animated) {
    clearTimeout(this.teaseTimeout)

    TweenMax.to(this.$instruction, animated ? 1 : 0, { alpha: 0 })
  }

  teaseInstruction() {
    clearTimeout(this.teaseTimeout)

    TweenMax.to(this.$instruction, 0, { alpha: 1 })
    this.teaseTimeout = setTimeout(() => {
      TweenMax.to(this.$instruction, 0.3, { alpha: 0 })
    }, this.TEASE_TIMEOUT)
  }
}
