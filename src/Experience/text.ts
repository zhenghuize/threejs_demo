import * as THREE from 'three'
import { Font, FontLoader } from 'three/addons/loaders/FontLoader.js'
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

export default class Text {
    camera
    scene
    objects: Array<any> = []
    spread = 15
    renderer
    controls
    constructor(el: HTMLElement) {
        this.renderer = new THREE.WebGLRenderer({ antialias: true, canvas: el })

        const fov = 40
        const aspect = 2 // the canvas default
        const near = 0.1
        const far = 1000
        this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far)
        this.camera.position.z = 40

        this.scene = new THREE.Scene()
        this.scene.background = new THREE.Color(0xaaaaaa)

        {
            const color = 0xffffff
            const intensity = 3
            const light = new THREE.DirectionalLight(color, intensity)
            light.position.set(-1, 2, 4)
            this.scene.add(light)
        }

        {
            const color = 0xffffff
            const intensity = 3
            const light = new THREE.DirectionalLight(color, intensity)
            light.position.set(1, -2, -4)
            this.scene.add(light)
        }

        this.controls = new OrbitControls(this.camera, this.renderer.domElement)
        this.controls.enableDamping = true // 启用阻尼
        this.controls.dampingFactor = 0.25 // 阻尼因子
        this.controls.enableZoom = true // 启用缩放

        this.doit()
    }

    addObject = (x: number, y: number, obj: any) => {
        obj.position.x = x * this.spread
        obj.position.y = y * this.spread

        this.scene.add(obj)
        this.objects.push(obj)
    }

    createMaterial = () => {
        const material = new THREE.MeshPhongMaterial({
            side: THREE.DoubleSide
        })

        const hue = Math.random()
        const saturation = 1
        const luminance = 0.5
        material.color.setHSL(hue, saturation, luminance)

        return material
    }

    addSolidGeometry = (x: number, y: number, geometry: TextGeometry) => {
        const mesh = new THREE.Mesh(geometry, this.createMaterial())
        this.addObject(x, y, mesh)
    }

    loadFont = (url: string) => {
        const loader = new FontLoader()

        return new Promise((resolve, reject) => {
            loader.load(url, resolve, undefined, reject)
        })
    }

    doit = async () => {
        const font = (await this.loadFont('src/assets/font/Zhi Mang Xing_Regular.json')) as Font
        console.log(typeof font)
        const options = {
            font: font,
            size: 3.0,
            depth: 0.2,
            curveSegments: 1,
            bevelEnabled: true,
            bevelThickness: 0.15,
            bevelSize: 0.1,
            bevelSegments: 8
        }
        const geometry2 = new TextGeometry('一二三四', options)

        const geometry = new TextGeometry('五六七八', options)

        this.addSolidGeometry(-1, 0.25, geometry2)

        const mesh = new THREE.Mesh(geometry, this.createMaterial())
        geometry.computeBoundingBox()
        geometry.boundingBox?.getCenter(mesh.position).multiplyScalar(-1)

        const parent = new THREE.Object3D()
        parent.add(mesh)

        this.addObject(0.5, 0, parent)

        this.render()
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

    render = (time = 0) => {
        time *= 0.001
        if (this.resizeRendererToDisplaySize()) {
            const canvas = this.renderer.domElement
            this.camera.aspect = canvas.clientWidth / canvas.clientHeight
            this.camera.updateProjectionMatrix()
        }

        // this.objects.forEach((obj, ndx) => {
        //     const speed = 0.5 + ndx * 0.05
        //     const rot = time * speed
        //     obj.rotation.x = rot
        //     obj.rotation.y = rot
        // })

        this.renderer.render(this.scene, this.camera)
        requestAnimationFrame(this.render)
        this.controls.update() // 更新控制器
        this.renderer.render(this.scene, this.camera) // 渲染场景
        // requestAnimationFrame(this.render)
    }
}
