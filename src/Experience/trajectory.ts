import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

export default class trajectory {
    constructor(el: HTMLElement) {
        console.log(el)
        const canvas = document.querySelector('#c')
        const renderer = new THREE.WebGLRenderer({ antialias: true, canvas: el })

        const fov = 45
        const aspect = 2 // the canvas default
        const near = 0.1
        const far = 10000
        const camera = new THREE.PerspectiveCamera(fov, aspect, near, far)
        camera.position.set(0, 1000, 2000)

        const controls = new OrbitControls(camera, el)
        controls.target.set(0, 5, 0)
        controls.update()

        const scene = new THREE.Scene()
        scene.background = new THREE.Color('black')

        scene.add(new THREE.GridHelper(5000, 10))

        let curve: THREE.CatmullRomCurve3
        let curveObject: THREE.Object3D<THREE.Object3DEventMap>
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
            // 使用 controlPoints 创建了一个 THREE.CatmullRomCurve3 曲线对象：
            curve = new THREE.CatmullRomCurve3(
                // p0 和 p1 是用来定义每对相邻控制点之间的线段。
                controlPoints
                    .map((p, ndx) => {
                        p0.set(...p) // 将当前控制点设置为 `p0`
                        p1.set(...controlPoints[(ndx + 1) % controlPoints.length]) // 获取下一个控制点 p1
                        return [
                            new THREE.Vector3().copy(p0), // 当前控制点
                            new THREE.Vector3().lerpVectors(p0, p1, 0.1), // 当前控制点
                            new THREE.Vector3().lerpVectors(p0, p1, 0.9) // 当前控制点
                        ]
                    })
                    .flat(), // 将嵌套数组展开成一个平铺的数组
                false // 环绕闭合曲线
            )
            {
                // 使用曲线生成一个 Line 对象来可视化这条曲线。
                const points = curve.getPoints(250) // 获取250个插值点
                const geometry = new THREE.BufferGeometry().setFromPoints(points) // 通过插值点创建几何体
                const material = new THREE.LineBasicMaterial({ color: 0xff0000 }) // 设置红色线条材质
                curveObject = new THREE.Line(geometry, material) // 创建曲线对象
                curveObject.scale.set(100, 100, 100) // 设置缩放
                curveObject.position.y = -621 // 设置位置
                material.depthTest = false // 关闭深度测试
                curveObject.renderOrder = 1 // 设置渲染顺序，确保渲染顺序
                scene.add(curveObject) // 将该曲线对象添加到场景中
            }
        }

        const geometry = new THREE.BoxGeometry(100, 100, 300)
        const material = new THREE.MeshBasicMaterial({ color: 'cyan' })
        const cars: THREE.Mesh<
            THREE.BoxGeometry,
            THREE.MeshBasicMaterial,
            THREE.Object3DEventMap
        >[] = []
        for (let i = 0; i < 10; ++i) {
            const mesh = new THREE.Mesh(geometry, material)
            scene.add(mesh)
            cars.push(mesh)
        }

        // create 2 Vector3s we can use for path calculations
        const carPosition = new THREE.Vector3()
        const carTarget = new THREE.Vector3()

        const resizeRendererToDisplaySize = (renderer: THREE.WebGLRenderer) => {
            const canvas = renderer.domElement
            const width = canvas.clientWidth
            const height = canvas.clientHeight
            const needResize = canvas.width !== width || canvas.height !== height
            if (needResize) {
                renderer.setSize(width, height, false)
            }

            return needResize
        }

        function render(time: number) {
            time *= 0.001 // convert to seconds

            if (resizeRendererToDisplaySize(renderer)) {
                const canvas = renderer.domElement
                camera.aspect = canvas.clientWidth / canvas.clientHeight
                camera.updateProjectionMatrix()
            }
            {
                const pathTime = time * 0.01
                const targetOffset = 0.01
                cars.forEach((car, ndx) => {
                    // 一个介于0和1之间的数字来均匀地间隔汽车
                    const u = pathTime + ndx / cars.length

                    // 拿到第一个点位
                    curve.getPointAt(u % 1, carPosition)
                    carPosition.applyMatrix4(curveObject.matrixWorld)

                    // 在曲线稍微向下的地方得到第二个点
                    curve.getPointAt((u + targetOffset) % 1, carTarget)
                    carTarget.applyMatrix4(curveObject.matrixWorld)

                    // 把车暂时放在第一个点
                    car.position.copy(carPosition)
                    // 给汽车点第二点
                    car.lookAt(carTarget)

                    // 把车放在两个点之间
                    car.position.lerpVectors(carPosition, carTarget, 0.5)
                })
            }

            renderer.render(scene, camera)

            requestAnimationFrame(render)
        }

        requestAnimationFrame(render)
    }
}
