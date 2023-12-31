import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import { EventEmitter } from 'events'
import Experience from './experience'

// 加载资源
export default class Resources extends EventEmitter {
  constructor(assets) {
    super()
    this.experience = new Experience()
    this.sizes = this.experience.sizes
    this.scene = this.experience.scene
    this.canvas = this.experience.canvas
    this.assets = assets
    this.items = {}
    this.queue = this.assets.length
    this.loaded = 0

    this.setFloor()
    this.setLoaders()
    this.startLoading()
  }

  setFloor() {
    this.geometry = new THREE.PlaneGeometry(100, 100)
    this.material = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide
    })
    this.plane = new THREE.Mesh(this.geometry, this.material)
    this.plane.rotation.x = Math.PI / 2
    this.plane.receiveShadow = true
    this.plane.position.y = -0.2
    this.scene.add(this.plane)
  }

  setLoaders() {
    this.loaders = {}
    this.loaders.gltfLoader = new GLTFLoader()
    this.loaders.dracoLoader = new DRACOLoader()
    this.loaders.dracoLoader.setDecoderPath('/draco/')
    this.loaders.gltfLoader.setDRACOLoader(this.loaders.dracoLoader)
  }

  startLoading() {
    for (const asset of this.assets) {
      if (asset.type === 'glbModel') {
        this.loaders.gltfLoader.load(asset.path, file =>
          this.singleAssetLoaded(asset, file)
        )
      } else if (asset.type === 'videoTexture') {
        this.video = {}
        this.videoTexture = {}
        this.video[asset.name] = document.createElement('video')
        this.video[asset.name].src = asset.path
        this.video[asset.name].playsInline = true
        this.video[asset.name].autoplay = true
        this.video[asset.name].loop = true
        this.video[asset.name].muted = true
        this.video[asset.name].play()

        this.videoTexture[asset.name] = new THREE.VideoTexture(
          this.video[asset.name]
        )
        this.videoTexture[asset.name].flipY = true
        this.videoTexture[asset.name].minFilter = THREE.NearestFilter
        this.videoTexture[asset.name].magFilter = THREE.NearestFilter
        this.videoTexture[asset.name].generateMipmaps = false
        // 如果需要水平翻转视频
        this.videoTexture[asset.name].wrapS = THREE.RepeatWrapping
        this.videoTexture[asset.name].repeat.x = -1

        this.singleAssetLoaded(asset, this.videoTexture[asset.name])
      }
    }
  }

  singleAssetLoaded(asset, file) {
    this.items[asset.name] = file
    this.loaded++
    if (this.loaded === this.queue) {
      this.emit('all loaded')
    }
  }
}
