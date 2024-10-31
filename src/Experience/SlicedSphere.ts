import * as THREE from 'three'

export default class SlicedSphere {
    renderer
    camera
    scene

    constructor(el: HTMLElement) {
        this.renderer = new THREE.WebGLRenderer({ antialias: true, canvas: el })
        this.renderer.setClearColor(0x000000) // 设置背景色

        const fov = 45
        const aspect = window.innerWidth / window.innerHeight
        const near = 0.1
        const far = 100
        this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far)
        this.camera.position.set(0, 0, 15) // 设置相机位置
        this.scene = new THREE.Scene()

        const radius = 5
        const widthSegments = 16
        const heightSegments = 12

        // 创建球体几何体
        const sphereGeometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments)

        // 创建材质
        const materials = [
            new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 }), // 红色
            new THREE.MeshBasicMaterial({ color: 0x00ff00, transparent: true, opacity: 0.5 }), // 绿色
            new THREE.MeshBasicMaterial({ color: 0x0000ff, transparent: true, opacity: 0.5 }) // 蓝色
        ]

        // 创建球体
        const sphere = new THREE.Mesh(sphereGeometry, materials[0])

        // 将球体分割成几个部分（示例：每个部分使用不同的材质）
        const slices = 200 // 切片数
        for (let i = 0; i < slices; i++) {
            const sliceMaterial = materials[i % materials.length] // 根据索引循环选择材质
            const slice = new THREE.Mesh(sphereGeometry, sliceMaterial)
            slice.rotation.y = (i / slices) * Math.PI * 2 // 旋转以分片
            slice.updateMatrix() // 更新矩阵
            sphere.add(slice) // 将切片添加到球体
        }

        this.scene.add(sphere) // 将球体添加到场景中

        this.renderer.setSize(window.innerWidth, window.innerHeight)
        this.render()

        // 响应窗口调整大小
        window.addEventListener('resize', () => {
            const width = window.innerWidth
            const height = window.innerHeight
            this.renderer.setSize(width, height)
            this.camera.aspect = width / height
            this.camera.updateProjectionMatrix()
        })
    }

    render() {
        requestAnimationFrame(() => this.render())
        this.renderer.render(this.scene, this.camera)
    }
}
