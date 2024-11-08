// 矩阵区域光
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GUI } from 'three/addons/libs/lil-gui.module.min.js'
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js'
import { RectAreaLightHelper } from 'three/addons/helpers/RectAreaLightHelper.js'

export default class areaLight {
    renderer
    camera
    controls
    scene
    light
    lightHelper
    constructor(el: HTMLElement) {
        this.renderer = new THREE.WebGLRenderer({ antialias: true, canvas: el })
        RectAreaLightUniformsLib.init()

        const fov = 40 // 视野
        const aspect = 2 // canvas 的默认宽高 300:150
        const near = 0.1 // 视锥的前端
        const far = 500 // 视锥的后端
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
        const planeMat = new THREE.MeshStandardMaterial({
            map: texture,
            side: THREE.DoubleSide
        })
        const mesh = new THREE.Mesh(planeGeo, planeMat)
        mesh.rotation.x = Math.PI * -0.5
        this.scene.add(mesh)

        {
            const cubeSize = 4
            const cubeGeo = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize)
            const cubeMat = new THREE.MeshStandardMaterial({ color: '#8AC' })
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
            const sphereMat = new THREE.MeshStandardMaterial({ color: '#CA8' })
            const mesh = new THREE.Mesh(sphereGeo, sphereMat)
            mesh.position.set(-sphereRadius - 1, sphereRadius + 2, 0)
            this.scene.add(mesh)
        }

        {
            // 聚光灯
            const color = 0xffffff
            const intensity = 10
            const width = 12
            const height = 6
            this.light = new THREE.RectAreaLight(color, intensity, width, height)
            this.light.position.set(0, 10, 0)
            this.light.rotation.x = THREE.MathUtils.degToRad(-90)
            this.scene.add(this.light)

            this.lightHelper = new RectAreaLightHelper(this.light)
            this.light.add(this.lightHelper)

            const gui = new GUI()
            gui.addColor(new ColorGUIHelper(this.light, 'color'), 'value').name('color')
            gui.add(this.light, 'intensity', 0, 10, 0.01)
            gui.add(this.light, 'width', 0, 20)
            gui.add(this.light, 'height', 0, 20)
            gui.add(new DegRadHelper(this.light.rotation, 'x'), 'value', -180, 180).name(
                'x rotation'
            )
            gui.add(new DegRadHelper(this.light.rotation, 'y'), 'value', -180, 180).name(
                'y rotation'
            )
            gui.add(new DegRadHelper(this.light.rotation, 'z'), 'value', -180, 180).name(
                'z rotation'
            )

            this.makeXYZGUI(gui, this.light.position, 'position', this.updateLight)
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

    updateLight = () => {
        // this.light.target.updateMatrixWorld()
        // this.lightHelper.update()
    }

    makeXYZGUI = (
        gui: GUI,
        vector3: THREE.Vector3,
        name: string,
        onChangeFn: { (): void; (): void }
    ) => {
        const folder = gui.addFolder(name)
        folder.add(vector3, 'x', -10, 10).onChange(onChangeFn)
        folder.add(vector3, 'y', 0, 10).onChange(onChangeFn)
        folder.add(vector3, 'z', -10, 10).onChange(onChangeFn)
        folder.open()
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

class DegRadHelper {
    obj
    prop
    constructor(obj: any, prop: string) {
        this.obj = obj
        this.prop = prop
    }
    get value() {
        return THREE.MathUtils.radToDeg(this.obj[this.prop])
    }
    set value(v) {
        this.obj[this.prop] = THREE.MathUtils.degToRad(v)
    }
}
