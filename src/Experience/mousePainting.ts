import * as THREE from 'three'

export default class mousePainting {
    renderer
    camera
    scene
    state
    base
    canvas
    constructor(el: HTMLCanvasElement) {
        console.log(el)
        this.canvas = el
        this.renderer = new THREE.WebGLRenderer({
            antialias: true, // 启用抗锯齿,改善图形平滑度。
            preserveDrawingBuffer: true, // 保持绘图缓冲区，允许截图或导出图像
            alpha: true, // 支持透明背景
            canvas: el
        })
        this.renderer.autoClearColor = false
        // 用于创建正交投影相机，适用于不需要透视的场景，如 2D 游戏或需要精确几何表示的应用。
        this.camera = new THREE.OrthographicCamera(-2, 2, 1, -1, -1, 1)
        // left = -2: 视锥体的左边界为 -2。
        // right = 2: 视锥体的右边界为 2。
        // top = 1: 视锥体的上边界为 1。
        // bottom = -1: 视锥体的下边界为 -1。
        // near = -1: 近裁剪平面距离相机的位置为 -1。
        // far = 1: 远裁剪平面距离相机的位置为 1。

        this.scene = new THREE.Scene()

        {
            const color = 0xffffff
            const intensity = 3
            // 是用于模拟方向光源（如阳光）的光照对象，具有以下特点：
            // 光照是平行的，不受物体距离影响。
            // 可以设置光照的方向和目标。
            // 支持阴影渲染。
            const light = new THREE.DirectionalLight(color, intensity)
            light.position.set(-1, 2, 4)
            this.scene.add(light)
        }

        const boxWidth = 1
        const boxHeight = 1
        const boxDepth = 1
        const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth)

        this.base = new THREE.Object3D()
        this.scene.add(this.base)
        this.base.scale.set(0.05, 0.05, 0.05)

        this.state = { x: 0, y: 0 }

        makeInstance({ geometry, color: '#F00', x: 0, y: 0, z: 0, base: this.base })

        this.render(20)

        this.temp = new THREE.Vector3()

        el.addEventListener('mousemove', this.setPosition)
        el.addEventListener(
            'touchmove',
            (e) => {
                e.preventDefault()
                this.setPosition(e.touches[0])
            },
            { passive: false }
        )
    }
    temp
    setPosition = (e: any) => {
        const pos = this.getCanvasRelativePosition(e)
        const x = (pos.x / this.canvas.width) * 2 - 1
        const y = (pos.y / this.canvas.height) * -2 + 1
        this.temp.set(x, y, 0).unproject(this.camera)
        this.state.x = this.temp.x
        this.state.y = this.temp.y
    }

    getCanvasRelativePosition = (event: any) => {
        const rect = this.canvas.getBoundingClientRect()
        return {
            x: ((event.clientX - rect.left) * this.canvas.width) / rect.width,
            y: ((event.clientY - rect.top) * this.canvas.height) / rect.height
        }
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

        if (this.resizeRendererToDisplaySize()) {
            const canvas = this.renderer.domElement
            this.camera.right = canvas.clientWidth / canvas.clientHeight
            this.camera.left = -this.camera.right
            this.camera.updateProjectionMatrix()
        }

        this.base.position.set(this.state.x, this.state.y, 0)
        this.base.rotation.x = time
        this.base.rotation.y = time * 1.11

        this.renderer.render(this.scene, this.camera)

        requestAnimationFrame(this.render)
    }
}

type makeInstanceType = {
    geometry: THREE.BoxGeometry
    color: string
    base: THREE.Object3D
    x: number
    y: number
    z: number
}
function makeInstance({ geometry, color, base, x, y, z }: makeInstanceType) {
    const material = new THREE.MeshPhongMaterial({ color })

    const cube = new THREE.Mesh(geometry, material)
    base.add(cube)

    cube.position.set(x, y, z)

    return cube
}
