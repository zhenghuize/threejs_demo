import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js'
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js'
import GUI from 'three/examples/jsm/libs/lil-gui.module.min.js'

export default class loadObj {
    renderer
    scene
    camera
    constructor(el: HTMLCanvasElement) {
        this.renderer = new THREE.WebGLRenderer({ antialias: true, canvas: el })

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
        this.scene.background = new THREE.Color('black')

        {
            const planeSize = 4000

            const loader = new THREE.TextureLoader()
            const texture = loader.load(
                'https://threejs.org/manual/examples/resources/images/checker.png'
            )
            texture.colorSpace = THREE.SRGBColorSpace
            texture.wrapS = THREE.RepeatWrapping
            texture.wrapT = THREE.RepeatWrapping
            texture.magFilter = THREE.NearestFilter
            const repeats = planeSize / 200
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
            const intensity = 3
            const light = new THREE.HemisphereLight(skyColor, groundColor, intensity)
            this.scene.add(light)
        }

        {
            const color = 0xffffff
            const intensity = 3
            const light = new THREE.DirectionalLight(color, intensity)
            light.position.set(5, 10, 2)
            this.scene.add(light)
            this.scene.add(light.target)
        }

        {
            const mtlLoader = new MTLLoader()

            mtlLoader.load(
                'https://threejs.org/manual/examples/resources/models/windmill/windmill.mtl',
                (mtl) => {
                    mtl.preload()
                    const objLoader = new OBJLoader()
                    objLoader.setMaterials(mtl)
                    objLoader.load(
                        'https://threejs.org/manual/examples/resources/models/windmill/windmill.obj',
                        (root) => {
                            root.position.set(0, 0, 10)
                            // 创建 GUI 控制面板
                            const gui = new GUI()

                            // 创建控制对象
                            const objPosition = {
                                x: 0,
                                y: 0,
                                z: 0
                            }

                            // 添加位置调整到 GUI 面板
                            gui.add(objPosition, 'x', -10, 10).onChange((value: number) => {
                                root.position.x = value
                            })
                            gui.add(objPosition, 'y', -10, 10).onChange((value: number) => {
                                root.position.y = value
                            })
                            gui.add(objPosition, 'z', -10, 10).onChange((value: number) => {
                                root.position.z = value
                            })
                            this.scene.add(root)
                        }
                    )
                }
            )
        }

        {
            const mtlLoader = new MTLLoader()
            mtlLoader.load(
                'https://threejs.org/manual/examples/resources/models/windmill_2/windmill-fixed.mtl',
                (mtl) => {
                    mtl.preload()
                    const objLoader = new OBJLoader()
                    objLoader.setMaterials(mtl)
                    objLoader.load(
                        'https://threejs.org/manual/examples/resources/models/windmill_2/windmill.obj',
                        (root) => {
                            this.scene.add(root)

                            // 计算包含所有内容的盒子
                            // 从根目录及以下
                            const box = new THREE.Box3().setFromObject(root)

                            const boxSize = box.getSize(new THREE.Vector3()).length()
                            const boxCenter = box.getCenter(new THREE.Vector3())

                            // 设置相机来框住盒子
                            this.frameArea(boxSize * 1.2, boxSize, boxCenter, this.camera)

                            // 更新轨迹球控件来处理新的尺寸
                            controls.maxDistance = boxSize * 10
                            controls.target.copy(boxCenter)
                            controls.update()
                        }
                    )
                }
            )
        }

        this.render()
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
