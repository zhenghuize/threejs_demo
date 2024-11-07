// 纹理

import * as THREE from 'three'
export default class textureClass {
    scene
    renderer
    camera
    cubes: any[]
    loader
    constructor(el: HTMLElement) {
        this.renderer = new THREE.WebGLRenderer({ antialias: true, canvas: el })

        const fov = 75
        const aspect = 2
        const near = 0.1
        const far = 10
        this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far)
        this.camera.position.z = 2

        this.scene = new THREE.Scene()

        const boxWidth = 1
        const boxHeight = 1
        const boxDepth = 1
        const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth)

        this.cubes = []
        const loadManager = new THREE.LoadingManager()
        this.loader = new THREE.TextureLoader(loadManager)

        // const texture = this.loader.load(
        //     'https://threejs.org/manual/examples/resources/images/wall.jpg'
        // )
        // 主要用于处理颜色空间的转换，特别是在渲染图形时,主要用于处理颜色空间的转换，特别是在渲染图形时。
        // texture.colorSpace = THREE.SRGBColorSpace

        // const material = new THREE.MeshBasicMaterial({
        //     map: texture
        // })
        const materials = [
            new THREE.MeshBasicMaterial({
                map: this.loadColorTexture(
                    'https://threejs.org/manual/resources/images/mip-low-res-enlarged.png'
                )
            }),
            new THREE.MeshBasicMaterial({
                map: this.loadColorTexture(
                    'https://threejs.org/manual/resources/images/mip-low-res-enlarged.png'
                )
            }),
            new THREE.MeshBasicMaterial({
                map: this.loadColorTexture(
                    'https://threejs.org/manual/resources/images/mip-low-res-enlarged.png'
                )
            }),
            new THREE.MeshBasicMaterial({
                map: this.loadColorTexture(
                    'https://threejs.org/manual/resources/images/mip-low-res-enlarged.png'
                )
            }),
            new THREE.MeshBasicMaterial({
                map: this.loadColorTexture(
                    'https://threejs.org/manual/resources/images/mip-low-res-enlarged.png'
                )
            }),
            new THREE.MeshBasicMaterial({
                map: this.loadColorTexture(
                    'https://threejs.org/manual/resources/images/mip-low-res-enlarged.png'
                )
            })
        ]
        loadManager.onLoad = () => {
            const cube = new THREE.Mesh(geometry, materials)
            this.scene.add(cube)
            this.cubes.push(cube)
        }

        // this.renderer.render(this.scene, this.camera)

        this.render(2)
    }
    loadColorTexture = (path: string) => {
        const texture = this.loader.load(path)
        texture.colorSpace = THREE.SRGBColorSpace
        return texture
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
        time *= 0.002

        if (this.resizeRendererToDisplaySize()) {
            const canvas = this.renderer.domElement
            this.camera.aspect = canvas.clientWidth / canvas.clientHeight
            this.camera.updateProjectionMatrix()
        }

        this.cubes.forEach((cube, ndx) => {
            const speed = 0.2 + ndx * 0.1
            const rot = time * speed
            cube.rotation.x = rot
            cube.rotation.y = rot
        })

        this.renderer.render(this.scene, this.camera)

        requestAnimationFrame(this.render)
    }
}
