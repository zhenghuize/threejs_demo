import './assets/style.css'
import Experience from './Experience/index.ts'
import EdgesBox from './Experience/edgesBox.ts'
import Text from './Experience/text.ts'
import Radius from './Experience/radius.ts'
import Line from './Experience/line.ts'
import SlicedSphere from './Experience/SlicedSphere.ts'
import ScreenImg from './Experience/scene.ts'
import texture from './Experience/texture.ts'
import lightExp from './Experience/LightExp.ts'
import areaLight from './Experience/areaLight.ts'
import cameraExp from './Experience/cameraExp.ts'
import shadows from './Experience/shadows.ts'
import fog from './Experience/fog.ts'
import renderTarget from './Experience/renderTarget.ts'
import position from './Experience/position.ts'
import trajectory from './Experience/trajectory.ts'
import mousePainting from './Experience/mousePainting.ts'

// document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
//     <canvas id="canvas-content"></canvas>
//     <div class="split">
//         <div id="view1" tabindex="1"></div>
//         <div id="view2" tabindex="2"></div>
//     </div>
// `
// document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
//     <canvas id="canvas-content"></canvas>
//     <div id="debug">
//       <pre></pre>
//     </div>
// `
document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
    <canvas id="canvas-content"></canvas>
`

// new Experience(document.querySelector<HTMLElement>('#canvas-content')!)
// new EdgesBox(document.querySelector<HTMLElement>('#canvas-content')!)
// new Text(document.querySelector<HTMLElement>('#canvas-content')!)
// new Radius(document.querySelector<HTMLElement>('#canvas-content')!)
// new Line(document.querySelector<HTMLElement>('#canvas-content')!)
// new SlicedSphere(document.querySelector<HTMLElement>('#canvas-content')!)
// new ScreenImg(document.querySelector<HTMLElement>('#canvas-content')!) // 场景
// new texture(document.querySelector<HTMLElement>('#canvas-content')!) // 纹理
// new lightExp(document.querySelector<HTMLElement>('#canvas-content')!) // 光照
// new areaLight(document.querySelector<HTMLElement>('#canvas-content')!) // 光照
// new cameraExp() // 相机
// new shadows(document.querySelector<HTMLElement>('#canvas-content')!) // 阴影
// new fog(document.querySelector<HTMLElement>('#canvas-content')!)  // 雾
// new renderTarget(document.querySelector<HTMLElement>('#canvas-content')!) // 渲染目标
// new position(document.querySelector<HTMLElement>('#canvas-content')!) // 点击生成圆球
// new trajectory(document.querySelector<HTMLElement>('#canvas-content')!) // 轨迹运动
new mousePainting(document.querySelector<HTMLElement>('#canvas-content')!) // 鼠标绘画
