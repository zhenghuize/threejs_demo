import * as THREE from 'three'
import { GUI } from 'three/addons/libs/lil-gui.module.min.js'

export default class ScreenImg {
    renderer
    camera
    scene
    objects: Array<any> = [] // 要更新旋转角度的对象数组
    gui
    constructor(el: HTMLElement) {
        this.renderer = new THREE.WebGLRenderer({ antialias: true, canvas: el })
        this.gui = new GUI()

        const fov = 40
        const aspect = 2
        const near = 0.1
        const far = 1000
        this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far)
        this.camera.position.set(0, 50, 0)
        this.camera.up.set(0, 0, 1)
        this.camera.lookAt(0, 0, 0)

        this.scene = new THREE.Scene()

        const color = 0xffffff
        const intensity = 500
        const light = new THREE.PointLight(color, intensity)
        this.scene.add(light)

        // 一球多用
        const radius = 1
        const widthSegments = 6
        const heightSegments = 6
        const sphereGeometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments)

        const solarSystem = new THREE.Object3D()
        this.scene.add(solarSystem)
        this.objects.push(solarSystem)

        const sunMaterial = new THREE.MeshPhongMaterial({ emissive: 0xffff00 })
        const sunMesh = new THREE.Mesh(sphereGeometry, sunMaterial)
        sunMesh.scale.set(5, 5, 5) // 扩大太阳的大小
        solarSystem.add(sunMesh)
        this.objects.push(sunMesh)

        const earthOrbit = new THREE.Object3D()
        earthOrbit.position.x = 10
        solarSystem.add(earthOrbit)
        this.objects.push(earthOrbit)

        const earthMaterial = new THREE.MeshPhongMaterial({
            color: 0x2233ff,
            emissive: 0x112244
        })
        const earthMesh = new THREE.Mesh(sphereGeometry, earthMaterial)
        // earthMesh.position.x = 10
        // sunMesh.add(earthMesh)
        earthOrbit.add(earthMesh)
        // solarSystem.add(earthMesh)
        this.objects.push(earthMesh)

        const moonOrbit = new THREE.Object3D()
        moonOrbit.position.x = 2
        earthOrbit.add(moonOrbit)

        const moonMaterial = new THREE.MeshPhongMaterial({ color: 0x888888, emissive: 0x222222 })
        const moonMesh = new THREE.Mesh(sphereGeometry, moonMaterial)
        moonMesh.scale.set(0.5, 0.5, 0.5)
        moonOrbit.add(moonMesh)
        this.objects.push(moonMesh)

        // this.objects.forEach((node) => {
        //     const axes = new THREE.AxesHelper()
        //     axes.material.depthTest = false
        //     axes.renderOrder = 1
        //     node.add(axes)
        // })

        this.makeAxisGrid(solarSystem, 'solarSystem', 25)
        this.makeAxisGrid(sunMesh, 'sunMesh')
        this.makeAxisGrid(earthOrbit, 'earthOrbit')
        this.makeAxisGrid(earthMesh, 'earthMesh')
        this.makeAxisGrid(moonOrbit, 'moonOrbit')
        this.makeAxisGrid(moonMesh, 'moonMesh')

        this.render(0)
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

        this.objects.forEach((obj) => {
            obj.rotation.y = time
        })

        this.renderer.render(this.scene, this.camera)

        requestAnimationFrame(this.render)
    }

    makeAxisGrid = (node: any, label: any, units = 10) => {
        const helper = new AxisGridHelper(node, units)
        console.log(helper)
        this.gui.add(helper, 'visible').name(label)
    }
}

class AxisGridHelper {
    grid
    axes
    _visible = false
    constructor(node, units = 10) {
        const axes = new THREE.AxesHelper()
        axes.material.depthTest = false
        axes.renderOrder = 1
        node.add(axes)

        const grid = new THREE.GridHelper(units, units)
        grid.material.depthTest = false
        grid.renderOrder = 2
        node.add(grid)

        this.grid = grid
        this.axes = axes
        this.visible = false
    }

    get visible() {
        return this._visible
    }
    set visible(v) {
        this._visible = v
        this.grid.visible = v
        this.axes.visible = v
    }
}
