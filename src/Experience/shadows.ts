import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

export default class shadows {
    renderer
    scene
    camera
    sphereShadowBases
    constructor(el: HTMLElement) {
        this.renderer = new THREE.WebGLRenderer({ antialias: true, canvas: el })

        const fov = 45
        const aspect = 2 // the canvas default
        const near = 0.1
        const far = 100
        this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far)
        this.camera.position.set(0, 10, 20)
        this.camera.lookAt(0, 0, 0)

        this.scene = new THREE.Scene()
        this.scene.background = new THREE.Color('white')

        const controls = new OrbitControls(this.camera, el)
        controls.target.set(0, 5, 0)
        controls.update()

        const planeMesh = planeMeshFn(
            'https://threejs.org/manual/examples/resources/images/checker.png'
        )
        this.scene.add(planeMesh)

        const loader = new THREE.TextureLoader()
        const shadowTexture = loader.load(
            'https://threejs.org/manual/examples/resources/images/roundshadow.png'
        )
        this.sphereShadowBases = []
        {
            const sphereRadius = 1
            const sphereWidthDivisions = 32
            const sphereHeightDivisions = 16
            const sphereGeo = new THREE.SphereGeometry(
                sphereRadius,
                sphereWidthDivisions,
                sphereHeightDivisions
            )

            const planeSize = 1
            const shadowGeo = new THREE.PlaneGeometry(planeSize, planeSize)

            const numSpheres = 15
            for (let i = 0; i < numSpheres; ++i) {
                // make a base for the shadow and the sphere.
                // so they move together.
                const base = new THREE.Object3D()
                this.scene.add(base)

                // 阴影图片和球体绑定一起
                const shadowMat = new THREE.MeshBasicMaterial({
                    map: shadowTexture,
                    transparent: true, // 这样我们就能看到地面
                    depthWrite: false // 所以我们不需要排序
                })
                const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat)
                shadowMesh.position.y = 0.001 // 稍微高于地面
                shadowMesh.rotation.x = Math.PI * -0.5
                const shadowSize = sphereRadius * 4
                shadowMesh.scale.set(shadowSize, shadowSize, shadowSize)
                base.add(shadowMesh) // 和球体一起添加到object3d

                // 将球体添加到基座
                const u = i / numSpheres
                const sphereMat = new THREE.MeshPhongMaterial()
                sphereMat.color.setHSL(u, 1, 0.75)
                const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat)
                sphereMesh.position.set(0, sphereRadius + 2, 0)
                base.add(sphereMesh)

                // remember all 3 plus the y position
                this.sphereShadowBases.push({
                    base,
                    sphereMesh,
                    shadowMesh,
                    y: sphereMesh.position.y
                })
            }
        }

        {
            const skyColor = 0xb1e1ff // light blue
            const groundColor = 0xb97a20 // brownish orange
            const intensity = 0.75
            const light = new THREE.HemisphereLight(skyColor, groundColor, intensity)
            this.scene.add(light)
        }

        {
            const color = 0xffffff
            const intensity = 2.5
            const light = new THREE.DirectionalLight(color, intensity)
            light.position.set(0, 10, 5)
            light.target.position.set(-5, 0, 0)
            this.scene.add(light)
            this.scene.add(light.target)
        }

        this.render(10)
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
        time *= 0.001 // convert to seconds

        this.resizeRendererToDisplaySize()

        {
            const canvas = this.renderer.domElement
            this.camera.aspect = canvas.clientWidth / canvas.clientHeight
            this.camera.updateProjectionMatrix()
        }

        this.sphereShadowBases.forEach((sphereShadowBase, ndx) => {
            const { base, sphereMesh, shadowMesh, y } = sphereShadowBase

            // 是一个在迭代球体时从0到1的值
            const u = ndx / this.sphereShadowBases.length

            // 计算该基座的位置。这将移动
            // 球体及其阴影
            const speed = time * 0.2
            const angle = speed + u * Math.PI * 2 * (ndx % 1 ? 1 : -1)
            const radius = Math.sin(speed - ndx) * 10
            base.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius)

            // yOff是一个从0到1的值
            const yOff = Math.abs(Math.sin(time * 2 + ndx))
            // 上下移动球体
            sphereMesh.position.y = y + THREE.MathUtils.lerp(-2, 6, yOff)
            // 随着球体的上升，阴影逐渐淡化
            shadowMesh.material.opacity = THREE.MathUtils.lerp(1, 0.25, yOff)
        })

        this.renderer.render(this.scene, this.camera)

        requestAnimationFrame(this.render)
    }
}

const planeMeshFn = (url: string) => {
    const loader = new THREE.TextureLoader()

    const planeSize = 40
    const texture = loader.load(url)
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    texture.magFilter = THREE.NearestFilter
    texture.colorSpace = THREE.SRGBColorSpace
    const repeats = planeSize / 2
    texture.repeat.set(repeats, repeats)

    const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize)
    const planeMat = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.DoubleSide
    })
    planeMat.color.setRGB(1.5, 1.5, 1.5)
    const mesh = new THREE.Mesh(planeGeo, planeMat)
    mesh.rotation.x = Math.PI * -0.5

    return mesh
}
