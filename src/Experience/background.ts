// 增加背景或天空盒
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

export default class background {
    constructor(el: HTMLCanvasElement) {
        const renderer = new THREE.WebGLRenderer({ antialias: true, canvas: el })

        const fov = 75
        const aspect = 2 // the canvas default
        const near = 0.1
        const far = 100
        const camera = new THREE.PerspectiveCamera(fov, aspect, near, far)
        camera.position.z = 3

        const controls = new OrbitControls(camera, el)
        controls.target.set(0, 0, 0)
        controls.update()

        const scene = new THREE.Scene()

        {
            const color = 0xffffff
            const intensity = 3
            const light = new THREE.DirectionalLight(color, intensity)
            light.position.set(-1, 2, 4)
            scene.add(light)
        }

        const loader = new THREE.TextureLoader()
        const texture = loader.load(
            'https://threejs.org/manual/examples/resources/images/equirectangularmaps/tears_of_steel_bridge_2k.jpg',
            () => {
                texture.mapping = THREE.EquirectangularReflectionMapping
                texture.colorSpace = THREE.SRGBColorSpace
                scene.background = texture
            }
        )

        function resizeRendererToDisplaySize() {
            const canvas = renderer.domElement
            const width = canvas.clientWidth
            const height = canvas.clientHeight
            const needResize = canvas.width !== width || canvas.height !== height
            if (needResize) {
                renderer.setSize(width, height, false)
            }

            return needResize
        }

        function render() {
            if (resizeRendererToDisplaySize()) {
                const canvas = renderer.domElement
                camera.aspect = canvas.clientWidth / canvas.clientHeight
                camera.updateProjectionMatrix()
            }

            renderer.render(scene, camera)

            requestAnimationFrame(render)
        }

        requestAnimationFrame(render)
    }
}
