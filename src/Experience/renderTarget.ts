// 渲染目标
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

export default class renderTarget {
    renderTar
    rtCamera
    rtScene
    renderer
    camera
    scene
    rtCubes
    cube
    controls
    renderRequested: boolean
    constructor(el: HTMLElement) {
        this.renderer = new THREE.WebGLRenderer({ antialias: true, canvas: el })
        const rtWidth = 512
        const rtHeight = 512
        this.renderTar = new THREE.WebGLRenderTarget(rtWidth, rtHeight)
        this.scene = new THREE.Scene()

        const rtFov = 75
        const rtAspect = rtWidth / rtHeight
        const rtNear = 0.1
        const rtFar = 5
        this.rtCamera = new THREE.PerspectiveCamera(rtFov, rtAspect, rtNear, rtFar)
        this.rtCamera.position.z = 2

        this.rtScene = new THREE.Scene()
        this.rtScene.background = new THREE.Color('red')

        {
            const color = 0xffffff
            const intensity = 3
            const light = new THREE.DirectionalLight(color, intensity)
            light.position.set(-1, 2, 4)
            this.rtScene.add(light)
        }

        const boxWidth = 1
        const boxHeight = 1
        const boxDepth = 1
        const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth)

        this.rtCubes = [
            this.makeInstance(geometry, 0x44aa88, 0),
            this.makeInstance(geometry, 0x8844aa, -2),
            this.makeInstance(geometry, 0xaa8844, 2)
        ]

        const fov = 75
        const aspect = 2 // the canvas default
        const near = 0.1
        const far = 5
        this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far)
        this.camera.position.z = 3

        this.controls = new OrbitControls(this.camera, el)
        this.controls.enableDamping = true
        this.controls.target.set(0, 0, 0)
        this.controls.update()

        {
            const color = 0xffffff
            const intensity = 1
            const light = new THREE.DirectionalLight(color, intensity)
            light.position.set(-1, 2, 4)
            this.scene.add(light)
        }
        const material = new THREE.MeshPhongMaterial({
            map: this.renderTar.texture
        })
        this.cube = new THREE.Mesh(geometry, material)
        this.scene.add(this.cube)

        this.render(20)
        this.renderRequested = false

        this.controls.addEventListener('change', this.requestRenderIfNotRequested)
        window.addEventListener('resize', this.requestRenderIfNotRequested)
    }

    requestRenderIfNotRequested = () => {
        if (!this.renderRequested) {
            this.renderRequested = true
            requestAnimationFrame(this.render)
        }
    }

    makeInstance = (geometry: THREE.BoxGeometry, color: number, x: number) => {
        const material = new THREE.MeshPhongMaterial({ color })

        const cube = new THREE.Mesh(geometry, material)
        this.rtScene.add(cube)

        cube.position.x = x

        return cube
    }

    resizeRendererToDisplaySize = () => {
        const canvas = this.renderer.domElement
        const width = canvas.clientWidth
        const height = canvas.clientHeight
        const needResize = canvas.width !== width || canvas.height !== height
        if (needResize) {
            this.renderer.setSize(width, height, false)
        }

        return needResize
    }

    render = (time: number) => {
        time *= 0.001
        this.renderRequested = false
        if (this.resizeRendererToDisplaySize()) {
            const canvas = this.renderer.domElement
            this.camera.aspect = canvas.clientWidth / canvas.clientHeight
            this.camera.updateProjectionMatrix()
        }

        // rotate all the cubes in the render target scene
        // this.rtCubes.forEach((cube, ndx) => {
        //     const speed = 1 + ndx * 0.1
        //     const rot = time * speed
        //     cube.rotation.x = rot
        //     cube.rotation.y = rot
        // })
        this.controls.update()
        // 绘制渲染目标场景来渲染目标
        this.renderer.setRenderTarget(this.renderTar)
        this.renderer.render(this.rtScene, this.rtCamera)
        this.renderer.setRenderTarget(null)

        // rotate the cube in the scene
        // this.cube.rotation.x = time
        // this.cube.rotation.y = time * 1.1

        // render the scene to the canvas
        this.renderer.render(this.scene, this.camera)

        // requestAnimationFrame(this.render)
    }
}
