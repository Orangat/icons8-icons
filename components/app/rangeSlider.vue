<template>
  <div class="range-slider">
    <slot name="start"></slot>
    <div class="range-slider-content" ref="content" v-on:click="sliderClick">
      <div class="range-slider-railway" :style="{'border-top-width': barHeight + 'px'}"></div>
      <div class="range-slider-bar" :style="{width: progress + 'px', 'height': barHeight + 'px'}"></div>
      <div class="range-slider-handle" ref="handle" :style="{left: progress + 'px'}"></div>
    </div>
    <slot name="end"></slot>
  </div>
</template>

<script>
let isDragging = false

const draggable = function (element, supportTouch, options) {
  const moveFn = function (event) {
    if (options.drag) {
      options.drag(supportTouch ? event.changedTouches[0] || event.touches[0] : event)
    }
  }
  const endFn = function (event) {
    if (!supportTouch) {
      document.removeEventListener('mousemove', moveFn)
      document.removeEventListener('mouseup', endFn)
    }
    document.onselectstart = null
    document.ondragstart = null
    isDragging = false
    if (options.end) {
      options.end(supportTouch ? event.changedTouches[0] || event.touches[0] : event)
    }
  }

  let supportsPassive = false
  try {
    const opts = Object.defineProperty({}, 'passive', {
      get: function () {
        supportsPassive = true
      }
    })
    window.addEventListener('test', null, opts)
  } catch (e) {}

  element.addEventListener(supportTouch ? 'touchstart' : 'mousedown', function (event) {
    if (isDragging) return
    event.preventDefault()
    document.onselectstart = function () { return false }
    document.ondragstart = function () { return false }
    if (!supportTouch) {
      document.addEventListener('mousemove', moveFn)
      document.addEventListener('mouseup', endFn)
    }
    isDragging = true
    if (options.start) {
      options.start(supportTouch ? event.changedTouches[0] || event.touches[0] : event)
    }
  }, supportTouch ? (supportsPassive ? { passive: true } : false) : false)
  if (supportTouch) {
    element.addEventListener('touchmove', moveFn, supportsPassive ? { passive: true } : false)
    element.addEventListener('touchend', endFn, supportsPassive ? { passive: true } : false)
    element.addEventListener('touchcancel', endFn, supportsPassive ? { passive: true } : false)
  }
}

export default {
  name: 'rangeSlider',
  props: {
    min: {
      type: Number,
      'default': 0
    },
    max: {
      type: Number,
      'default': 100
    },
    step: {
      type: Number,
      'default': 1
    },
    disabled: {
      type: Boolean,
      'default': false
    },
    value: {
      type: Number
    },
    barHeight: {
      type: Number,
      'default': 2
    },
    endFunc: {
      type: Function,
      'default': () => {}
    }
  },
  data () {
    return {
      handleSize: 16,
      contentBox: undefined,
      handleBox: undefined
    }
  },
  computed: {
    progress () {
      if (!this.contentBox || !this.handleBox) {
        return 0
      }
      const value = this.value
      if (typeof value === 'undefined' || value === null) return 0
      if (value <= this.min) {
        return 0
      }
      return Math.floor((value - this.min) / (this.max - this.min) * (this.contentBox.width - this.handleBox.width))
    }
  },
  methods: {
    sliderClick (e) {
      const contentBox = this.$refs.content.getBoundingClientRect()
      const newValue = (e.clientX - contentBox.left - 0.3 * this.handleSize) / (contentBox.width - this.handleBox.width) * (this.max - this.min) + this.min
      this.$emit('input', Math.floor(newValue))
    }
  },
  mounted () {
    const _self = this
    const { content, handle } = this.$refs
    this.contentBox = content.getBoundingClientRect()
    this.handleBox = handle.getBoundingClientRect()

    const handlePos = () => {
      const contentBox = content.getBoundingClientRect()
      const handleBox = handle.getBoundingClientRect()
      return {
        left: handleBox.left - contentBox.left,
        top: handleBox.top - contentBox.top
      }
    }
    let dragState = {}
    draggable(handle, 'ontouchstart' in window, {
      start: () => {
        if (this.disabled) return
        const position = handlePos()
        dragState = {
          handleStartLeft: position.left,
          handleStartTop: position.top
        }
      },
      drag: (event) => {
        if (this.disabled) return
        const contentBox = content.getBoundingClientRect()
        const deltaX = event.pageX - contentBox.left - 0.3 * this.handleSize - dragState.handleStartLeft
        const stepTotalCount = Math.ceil((this.max - this.min) / this.step)
        const newPosition = (dragState.handleStartLeft + deltaX) - (dragState.handleStartLeft + deltaX) % ((contentBox.width - this.handleSize) / stepTotalCount)
        let newProgress = newPosition / (contentBox.width - this.handleSize)
        if (newProgress < 0) {
          newProgress = 0
        } else if (newProgress > 1) {
          newProgress = 1
        }

        this.$emit('input', Math.round(this.min + newProgress * (this.max - this.min)))
      },
      end: () => {
        if (this.disabled) return
        dragState = {}
        typeof _self.endFunc === 'function' && _self.endFunc()
      }
    })
  }
}
</script>

<style lang="scss">
  @import '../../assets/css/variables.scss';

  $range-slider-size: 16px;
  $range-slider-padding: 8px;
  .range-slider {
    width: 100%;
    position: relative;
    display: flex;
    height: $range-slider-size  *2;
    line-height: $range-slider-size + 2*$range-slider-padding;

    &.is-slim {
      height: $range-slider-size;
      line-height: $range-slider-size;
      .range-slider-content {
        margin: 0;
      }
    }

    &>[slot=start] {
      margin-right: 5px;
      display: flex;
    }
    &>[slot=end] {
      margin-left: 5px;
      display: flex;
    }

    .range-slider-content {
      display: flex;
      position: relative;
      flex: 1;
      height: $range-slider-size;
      line-height: $range-slider-size;
      margin: $range-slider-padding 0;
    }

    .range-slider-railway {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      left: 0;
      right: 0;
      border-top: solid #DAD8D8;
    }

    .range-slider-bar {
      display: block;
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: 0;
      background-color: $color-blue;
    }

    .range-slider-handle {
      background-color: #fff;
      position: absolute;
      left: 0;
      top: 0;
      width: $range-slider-size;
      height: $range-slider-size;
      border-radius: 100%;
      cursor: pointer;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
    }
  }
</style>
