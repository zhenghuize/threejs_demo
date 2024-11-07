import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GUI } from 'three/addons/libs/lil-gui.module.min.js'

export default class lightExp {
    renderer
    camera
    controls
    scene
    constructor(el: HTMLElement) {
        this.renderer = new THREE.WebGLRenderer({ antialias: true, canvas: el })

        const fov = 45
        const aspect = 2 // canvas 的默认宽高 300:150
        const near = 0.1
        const far = 500
        this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far)
        this.camera.position.set(0, 10, 20)

        this.scene = new THREE.Scene()
        this.scene.background = new THREE.Color('black')

        this.controls = new OrbitControls(this.camera, el)
        this.controls.target.set(0, 5, 0)
        this.controls.update()

        const planeSize = 40
        const loader = new THREE.TextureLoader()
        const texture = loader.load(
            'https://threejs.org/manual/examples/resources/images/checker.png'
        )
        // 控制纹理在水平方向（S 轴水平轴）上的环绕模式，使用 重复 模式，即纹理会按周期重复。
        texture.wrapS = THREE.RepeatWrapping
        // 控制纹理在垂直方向（T 轴垂直轴）上的环绕模式，使用 重复 模式。
        texture.wrapT = THREE.RepeatWrapping
        // 控制纹理放大时的过滤方式，采用 最近邻过滤，可能会导致图像粗糙或像素化。
        texture.magFilter = THREE.NearestFilter
        texture.colorSpace = THREE.SRGBColorSpace
        const repeats = planeSize / 2
        texture.repeat.set(repeats, repeats)

        const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize)
        const planeMat = new THREE.MeshPhongMaterial({
            map: texture,
            side: THREE.DoubleSide
        })
        const mesh = new THREE.Mesh(planeGeo, planeMat)
        mesh.rotation.x = Math.PI * -0.5
        this.scene.add(mesh)

        {
            const cubeSize = 4
            const cubeGeo = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize)
            const cubeMat = new THREE.MeshPhongMaterial({ color: '#8AC' })
            const mesh = new THREE.Mesh(cubeGeo, cubeMat)
            mesh.position.set(cubeSize + 1, cubeSize / 2, 0)
            this.scene.add(mesh)
        }
        {
            const sphereRadius = 3
            const sphereWidthDivisions = 32
            const sphereHeightDivisions = 16
            const sphereGeo = new THREE.SphereGeometry(
                sphereRadius,
                sphereWidthDivisions,
                sphereHeightDivisions
            )
            const sphereMat = new THREE.MeshPhongMaterial({ color: '#CA8' })
            const mesh = new THREE.Mesh(sphereGeo, sphereMat)
            mesh.position.set(-sphereRadius - 1, sphereRadius + 2, 0)
            this.scene.add(mesh)
        }

        {
            // const color = 0xffffff
            const skyColor = 0xb1e1ff // light blue
            const groundColor = 0xb97a20 // brownish orange
            const intensity = 1
            // const light = new THREE.AmbientLight(color, intensity)
            const light = new THREE.HemisphereLight(skyColor, groundColor, intensity) // 半球光
            this.scene.add(light)

            const gui = new GUI()
            // gui.addColor(new ColorGUIHelper(light, 'color'), 'value').name('color')
            gui.addColor(new ColorGUIHelper(light, 'color'), 'value').name('skyColor')
            gui.addColor(new ColorGUIHelper(light, 'groundColor'), 'value').name('groundColor')
            gui.add(light, 'intensity', 0, 5, 0.01)
        }

        // this.renderer.render(this.scene, this.camera)
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

    render = () => {
        if (this.resizeRendererToDisplaySize()) {
            const canvas = this.renderer.domElement
            this.camera.aspect = canvas.clientWidth / canvas.clientHeight
            this.camera.updateProjectionMatrix()
        }

        this.renderer.render(this.scene, this.camera)

        requestAnimationFrame(this.render)
    }
}

class ColorGUIHelper {
    object
    prop
    constructor(object: any, prop: any) {
        this.object = object
        this.prop = prop
    }
    get value() {
        return `#${this.object[this.prop].getHexString()}`
    }
    set value(hexString) {
        this.object[this.prop].set(hexString)
    }
}
