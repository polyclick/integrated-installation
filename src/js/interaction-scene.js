'use strict'

import THREE from 'three'
import _ from 'lodash'

export class InteractionScene {
  constructor(scene, clock, leapManager) {
    this.scene = scene
    this.clock = clock
    this.leapManager = leapManager

    this.name = '-default-'

    this.meshes = []
  }

  activate() {
    console.log('activate scene: ' + this.name)
    _.each(this.meshes, (mesh) => {
      mesh.visible = true
    })
  }

  deactivate() {
    console.log('deactivate scene: ' + this.name)
    _.each(this.meshes, (mesh) => {
      mesh.visible = false
    })
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
}
