import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

export default class Line {
    renderer
    camera
    scene
    controls
    constructor(el: HTMLElement) {
        this.renderer = new THREE.WebGLRenderer({ antialias: true, canvas: el })

        const fov = 45
        const aspect = window.innerWidth / window.innerHeight
        const near = 0.1
        const far = 100
        this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far)
        this.camera.position.set(0, 0, 30)
        this.scene = new THREE.Scene()

        const size = 8
        const widthSegments = 2
        const heightSegments = 2
        const depthSegments = 2
        const boxGeometry = new THREE.BoxGeometry(
            size,
            size,
            size,
            widthSegments,
            heightSegments,
            depthSegments
        )
        const geometry = new THREE.EdgesGeometry(boxGeometry)

        // 创建边缘线材质
        const edgesMaterial = new THREE.LineBasicMaterial({ color: 0xffffff })
        const edges = new THREE.LineSegments(geometry, edgesMaterial) // 使用线段绘制边缘

        this.controls = new OrbitControls(this.camera, this.renderer.domElement)
        this.controls.enableDamping = true // 启用阻尼
        this.controls.dampingFactor = 0.25 // 阻尼因子
        this.controls.enableZoom = true // 启用缩放

        this.scene.add(edges) // 将边缘添加到场景中

        this.renderer.setSize(window.innerWidth, window.innerHeight)

        this.render()
    }

    render = () => {
        requestAnimationFrame(this.render)
        this.controls.update() // 更新控制器
        this.renderer.render(this.scene, this.camera) // 渲染场景
    }
}
