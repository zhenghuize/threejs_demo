import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

export default class Radius {
    renderer
    scene
    controls
    camera
    constructor(el: HTMLElement) {
        this.renderer = new THREE.WebGLRenderer({ antialias: true, canvas: el })

        const fov = 45
        const aspect = window.innerWidth / window.innerHeight
        const near = 0.1
        const far = 100
        this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far)
        this.camera.position.set(0, 0, 30)
        this.scene = new THREE.Scene()

        const radius = 7
        const widthSegments = 12
        const heightSegments = 2
        // 创建球体几何体
        const geometry = new THREE.DodecahedronGeometry(radius, 1)
        // 定义点的材质
        const material = new THREE.LineBasicMaterial({ color: 'red' })
        // 绘制点
        const points = new THREE.LineSegments(geometry, material)

        this.scene.add(points)
        this.renderer.setSize(window.innerWidth, window.innerHeight)
        // this.renderer.render(this.scene, camera)

        this.controls = new OrbitControls(this.camera, this.renderer.domElement)
        this.controls.enableDamping = true // 启用阻尼
        this.controls.dampingFactor = 0.25 // 阻尼因子
        this.controls.enableZoom = true // 启用缩放

        // const animate = () => {
        //     requestAnimationFrame(animate)
        //     points.rotation.y += 0.01 // 旋转点云
        //     this.renderer.render(this.scene, camera)
        // }

        // animate()
        this.renderer.render(this.scene, this.camera)

        window.addEventListener('resize', () => {
            const width = window.innerWidth
            const height = window.innerHeight
            console.log(width, height)
            this.renderer.setSize(width, height)
            this.camera.aspect = width / height
            this.camera.updateProjectionMatrix()
        })

        this.render()
    }

    render = () => {
        requestAnimationFrame(this.render)
        this.controls.update() // 更新控制器
        this.renderer.render(this.scene, this.camera) // 渲染场景
    }
}
