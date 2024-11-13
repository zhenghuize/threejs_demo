// 雾的学习
import * as THREE from 'three'

export default class fog {
    renderer
    camera
    scene
    cubes
    constructor(el: HTMLElement) {
        this.renderer = new THREE.WebGLRenderer({ antialias: true, canvas: el })
        this.scene = new THREE.Scene()

        const fov = 75
        const aspect = 2 // the canvas default
        const near = 0.1
        const far = 5
        this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far)
        this.camera.position.z = 2

        {
            const near = 1.1
            const far = 2.9
            const color = 'lightblue'
            this.scene.fog = new THREE.Fog(color, near, far)

            this.scene.background = new THREE.Color(color)
        }

        {
            const color = 0xffffff
            const intensity = 3
            const light = new THREE.DirectionalLight(color, intensity)
            light.position.set(-1, 2, 4)
            this.scene.add(light)
        }

        const boxWidth = 1
        const boxHeight = 1
        const boxDepth = 1
        const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth)

        this.cubes = [
            this.makeInstance(geometry, 0x44aa88, 0),
            this.makeInstance(geometry, 0x8844aa, -2),
            this.makeInstance(geometry, 0xaa8844, 2)
        ]

        this.render(19)
    }

    makeInstance = (geometry: THREE.BoxGeometry, color: number, x: number) => {
        const material = new THREE.MeshPhongMaterial({ color })
        const cube = new THREE.Mesh(geometry, material)
        this.scene.add(cube)
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

        if (this.resizeRendererToDisplaySize()) {
            const canvas = this.renderer.domElement
            this.camera.aspect = canvas.clientWidth / canvas.clientHeight
            this.camera.updateProjectionMatrix()
        }

        this.cubes.forEach((cube, ndx) => {
            const speed = 1 + ndx * 0.1
            const rot = time * speed
            cube.rotation.x = rot
            cube.rotation.y = rot
        })

        this.renderer.render(this.scene, this.camera)

        requestAnimationFrame(this.render)
    }
}
