import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/Addons.js'
import GUI from 'three/examples/jsm/libs/lil-gui.module.min.js'

export default class loadGLTF {
    renderer
    scene
    camera
    cars: any[] = []
    curve
    carPosition = new THREE.Vector3()
    carTarget = new THREE.Vector3()
    curveObject: any
    constructor(el: HTMLCanvasElement) {
        this.renderer = new THREE.WebGLRenderer({ antialias: true, canvas: el })
        this.renderer.shadowMap.enabled = true

        const fov = 45
        const aspect = 2 // the canvas default
        const near = 0.1
        const far = 100
        this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far)
        this.camera.position.set(0, 10, 20)

        const controls = new OrbitControls(this.camera, el)
        controls.target.set(0, 5, 0)
        controls.update()

        this.scene = new THREE.Scene()
        this.scene.background = new THREE.Color('#DEFEFF')

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
            texture.repeat.set(repeats, repeats)

            const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize)
            const planeMat = new THREE.MeshPhongMaterial({
                map: texture,
                side: THREE.DoubleSide
            })

            const mesh = new THREE.Mesh(planeGeo, planeMat)
            mesh.rotation.x = Math.PI * -0.5
            this.scene.add(mesh)
        }

        {
            const skyColor = 0xb1e1ff // light blue
            const groundColor = 0xb97a20 // brownish orange
            const intensity = 2
            // 模拟来自天空和地面的双向光照。它提供了一种柔和的、全局的照明效果，适合模拟户外场景中的环境光
            const light = new THREE.HemisphereLight(skyColor, groundColor, intensity)
            this.scene.add(light)
        }

        {
            const color = 0xffffff
            const intensity = 2.5
            // 模拟太阳光的光源类型
            const light = new THREE.DirectionalLight(color, intensity)

            light.castShadow = true
            light.position.set(-250, 800, -850)
            light.target.position.set(-550, 40, -450)

            light.shadow.bias = -0.004
            light.shadow.mapSize.width = 2048
            light.shadow.mapSize.height = 2048

            light.position.set(5, 10, 2)
            this.scene.add(light)
            this.scene.add(light.target)

            const cam = light.shadow.camera
            cam.near = 1
            cam.far = 2000
            cam.left = -1500
            cam.right = 1500
            cam.top = 1500
            cam.bottom = -1500

            const cameraHelper = new THREE.CameraHelper(cam)
            this.scene.add(cameraHelper)
            cameraHelper.visible = false
            const helper = new THREE.DirectionalLightHelper(light, 100)
            this.scene.add(helper)
            helper.visible = false

            function makeXYZGUI(gui, vector3, name, onChangeFn) {
                const folder = gui.addFolder(name)
                folder.add(vector3, 'x', vector3.x - 500, vector3.x + 500).onChange(onChangeFn)
                folder.add(vector3, 'y', vector3.y - 500, vector3.y + 500).onChange(onChangeFn)
                folder.add(vector3, 'z', vector3.z - 500, vector3.z + 500).onChange(onChangeFn)
                folder.open()
            }

            function updateCamera() {
                // update the light target's matrixWorld because it's needed by the helper
                light.updateMatrixWorld()
                light.target.updateMatrixWorld()
                helper.update()
                // update the light's shadow camera's projection matrix
                light.shadow.camera.updateProjectionMatrix()
                // and now update the camera helper we're using to show the light's shadow camera
                cameraHelper.update()
            }

            updateCamera()

            class DimensionGUIHelper {
                obj
                minProp
                maxProp
                constructor(obj, minProp, maxProp) {
                    this.obj = obj
                    this.minProp = minProp
                    this.maxProp = maxProp
                }
                get value() {
                    return this.obj[this.maxProp] * 2
                }
                set value(v) {
                    this.obj[this.maxProp] = v / 2
                    this.obj[this.minProp] = v / -2
                }
            }

            class MinMaxGUIHelper {
                obj
                minProp
                maxProp
                minDif
                constructor(obj, minProp, maxProp, minDif) {
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

            class VisibleGUIHelper {
                constructor(...objects) {
                    this.objects = [...objects]
                }
                get value() {
                    return this.objects[0].visible
                }
                set value(v) {
                    this.objects.forEach((obj) => {
                        obj.visible = v
                    })
                }
            }

            const gui = new GUI()
            gui.close()
            gui.add(new VisibleGUIHelper(helper, cameraHelper), 'value').name('show helpers')
            gui.add(light.shadow, 'bias', -0.1, 0.1, 0.001)
            {
                const folder = gui.addFolder('Shadow Camera')
                folder.open()
                folder
                    .add(
                        new DimensionGUIHelper(light.shadow.camera, 'left', 'right'),
                        'value',
                        1,
                        4000
                    )
                    .name('width')
                    .onChange(updateCamera)
                folder
                    .add(
                        new DimensionGUIHelper(light.shadow.camera, 'bottom', 'top'),
                        'value',
                        1,
                        4000
                    )
                    .name('height')
                    .onChange(updateCamera)
                const minMaxGUIHelper = new MinMaxGUIHelper(light.shadow.camera, 'near', 'far', 0.1)
                folder.add(minMaxGUIHelper, 'min', 1, 1000, 1).name('near').onChange(updateCamera)
                folder.add(minMaxGUIHelper, 'max', 1, 4000, 1).name('far').onChange(updateCamera)
                folder.add(light.shadow.camera, 'zoom', 0.01, 1.5, 0.01).onChange(updateCamera)
            }

            makeXYZGUI(gui, light.position, 'position', updateCamera)
            makeXYZGUI(gui, light.target.position, 'target', updateCamera)
        }

        {
            const controlPoints = [
                [1.118281, 5.115846, -3.681386],
                [3.948875, 5.115846, -3.641834],
                [3.960072, 5.115846, -0.240352],
                [3.985447, 5.115846, 4.585005],
                [-3.793631, 5.115846, 4.585006],
                [-3.826839, 5.115846, -14.7362],
                [-14.542292, 5.115846, -14.765865],
                [-14.520929, 5.115846, -3.627002],
                [-5.452815, 5.115846, -3.634418],
                [-5.467251, 5.115846, 4.549161],
                [-13.266233, 5.115846, 4.567083],
                [-13.250067, 5.115846, -13.499271],
                [4.081842, 5.115846, -13.435463],
                [4.125436, 5.115846, -5.334928],
                [-14.521364, 5.115846, -5.239871],
                [-14.510466, 5.115846, 5.486727],
                [5.745666, 5.115846, 5.510492],
                [5.787942, 5.115846, -14.728308],
                [-5.42372, 5.115846, -14.761919],
                [-5.373599, 5.115846, -3.704133],
                [1.004861, 5.115846, -3.641834]
            ]
            const p0 = new THREE.Vector3()
            const p1 = new THREE.Vector3()

            this.curve = new THREE.CatmullRomCurve3(
                controlPoints
                    .map((p, ndx) => {
                        p0.set(...p)
                        p1.set(...controlPoints[(ndx + 1) % controlPoints.length])
                        return [
                            new THREE.Vector3().copy(p0),
                            new THREE.Vector3().lerpVectors(p0, p1, 0.1),
                            new THREE.Vector3().lerpVectors(p0, p1, 0.9)
                        ]
                    })
                    .flat(),
                true
            )

            {
                const points = this.curve.getPoints(250)
                const geometry = new THREE.BufferGeometry().setFromPoints(points)
                const material = new THREE.LineBasicMaterial({ color: 0xff0000 })
                this.curveObject = new THREE.Line(geometry, material)
                this.curveObject.scale.set(100, 100, 100)
                this.curveObject.position.y = -621
                this.curveObject.visible = false
                material.depthTest = false
                this.curveObject.renderOrder = 1
                this.scene.add(this.curveObject)
                console.log(this.curveObject, this.curve)
            }
        }

        {
            const gltfLoader = new GLTFLoader()
            gltfLoader.load(
                'https://threejs.org/manual/examples/resources/models/cartoon_lowpoly_small_city_free_pack/scene.gltf',
                (gltf) => {
                    const root = gltf.scene
                    this.scene.add(root)
                    console.log(root)

                    root.traverse((obj) => {
                        if (obj.castShadow !== undefined) {
                            obj.castShadow = true
                            obj.receiveShadow = true
                        }
                    })

                    // console.log('first', this.dumpObject(root))
                    const loaderCars = root.getObjectByName('Cars')
                    const fixes = [
                        { prefix: 'Car_08', y: 0, rot: [Math.PI * 0.5, 0, Math.PI * 0.5] },
                        { prefix: 'CAR_03', y: 33, rot: [0, Math.PI, 0] },
                        { prefix: 'Car_04', y: 40, rot: [0, Math.PI, 0] }
                    ]
                    console.log(this.cars)

                    root.updateMatrixWorld()
                    if (loaderCars?.children) {
                        for (const car of loaderCars.children.slice()) {
                            // 查找对应name的prefix数据
                            const fix = fixes.find((fix) => car.name.startsWith(fix.prefix))
                            const obj = new THREE.Object3D()
                            car.getWorldPosition(obj.position)
                            car.position.set(0, fix.y, 0)
                            car.rotation.set(...fix.rot)
                            obj.add(car)
                            this.scene.add(obj)
                            this.cars.push(obj)
                        }
                    }

                    const box = new THREE.Box3().setFromObject(root)
                    const boxSize = box.getSize(new THREE.Vector3()).length()
                    const boxCenter = box.getCenter(new THREE.Vector3())

                    this.frameArea(boxSize * 0.5, boxSize, boxCenter, this.camera)

                    controls.maxDistance = boxSize * 10
                    controls.target.copy(boxCenter)
                    controls.update()
                }
            )
        }

        this.render(1)
    }

    dumpObject = (
        obj: THREE.Group<THREE.Object3DEventMap>,
        lines: any[] = [],
        isLast: boolean = true,
        prefix: string = ''
    ) => {
        const localPrefix = isLast ? '└─' : '├─'
        lines.push(`${prefix}${prefix ? localPrefix : ''}${obj.name || '*no-name*'} [${obj.type}]`)
        const newPrefix = prefix + (isLast ? '  ' : '│ ')
        const lastNdx = obj.children.length - 1
        // console.log('obj-name', obj.name)
        obj.children.forEach((child: any, ndx: number) => {
            const isLast = ndx === lastNdx
            // console.log('lines', child, isLast, newPrefix)

            this.dumpObject(child, lines, isLast, newPrefix)
        })
        return lines
    }

    frameArea(
        sizeToFitOnScreen: number,
        boxSize: number,
        boxCenter: THREE.Vector3Like,
        camera: THREE.PerspectiveCamera
    ) {
        const halfSizeToFitOnScreen = sizeToFitOnScreen * 0.5 // 高度一半
        const halfFovY = THREE.MathUtils.degToRad(camera.fov * 0.5) // 是个锥形，所以角度获取一半是三角形的角度
        const distance = halfSizeToFitOnScreen / Math.tan(halfFovY)

        // 计算指向相机当前方向的单位向量
        // 在 xz 平面中从盒子的中心
        const direction = new THREE.Vector3()
            .subVectors(camera.position, boxCenter)
            .multiply(new THREE.Vector3(1, 0, 1))
            .normalize()

        // 将相机移动到距离中心一定单位的位置
        // 无论相机距离中心有多远
        camera.position.copy(direction.multiplyScalar(distance).add(boxCenter))

        // 为视锥体选择一些近值和远值
        // 将包含该框。
        camera.near = boxSize / 100
        camera.far = boxSize * 100

        camera.updateProjectionMatrix()

        // 将相机指向盒子的中心
        camera.lookAt(boxCenter.x, boxCenter.y, boxCenter.z)
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

        // for (const cars of this.cars) {
        //     cars.rotation.y = time
        // }
        {
            const pathTime = time * 0.01
            const targetOffset = 0.01
            this.cars.forEach((car, ndx) => {
                // 一个介于0和1之间的数字，用于均匀间隔汽车
                const u = pathTime + ndx / this.cars.length

                // 获取第一个点 获取曲线 u 参数位置的点。
                this.curve.getPointAt(u % 1, this.carPosition)
                this.carPosition.applyMatrix4(this.curveObject.matrixWorld)

                // 曲线在远点获取第二个点
                this.curve.getPointAt((u + targetOffset) % 1, this.carTarget)
                this.carTarget.applyMatrix4(this.curveObject.matrixWorld)

                // 将汽车设置在第一个点上
                car.position.copy(this.carPosition)

                // 使汽车朝向目标点
                car.lookAt(this.carTarget)

                // 将汽车的位置设置在两个点之间（平滑运动）
                car.position.lerpVectors(this.carPosition, this.carTarget, 0.5)
                // console.log(this.curve.getPointAt(u % 1, this.carPosition))
            })
        }

        this.renderer.render(this.scene, this.camera)

        requestAnimationFrame(this.render)
    }
}
