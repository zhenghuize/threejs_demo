import * as THREE from 'three'

export default class position {
    renderer
    camera
    scene
    things: {
        mesh: THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial, THREE.Object3DEventMap>
        timer: number
        velocity: THREE.Vector3
    }[]
    then = 0
    logger
    constructor(el: HTMLElement) {
        this.renderer = new THREE.WebGLRenderer({ antialias: true, canvas: el })

        const fov = 75
        const aspect = 2 // the canvas default
        const near = 0.1
        const far = 50
        this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far)
        this.camera.position.z = 20

        this.scene = new THREE.Scene()
        this.scene.background = new THREE.Color('red')

        this.things = []

        this.logger = new ClearingLogger(document.querySelector('#debug pre')!)

        el.addEventListener('click', this.addThings)

        this.render(10)
    }

    addThings = () => {
        const geometry = new THREE.SphereGeometry()
        const material = new THREE.MeshBasicMaterial({ color: 'yellow' })

        const mesh = new THREE.Mesh(geometry, material)
        this.scene.add(mesh)
        this.things.push({
            mesh,
            timer: 2,
            velocity: new THREE.Vector3(this.rand(-5, 5), this.rand(-5, 5), this.rand(-5, 5))
        })
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

    render = (now: number) => {
        now *= 0.001 // convert to seconds
        const deltaTime = now - this.then
        this.then = now

        if (this.resizeRendererToDisplaySize()) {
            const canvas = this.renderer.domElement
            this.camera.aspect = canvas.clientWidth / canvas.clientHeight
            this.camera.updateProjectionMatrix()
        }

        this.logger.log('fps:', (1 / deltaTime).toFixed(1))
        this.logger.log('num things:', this.things.length)

        this.things.forEach((item, index) => {
            const mesh = item.mesh
            const pos = mesh.position

            this.logger.log(
                'timer:',
                item.timer.toFixed(3),
                'pos:',
                pos.x.toFixed(3),
                pos.y.toFixed(3),
                pos.z.toFixed(3)
            )

            item.timer -= deltaTime

            if (item.timer <= 0) {
                // remove this thing. Note we don't advance `i`
                this.things.splice(index, 1)
                this.scene.remove(mesh)
            } else {
                mesh.position.addScaledVector(item.velocity, deltaTime)
            }
        })

        this.renderer.render(this.scene, this.camera)
        this.logger.render()
        requestAnimationFrame(this.render)
    }

    rand = (min: number, max: number | undefined) => {
        if (max === undefined) {
            max = min
            min = 0
        }

        return Math.random() * (max - min) + min
    }
}

class ClearingLogger {
    elem
    lines: string[]
    constructor(elem: HTMLElement) {
        this.elem = elem
        this.lines = []
    }
    log(...args: (string | number)[]) {
        this.lines.push([...args].join(' '))
    }
    render() {
        this.elem.textContent = this.lines.join('\n')
        this.lines = []
    }
}
