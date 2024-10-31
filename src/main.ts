import './assets/style.css'
import Experience from './Experience/index.ts'
import EdgesBox from './Experience/edgesBox.ts'
import Text from './Experience/text.ts'
import Radius from './Experience/radius.ts'
import Line from './Experience/line.ts'
import SlicedSphere from './Experience/SlicedSphere.ts'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
    <canvas id="canvas-content"></canvas>
`

// new Experience(document.querySelector<HTMLElement>('#canvas-content')!)
// new EdgesBox(document.querySelector<HTMLElement>('#canvas-content')!)
new Text(document.querySelector<HTMLElement>('#canvas-content')!)
// new Radius(document.querySelector<HTMLElement>('#canvas-content')!)
// new Line(document.querySelector<HTMLElement>('#canvas-content')!)
// new SlicedSphere(document.querySelector<HTMLElement>('#canvas-content')!)
