<template lang="pug">
  .color-picker
    app-popup(
      :position="position"
      :show-toggle="false"
      @open="onOpen"
      @close="onClose"
    )
      //.color-picker-selected( v-if="isColorPickerSelected" :style="toggleStyle")
      .color-picker-toggle(
        :style="toggleStyle"
        :data-tooltip="tooltip"
      )
      .color-picker-content(slot="content")
        color-panel(
          v-model="computedColor"
          :previewColor="previewColor"
          :showColor="showColor"
        )
</template>

<script>
export default {
  name: 'ColorPicker',
  components: {
    'chrome-picker': () => import('vue-color').then(({ Chrome }) => Chrome)
  },
  props: {
    value: {
      type: String,
      'default': '#000000'
    },
    tooltip: {
      type: String,
      'default': ''
    },
    previewColor: {
      type: Boolean,
      'default': false
    },
    showColor: {
      type: Boolean,
      'default': false
    },
    position: {
      type: String,
      'default': 'bottom-right'
    }
  },
  computed: {
    computedColor: {
      get () {
        return this.value
      },
      set (value) {
        // check if color from chrome picker
        if (value.hex) {
          this.computedColor = value.hex
        } else {
          this.$emit('input', value)
        }
      }
    },
    cleanColor () {
      let color = this.computedColor
      if (color && color.indexOf('#') >= 0) {
        color = color.substring(color.indexOf('#') + 1)
      }
      return color
    },
    toggleStyle () {
      if (this.showColor || (this.previewColor && this.cleanColor !== '000000')) {
        return {
          'background': '#' + this.cleanColor,
          'border': '2px solid #5CA3FD',
          'border-radius': '6px',
          width: '30px',
          height: '30px',
          top: '1px'
        }
      } else {
        return {}
      }
    }
  },
  methods: {
    chooseColor (color) {
      this.computedColor = color
    },
    onOpen () {
      this.$emit('open')
    },
    onClose () {
      this.$emit('close')
    }
  }
}
</script>

<style lang="scss" scoped>
  @import '../../assets/css/variables.scss';

  $color-picker-color-width: 2rem;
  $color-picker-color-margin: 0.25rem;
  .color-picker {
    position: relative;
    display: inline-block;
    width: 60px;
    height: 34px;

    .color-picker-content {
      padding: 12px;
    }

    & /deep/ .color-picker-selected {
      position: relative;
      display: inline-block;
      height: 34px;
      width: 34px;
      border-radius: 6px;
      border: 2px solid #5CA3FD;
      transition: all 0.3s ease;
      margin-top: -3px;
    }
    & /deep/ .color-picker-toggle {
      position: relative;
      display: inline-block;
      width: 24px;
      height: 24px;
      background: no-repeat url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABGdBTUEAALGPC/xhBQAABThJREFUSA2FVktoXFUY/s+5586dyTySSdLEpkMtprQVwWK3CnYrgYa6KUJBhC4l2G5d1OLSRbG6s1CE4tKSQHClK0UUQQTBgg2tNp2GTh6TZmbu3Htefv/pbWyDtSd8Ofdx7vf9j++cRND/jMPnVluyl85XjZurGTfb0G6mlhM1jG3XtF+pW7c86eTiwk/HV59FI/7rxdH3OzN+OLhktXvP5SaqG0917aiRAzw/gbpxtp67a7VYXXzn1xPtvXxy74NXLqydEjK/SYrOiYjwI8ggDAv4IhzpPUUM50lZHynnz8WD7OY3h388tZfvKYFXP3ywIBTdkJLqMpIkQC5wo6WAgCBXCPAUOaIYAiUgYRhfT7S/8XPrh4UnRXYFXvt465RQ8rJQQooY5EqSDEAGEOAswBmG9EQKGQRy66lcoGKsLBt3+c/p73czCQKvf9afiWK6LkEuQb6LQoQzeZwFK3B5OHqOvALyEfQoIFxDRA+vdyYXZ3htENDGXULEdRmj5AVkCUKMQjDjXhT5KmSQgKwCYjgsAC6jGpqf2JSk26xrs3WJBcTJL3wry9M7ztrI4wNnHTksdHCMzS3ZoSUz0KR7mqb7hl7sAX1NLVzvTw3tw/smuwtQ7iFJz+ghy9RGcX5IGannZYwiRBG5yJOAXQQ3WDrgUVc9omXBLLUcVIiebTuGZ0zezAwI1xH5Nsh3SPgBCUojkefzKiqJOWcj8qinALzl5iIDBdcAuyIoQW9gggCXYjKzNIXox7M+HLUGbIF4BwJ9kA9xnZEUek6h7rMChB4W8WgeFSIOUfuSC31gR/EwKAltZIH4IEo0OVzDPlgF6UaIXHLkfoiVOWYNITurfCmb4R0ksKekBxHvJuhwRlwahZ6oEUYUROhun05sZvRC/xfU/A4i3wQZR50FUoTBxCCwcJCfUXmpAz4wPmdwDrWXiL785PRzVv77msNWeXm9Db8c8awqUCphyEmDOScbDcmqHuWlDepXb9H69BJ91d6gd7/DF99Wif6OyXchPQAyQV4je/YBnys8e9FWedxZcUIfCaQyBzmIZQriARm1TVnSobTyF/Ubv9FJx/XFt28OUFC0648SUTsm2sRdDyIpiCFEOcBb34gVpZPOshH5W0zsogzkA5D3ScfbpEvrNCzfp6xym46iaS3UlccqDqxDL8MluPZVFLgDF3YjEjuFyBDVh4gwclnpyuai9tmnTqaRjTjqPvAQAluUJw9IJ/cD8X6QjxanURfUZiqnCBsOcWJjwIIwAm1DqA+RAdyXSassLcpbxxdWdblzjUuRgTBL1igrt2lYuRfIp1DMfUAT5CNsY4wUJ+sWRMQ+2HYarpm2JKYA3ItJYMKSb9pr4ut7q4o/iEYGF4d284yOenUTP4reqS6Ng7SJDTIKVPn0LNwGl1NfSGrWDKlxkKHenInnkwAtoYR2lBcXmZvLSHcPft7Wpe2zOtlwebyBHdylMZAzcQOkNaACwDO8nDSQgrLHn4/iSBlDbwAxFq5dNOrPio/Ww1+3IMAf7RxYXrKl7fM+fugaIK8hYiauQqRSRF9sNRQsbKsgYhKI1lH/Bsgb1skGnRcfdJeYk8euAN/o5u9XGkKerpLfqYaagxwiCVCCCFrIy4LFOYsMveBMuMGy5nZEnU6LM70rYVHx6ykBftZt3F6qxeLYiKCrI8LbMpMD3KzHixEvLC5w4gQRaxK6SqPJMfFGths5XoURXPb4Zu/89uBAqzLM5xtk55rOzU7gbOGmj5NpT5BbaXpaHovkYmsifea/Lf8Ao2LcdIfa3kkAAAAASUVORK5CYII=') 50% 50%;
      border-radius: 100%;
      cursor: pointer;
      transition: all 0.3s ease;
      top: 3px;

      &.is-active {
        &:before {
          content: '';
          position: absolute;
          z-index: -1;
          top: -3px;
          left: -3px;
          right: -3px;
          bottom: -3px;
          border-radius: 50%;
          border: 1px solid rgba(0,0,0,0.15);
        }
      }
    }

    .vc-chrome {
      font-family: inherit;
      box-shadow: none;
      width: 212px;
      border-radius: 6px;
      background: transparent;
      margin: -12px -12px 0;
    }
    & /deep/ {
      .vc-chrome-body {
        padding: 10px 0 10px;
        background: transparent;
      }
    }
  }
</style>
