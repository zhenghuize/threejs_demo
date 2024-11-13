import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GUI } from 'three/addons/libs/lil-gui.module.min.js'

export default class cameraExp {
    canvas
    view1Elem
    view2Elem
    renderer
    camera
    camera2
    cameraHelper
    scene
    constructor() {
        this.canvas = document.querySelector('#canvas-content') as HTMLElement
        this.view1Elem = document.querySelector('#view1') as HTMLElement
        this.view2Elem = document.querySelector('#view2') as HTMLElement
        this.renderer = new THREE.WebGLRenderer({ antialias: true, canvas: this.canvas })

        const fov = 45
        const aspect = 2
        const near = 5
        const far = 100
        this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far)
        this.camera.position.set(0, 10, 20)
        this.cameraHelper = new THREE.CameraHelper(this.camera)

        const gui = new GUI()
        gui.add(this.camera, 'fov', 1, 180)
        const minMaxGUIHelper = new MinMaxGUIHelper(this.camera, 'near', 'far', 0.1)
        gui.add(minMaxGUIHelper, 'min', 0.1, 50, 0.1).name('near')
        gui.add(minMaxGUIHelper, 'max', 0.1, 50, 0.1).name('far')

        const controls = new OrbitControls(this.camera, this.view1Elem)
        controls.target.set(0, 5, 0)
        controls.update()

        this.camera2 = new THREE.PerspectiveCamera(
            60, // fov
            2, // aspect
            0.1, // near
            500 // far
        )
        this.camera2.position.set(40, 10, 30)
        this.camera2.lookAt(0, 5, 0)

        const controls2 = new OrbitControls(this.camera2, this.view2Elem)
        controls2.target.set(0, 5, 0)
        controls2.update()

        this.scene = new THREE.Scene()
        this.scene.background = new THREE.Color('black')
        this.scene.add(this.cameraHelper)

        {
            const planeSize = 40
            const loader = new THREE.TextureLoader()
            const texture = loader.load(
                'https://threejs.org/manual/examples/resources/images/checker.png'
            )
            texture.wrapS = THREE.RepeatWrapping
            texture.wrapT = THREE.RepeatWrapping
            texture.magFilter = THREE.NearestFilter
            texture.colorSpace = THREE.SRGBColorSpace
            const repeats = planeSize / 2
            // 设置纹理在几何体上的重复次数的方法。
            texture.repeat.set(repeats, repeats)

            // THREE.PlaneGeometry：是 Three.js 提供的一个类，用于创建平面几何体。
            // planeSize：是一个参数，指定平面的宽度和高度。
            const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize)
            const planeMat = new THREE.MeshPhongMaterial({
                map: texture,
                side: THREE.DoubleSide //表示材质会在物体的两面都渲染（正面和背面），适用于希望从任何角度都能看到材质的情况，比如平面或薄的几何体。
            })
            const mesh = new THREE.Mesh(planeGeo, planeMat)
            mesh.rotation.x = Math.PI * -0.5
            this.scene.add(mesh)
        }

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
            // THREE.DirectionalLight 是 Three.js 中的一种平行光源，类似于太阳光。它提供的光线是平行的，来自于一个方向，因此在场景中模拟阳光或其他远距离光源时非常有用。
            const color = 0xffffff
            const intensity = 3
            const light = new THREE.DirectionalLight(color, intensity)
            light.position.set(0, 10, 0)
            light.target.position.set(-5, 0, 0)
            this.scene.add(light)
            this.scene.add(light.target)
        }

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

    setScissorForElement = (elem: HTMLElement) => {
        const canvasRect = this.canvas.getBoundingClientRect()
        const elemRect = elem.getBoundingClientRect()

        // 计算画布相对矩形
        const right = Math.min(elemRect.right, canvasRect.right) - canvasRect.left
        const left = Math.max(0, elemRect.left - canvasRect.left)
        const bottom = Math.min(elemRect.bottom, canvasRect.bottom) - canvasRect.top
        const top = Math.max(0, elemRect.top - canvasRect.top)

        const width = Math.min(canvasRect.width, right - left)
        const height = Math.min(canvasRect.height, bottom - top)

        // 将剪刀设置为仅渲染画布的该部分
        const positiveYUpBottom = canvasRect.height - bottom
        this.renderer.setScissor(left, positiveYUpBottom, width, height)
        this.renderer.setViewport(left, positiveYUpBottom, width, height)

        return width / height
    }

    render = () => {
        this.resizeRendererToDisplaySize()

        // 打开剪刀
        this.renderer.setScissorTest(true)

        {
            // 渲染原始视图
            const aspect = this.setScissorForElement(this.view1Elem)
            // 为此调整相机
            this.camera.aspect = aspect
            this.camera.updateProjectionMatrix()
            this.cameraHelper.update()

            this.cameraHelper.visible = false
            // this.scene.background.set(0x000000)

            this.renderer.render(this.scene, this.camera)
        }

        {
            const aspect = this.setScissorForElement(this.view2Elem)

            // adjust the camera for this aspect
            this.camera2.aspect = aspect
            this.camera2.updateProjectionMatrix()

            // 在第二个视图中绘制摄影机辅助对象
            this.cameraHelper.visible = true
            this.cameraHelper.update()

            // this.scene.background.set(0x000040)

            this.renderer.render(this.scene, this.camera2)
        }

        requestAnimationFrame(this.render)
    }
}

class MinMaxGUIHelper {
    obj
    minProp
    maxProp
    minDif
    constructor(obj: any, minProp: any, maxProp: any, minDif: any) {
        this.obj = obj
        this.minProp = minProp
        this.maxProp = maxProp
        this.minDif = minDif
    }

    get min() {
        return this.obj[this.minProp]
    }
    set min(v) {
        this.obj[this.minProp] = v
        this.obj[this.maxProp] = Math.max(this.obj[this.maxProp], v + this.minDif)
    }
    get max() {
        return this.obj[this.maxProp]
    }
    set max(v) {
        this.obj[this.maxProp] = v
        this.min = this.min // this will call the min setter
    }
}
