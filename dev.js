import example from 'mind-elixir/example'
import MindElixir from 'mind-elixir'
import { domToCanvas, domToForeignObjectSvg, domToImage } from './src'

const E = MindElixir.E
const options = {
  el: '#map',
  newTopicName: '子节点',
  direction: MindElixir.SIDE,
  // direction: MindElixir.RIGHT,
  locale: 'en',
  draggable: true,
  editable: true,
  contextMenu: true,
  contextMenuOption: {
    focus: true,
    link: true,
    extend: [
      {
        name: 'Node edit',
        onclick: () => {
          alert('extend menu')
        },
      },
    ],
  },
  mobileMenu: true,
  toolBar: true,
  nodeMenu: true,
  keypress: true,
  allowUndo: true,
  before: {
    insertSibling(el, obj) {
      console.log('insertSibling', el, obj)
      return true
    },
    async addChild(el, obj) {
      console.log('addChild', el, obj)
      // await sleep()
      return true
    },
  },
}

let mind = new MindElixir(options)

mind.init(example)
// mind.init(MindElixir.new('new topic'))

const toImg = async () => {
  const dom = await domToCanvas(mind.nodes, {
    debug: true,
    onCloneNode: (node) => {
      const n = node
      n.style.position = ''
      n.style.top = ''
      n.style.left = ''
      n.style.bottom = ''
      n.style.right = ''
      // n.style.padding = '300px'
      // const wrapper = document.createElement('div')
      // wrapper.style.padding = '300px'
      // wrapper.appendChild(n)
      // return wrapper
    },
    quality: 1,
    padding: 300,
  })
  document.body.appendChild(dom)
}

window.toImg = toImg
window.m = mind
// window.m2 = mind2
window.M = MindElixir
window.E = MindElixir.E

console.log('MindElixir Version', MindElixir.version)

window.destroy = () => {
  mind.destroy()
  // @ts-expect-error remove reference
  mind = null
  // @ts-expect-error remove reference
  window.m = null
}
