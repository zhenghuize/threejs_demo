import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js'
import TWEEN from 'three/addons/libs/tween.module.js'

class TweenManger {
    numTweensRunning
    constructor() {
        this.numTweensRunning = 0
    }
    _handleComplete() {
        --this.numTweensRunning

        console.assert(this.numTweensRunning >= 0) /* eslint no-console: off */
    }
    createTween(targetObject: any) {
        console.log(targetObject)
        const self = this
        ++this.numTweensRunning
        let userCompleteFn: any = () => {}

        // 创建一个新的补间并安装我们自己的onComplete回调
        const tween = new TWEEN.Tween(targetObject).onComplete((...args) => {
            self._handleComplete()
            userCompleteFn.call(this, ...args)
        })
        console.log(tween)
        // replace the tween's onComplete function with our own
        // so we can call the user's callback if they supply one.
        tween.onComplete = (fn) => {
            userCompleteFn = fn
            return tween
        }

        return tween
    }
    update() {
        TWEEN.update()
        return this.numTweensRunning > 0
    }
}
export default class earth {
    renderer
    camera
    scene
    renderRequested: boolean | undefined
    controls
    tweenManager
    mesh: any
    constructor(el: HTMLCanvasElement) {
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            canvas: el
        })
        this.tweenManager = new TweenManger()
        this.renderRequested = false

        const fov = 60
        const aspect = 2 // the canvas default
        const near = 0.1
        const far = 10
        this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far)
        this.camera.position.z = 2.5

        this.controls = new OrbitControls(this.camera, el)
        this.controls.enableDamping = true
        this.controls.enablePan = false
        this.controls.minDistance = 1.2
        this.controls.maxDistance = 4
        this.controls.update()

        this.scene = new THREE.Scene()
        this.scene.background = new THREE.Color('black')

        {
            const loader = new THREE.TextureLoader()
            const texture = loader.load(
                'https://threejs.org/manual/examples/resources/images/world.jpg',
                this.render
            )
            texture.colorSpace = THREE.SRGBColorSpace
            const geometry = new THREE.SphereGeometry(1, 64, 32)
            const material = new THREE.MeshBasicMaterial({ map: texture })
            this.scene.add(new THREE.Mesh(geometry, material))
        }

        // this.loadFile(
        //     'https://threejs.org/manual/examples/resources/data/gpw/gpw_v4_basic_demographic_characteristics_rev10_a000_014mt_2010_cntm_1_deg.asc'
        // )
        //     .then(this.parseData)
        //     .then(this.render)

        this.loadAll()

        this.controls.addEventListener('change', this.requestRenderIfNotRequested)
        window.addEventListener('resize', this.requestRenderIfNotRequested)
    }

    makeBoxes = (file: any, hueRange: number[], fileInfos: any[]) => {
        console.log(hueRange)
        const { data, max, min } = file
        const range = max - min

        // 位置辅助器可以方便地在球面上定位
        // 经度辅助器可以在XZ平面的法向旋转
        // 用于旋转
        const lonHelper = new THREE.Object3D()
        this.scene.add(lonHelper)

        // 纬度辅助器可以在XZ平面旋转
        // 定位经纬度的辅助对象。
        const latHelper = new THREE.Object3D()
        lonHelper.add(latHelper)
        // 组合起来得到的位置辅助器可以在球面上定位
        const positionHelper = new THREE.Object3D()
        positionHelper.position.z = 1
        latHelper.add(positionHelper)
        // 用来定位盒子的中心, 以便接下来沿着Z轴缩放
        const originHelper = new THREE.Object3D()
        originHelper.position.z = 0.5
        positionHelper.add(originHelper)

        // 用于调整经纬度旋转，使柱状图正确对齐到球体表面
        const lonFudge = Math.PI * 0.5
        const latFudge = Math.PI * -0.135
        const geometries: THREE.BufferGeometry<THREE.NormalBufferAttributes>[] = []

        const color = new THREE.Color()

        data.forEach((row: (number | undefined)[], latNdx: any) => {
            row.forEach((value: number | undefined, lonNdx: any) => {
                if (this.dataMissingInAnySet(fileInfos, latNdx, lonNdx)) {
                    return
                }
                const boxWidth = 1
                const boxHeight = 1
                const boxDepth = 1
                const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth)

                const amount = (value - min) / range

                // 调整辅助器使其指向经纬度
                lonHelper.rotation.y = THREE.MathUtils.degToRad(lonNdx + file.xllcorner) + lonFudge
                latHelper.rotation.x = THREE.MathUtils.degToRad(latNdx + file.yllcorner) + latFudge

                // 使用world matrix来操作辅助器
                // positionHelper.updateWorldMatrix(true, false)
                // mesh.applyMatrix4(positionHelper.matrixWorld)

                // mesh.scale.set(0.005, 0.005, THREE.MathUtils.lerp(0.01, 0.5, amount))
                // 使用位置辅助器和world matrix 来定位
                positionHelper.scale.set(0.005, 0.005, THREE.MathUtils.lerp(0.01, 0.5, amount))
                originHelper.updateWorldMatrix(true, false)
                geometry.applyMatrix4(originHelper.matrixWorld)

                // 计算颜色
                const hue = THREE.MathUtils.lerp(hueRange[0], hueRange[1], amount)
                const saturation = 1
                const lightness = THREE.MathUtils.lerp(0.6, 1.0, amount)
                color.setHSL(hue, saturation, lightness)

                // 以0到255之间的值数组形式获取颜色
                const rgb = color.toArray().map((v) => v * 255)

                // 创建一个数组来存储每个顶点的颜色
                const numVerts = geometry.getAttribute('position').count
                const itemSize = 3 // r, g, b
                const colors = new Uint8Array(itemSize * numVerts)

                colors.forEach((v, ndx) => {
                    colors[ndx] = rgb[ndx % 3]
                })

                const normalized = true
                const colorAttrib = new THREE.BufferAttribute(colors, itemSize, normalized)
                geometry.setAttribute('color', colorAttrib)

                geometries.push(geometry)
            })
        })

        return BufferGeometryUtils.mergeGeometries(geometries, false)
    }

    dataMissingInAnySet = (fileInfos: any, latNdx: string | number, lonNdx: string | number) => {
        for (const fileInfo of fileInfos) {
            if (fileInfo.file.data[latNdx][lonNdx] === undefined) {
                return true
            }
        }

        return false
    }

    parseData = (text: string) => {
        const data: any[] = []
        const settings: any = { data }
        let max: number | undefined
        let min: number | undefined
        // 对每一行进行切分
        text.split('\n').forEach((line) => {
            const parts = line.trim().split(/\s+/)
            if (parts.length === 2) {
                // 长度为2的必定是键值对
                settings[parts[0]] = parseFloat(parts[1])
            } else if (parts.length > 2) {
                // 长度超过2的肯定是网格数据
                const values = parts.map((item) => {
                    const value = parseFloat(item)
                    if (value === settings.NODATA_value) {
                        return undefined
                    }
                    max = Math.max(max === undefined ? value : max, value)
                    min = Math.min(min === undefined ? value : min, value)
                    return value
                })
                data.push(values)
            }
        })

        return Object.assign(settings, { min, max })
    }

    loadFile = async (url: string) => {
        const req = await fetch(url)
        return req.text()
    }

    render = () => {
        this.renderRequested = undefined

        if (this.resizeRendererToDisplaySize()) {
            const canvas = this.renderer.domElement
            this.camera.aspect = canvas.clientWidth / canvas.clientHeight
            this.camera.updateProjectionMatrix()
        }

        if (this.tweenManager.update()) {
            this.requestRenderIfNotRequested()
        }

        this.controls.update()
        this.renderer.render(this.scene, this.camera)
    }

    loadData = async (info: any) => {
        const text = await this.loadFile(info.url)
        info.file = this.parseData(text)
    }

    amountGreaterThan = (a: number, b: number) => {
        return Math.max(a - b, a / (a + b))
    }

    loadAll = async () => {
        const fileInfos: any[] = [
            {
                name: 'men',
                hueRange: [0.7, 0.3],
                url: 'https://threejs.org/manual/examples/resources/data/gpw/gpw_v4_basic_demographic_characteristics_rev10_a000_014mt_2010_cntm_1_deg.asc',
                root: undefined,
                elem: ''
            },
            {
                name: 'women',
                hueRange: [0.9, 1.1],
                url: 'https://threejs.org/manual/examples/resources/data/gpw/gpw_v4_basic_demographic_characteristics_rev10_a000_014ft_2010_cntm_1_deg.asc',
                root: undefined,
                elem: ''
            }
        ]

        await Promise.all(fileInfos.map(this.loadData))

        const menInfo: any = fileInfos[0]
        const womenInfo: any = fileInfos[1]
        const menFile = menInfo.file
        const womenFile = womenInfo.file

        fileInfos.push({
            name: '>50%men',
            hueRange: [0.6, 1.1],
            file: this.makeDiffFile(menFile, womenFile, (men: number, women: number) => {
                return this.amountGreaterThan(men, women)
            })
        })
        fileInfos.push({
            name: '>50% women',
            hueRange: [0.0, 0.4],
            file: this.makeDiffFile(womenFile, menFile, (women: number, men: number) => {
                return this.amountGreaterThan(women, men)
            })
        })

        // 为每个数据集制作几何图形
        const geometries = fileInfos.map((info) => {
            return this.makeBoxes(info.file, info.hueRange, fileInfos)
        })
        const baseGeometry: any = geometries[0]

        baseGeometry.morphAttributes.position = geometries.map((geometry, ndx) => {
            const attribute = geometry.getAttribute('position')
            const name = `target${ndx}`
            attribute.name = name
            return attribute
        })
        baseGeometry.morphAttributes.color = geometries.map((geometry, ndx) => {
            const attribute = geometry.getAttribute('color')
            const name = `target${ndx}`
            attribute.name = name
            return attribute
        })
        const material = new THREE.MeshBasicMaterial({
            vertexColors: true
        })
        this.mesh = new THREE.Mesh(baseGeometry, material)
        this.scene.add(this.mesh)

        const uiElem = document.querySelector('#ui')
        fileInfos.forEach((info) => {
            const div = document.createElement('div')
            info.elem = div
            div.textContent = info.name
            uiElem?.appendChild(div)
            const show = () => {
                this.showFileInfo(fileInfos, info)
            }

            div.addEventListener('mouseover', show)
            div.addEventListener('touchstart', show)
        })
        // show the first set of data
        this.showFileInfo(fileInfos, fileInfos[0])
    }

    // 展示选中的元素, 隐藏其他的
    showFileInfo = (fileInfos: any[], fileInfo: any) => {
        const targets: any = {}
        fileInfos.forEach((info, i) => {
            const visible = fileInfo === info
            info.elem.className = visible ? 'selected' : ''
            targets[i] = visible ? 1 : 0
        })
        console.log(targets)
        const durationInMs = 500
        this.tweenManager
            .createTween(this.mesh.morphTargetInfluences)
            .to(targets, durationInMs)
            .start()
        this.requestRenderIfNotRequested()
    }

    makeDiffFile = (baseFile: any, otherFile: any, compareFn: any) => {
        let min: number | undefined
        let max: number | undefined
        const baseData = baseFile.data
        const otherData = otherFile.data

        const data = this.mapValues(baseData, (base, rowNdx, colNdx) => {
            // console.log(base, rowNdx, colNdx)
            const other = otherData[rowNdx][colNdx]
            if (base === undefined || other === undefined) {
                return undefined
            }
            const value = compareFn(base, other)
            min = Math.min(min === undefined ? value : min, value)
            max = Math.max(max === undefined ? value : max, value)
            return value
        })
        return { ...baseFile, min, max, data }
    }

    mapValues = (data: any[][], fn: (arg0: any, arg1: any, arg2: number) => any) => {
        return data.map((row: any[], rowNdx: any) => {
            return row.map((value, colNdx) => {
                return fn(value, rowNdx, colNdx)
            })
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

    requestRenderIfNotRequested = () => {
        if (!this.renderRequested) {
            this.renderRequested = true
            requestAnimationFrame(this.render)
        }
    }
}
