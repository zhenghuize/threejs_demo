import * as THREE from 'three'

export default class Experience {
    constructor(el: HTMLElement) {
        const canvas = document.querySelector('#c')
        const renderer = new THREE.WebGLRenderer({ antialias: true, canvas: el })

        const fov = 120
        const aspect = 2 // the canvas default
        const near = 0.1
        const far = 5
        const camera = new THREE.PerspectiveCamera(fov, aspect, near, far)
        camera.position.z = 2

        const scene = new THREE.Scene()

        {
            const color = 0xffffff
            const intensity = 3
            const light = new THREE.DirectionalLight(color, intensity)
            light.position.set(-1, 2, 4)
            scene.add(light)
        }

        const boxWidth = 1
        const boxHeight = 1
        const boxDepth = 1
        const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth)

        function makeInstance(geometry: THREE.BoxGeometry, color: number, x: number) {
            const material = new THREE.MeshPhongMaterial({ color })

            const cube = new THREE.Mesh(geometry, material)
            scene.add(cube)

            cube.position.x = x

            return cube
        }

        const cubes = [
            makeInstance(geometry, 0x44aa88, 0),
            makeInstance(geometry, 0x8844aa, -2),
            makeInstance(geometry, 0xaa8844, 2)
        ]

        function resizeRendererToDisplaySize(renderer: THREE.WebGLRenderer) {
            const canvas = renderer.domElement
            const pixelRatio = window.devicePixelRatio
            const width = Math.floor(canvas.clientWidth * pixelRatio)
            const height = Math.floor(canvas.clientHeight * pixelRatio)
            const needResize = canvas.width !== width || canvas.height !== height
            if (needResize) {
                renderer.setSize(width, height, false)
            }

            return needResize
        }

        function render(time: number) {
            time *= 0.001

            if (resizeRendererToDisplaySize(renderer)) {
                const canvas = renderer.domElement
                camera.aspect = canvas.clientWidth / canvas.clientHeight
                camera.updateProjectionMatrix()
            }

            cubes.forEach((cube, ndx) => {
                const speed = 1 + ndx * 0.1
                const rot = time * speed
                cube.rotation.x = rot
                cube.rotation.y = rot
            })

            renderer.render(scene, camera)
            renderer.setPixelRatio(window.devicePixelRatio)

            requestAnimationFrame(render)
        }

        requestAnimationFrame(render)
    }

    init() {}
}
