<template lang="pug">
  .color-panel
    chrome-picker(v-if="isPicker" v-model="computedColor")
    .predefined(v-if="!isPicker")
      //.title Grayscale
      .colors
        .color(
          v-for="color in colorsGray"
          v-on:click.stop="chooseColor(color.color)"
          v-bind:class="{'is-white': color.color === '#ffffff'}"
          v-bind:style="{'background-color': color.color}"
        )
      //.title Color
      .colors
        .color(
          v-for="color in colors"
          v-on:click.stop="chooseColor(color.color)"
          v-bind:style="{'background-color': color.color}"
        )
      input.color-panel-input(v-model="computedColor")

    .actions
      .toggle(
        v-on:click="isPicker = false"
        v-bind:class="{'is-active': !isPicker}"
        v-bind:style="toggleStyle"
      )
      .toggle(
        v-on:click="isPicker = true"
        v-bind:class="{'is-active': isPicker}"
      )
</template>

<script>
export default {
  name: 'ColorPanel',
  components: {
    'chrome-picker': () => import('vue-color').then(({ Chrome }) => Chrome)
  },
  props: {
    value: {
      type: String,
      'default': '#000000'
    },
    previewColor: {
      type: Boolean,
      'default': false
    },
    showColor: {
      type: Boolean,
      'default': false
    }
  },
  data () {
    return {
      colorsGray: [
        { color: '#ffffff' },
        { color: '#cccccc' },
        { color: '#666666' },
        { color: '#333333' },
        { color: '#000000' }
      ],
      colors: [
        { color: '#e74c3c', colorDark: '#c0392b' },
        { color: '#e67e22', colorDark: '#d35400' },
        { color: '#f1c40f', colorDark: '#f39c12' },
        { color: '#2ecc71', colorDark: '#27ae60' },
        { color: '#1abc9c', colorDark: '#16a085' },
        { color: '#3498db', colorDark: '#2980b9' },
        { color: '#9b59b6', colorDark: '#8e44ad' },

        { color: '#ecf0f1', colorDark: '#bdc3c7' },
        { color: '#95a5a6', colorDark: '#7f8c8d' },
        { color: '#34495e', colorDark: '#2c3e50' }
      ],
      isPicker: false
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
      return {
        'background': '#' + this.cleanColor
      }
    }
  },
  methods: {
    chooseColor (color) {
      this.computedColor = color
    }
  }
}
</script>

<style lang="scss" scoped>
  @import '../../assets/css/variables.scss';

  $color-panel-color-width: 30px;
  $color-panel-color-margin: 6px;
  .color-panel {
    width: 198px;
    padding-bottom: 15px;
    .toggle {
      position: relative;
      display: inline-block;
      width: 24px;
      height: 24px;
      margin-left: 8px;
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

    .actions {
      float: right;
      margin-bottom: 16px;
    }

    .recolor-title {
      display: inline-block;
      vertical-align: bottom;
      color: rgba(0,0,0,.5);
      @media (max-width: $icon-workspace-recolor-title) {
        display: none;
      }
    }

    .recolor-icon {
      display: inline-block;
      width: 13px;
      height: 13px;
      margin-right: 6px;
      border-radius: 100%;
      background: no-repeat url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABGdBTUEAALGPC/xhBQAABThJREFUSA2FVktoXFUY/s+5586dyTySSdLEpkMtprQVwWK3CnYrgYa6KUJBhC4l2G5d1OLSRbG6s1CE4tKSQHClK0UUQQTBgg2tNp2GTh6TZmbu3Htefv/pbWyDtSd8Ofdx7vf9j++cRND/jMPnVluyl85XjZurGTfb0G6mlhM1jG3XtF+pW7c86eTiwk/HV59FI/7rxdH3OzN+OLhktXvP5SaqG0917aiRAzw/gbpxtp67a7VYXXzn1xPtvXxy74NXLqydEjK/SYrOiYjwI8ggDAv4IhzpPUUM50lZHynnz8WD7OY3h388tZfvKYFXP3ywIBTdkJLqMpIkQC5wo6WAgCBXCPAUOaIYAiUgYRhfT7S/8XPrh4UnRXYFXvt465RQ8rJQQooY5EqSDEAGEOAswBmG9EQKGQRy66lcoGKsLBt3+c/p73czCQKvf9afiWK6LkEuQb6LQoQzeZwFK3B5OHqOvALyEfQoIFxDRA+vdyYXZ3htENDGXULEdRmj5AVkCUKMQjDjXhT5KmSQgKwCYjgsAC6jGpqf2JSk26xrs3WJBcTJL3wry9M7ztrI4wNnHTksdHCMzS3ZoSUz0KR7mqb7hl7sAX1NLVzvTw3tw/smuwtQ7iFJz+ghy9RGcX5IGannZYwiRBG5yJOAXQQ3WDrgUVc9omXBLLUcVIiebTuGZ0zezAwI1xH5Nsh3SPgBCUojkefzKiqJOWcj8qinALzl5iIDBdcAuyIoQW9gggCXYjKzNIXox7M+HLUGbIF4BwJ9kA9xnZEUek6h7rMChB4W8WgeFSIOUfuSC31gR/EwKAltZIH4IEo0OVzDPlgF6UaIXHLkfoiVOWYNITurfCmb4R0ksKekBxHvJuhwRlwahZ6oEUYUROhun05sZvRC/xfU/A4i3wQZR50FUoTBxCCwcJCfUXmpAz4wPmdwDrWXiL785PRzVv77msNWeXm9Db8c8awqUCphyEmDOScbDcmqHuWlDepXb9H69BJ91d6gd7/DF99Wif6OyXchPQAyQV4je/YBnys8e9FWedxZcUIfCaQyBzmIZQriARm1TVnSobTyF/Ubv9FJx/XFt28OUFC0648SUTsm2sRdDyIpiCFEOcBb34gVpZPOshH5W0zsogzkA5D3ScfbpEvrNCzfp6xym46iaS3UlccqDqxDL8MluPZVFLgDF3YjEjuFyBDVh4gwclnpyuai9tmnTqaRjTjqPvAQAluUJw9IJ/cD8X6QjxanURfUZiqnCBsOcWJjwIIwAm1DqA+RAdyXSassLcpbxxdWdblzjUuRgTBL1igrt2lYuRfIp1DMfUAT5CNsY4wUJ+sWRMQ+2HYarpm2JKYA3ItJYMKSb9pr4ut7q4o/iEYGF4d284yOenUTP4reqS6Ng7SJDTIKVPn0LNwGl1NfSGrWDKlxkKHenInnkwAtoYR2lBcXmZvLSHcPft7Wpe2zOtlwebyBHdylMZAzcQOkNaACwDO8nDSQgrLHn4/iSBlDbwAxFq5dNOrPio/Ww1+3IMAf7RxYXrKl7fM+fugaIK8hYiauQqRSRF9sNRQsbKsgYhKI1lH/Bsgb1skGnRcfdJeYk8euAN/o5u9XGkKerpLfqYaagxwiCVCCCFrIy4LFOYsMveBMuMGy5nZEnU6LM70rYVHx6ykBftZt3F6qxeLYiKCrI8LbMpMD3KzHixEvLC5w4gQRaxK6SqPJMfFGths5XoURXPb4Zu/89uBAqzLM5xtk55rOzU7gbOGmj5NpT5BbaXpaHovkYmsifea/Lf8Ao2LcdIfa3kkAAAAASUVORK5CYII=') 50% 50%;
    }

    .predefined {
      padding: 0;
      margin-bottom: -30px;
    }
    .title {
      margin: 0 0 6px;
      color: $color-font-dark;
      &:first-child {
        margin-top: 0;
      }
    }
    .colors {
      width: $color-panel-color-width * 5 + $color-panel-color-margin * 10;
      margin: 0 (-$color-panel-color-margin);
    }

    .color {
      position: relative;
      display: inline-block;
      width: $color-panel-color-width;
      height: $color-panel-color-width;
      margin: 0 $color-panel-color-margin $color-panel-color-margin*2;
      vertical-align: top;
      border-radius: 6px;
      cursor: pointer;

      &.is-white {
        border: 1px solid #ccc;
      }
    }
    .color-second {
      position: absolute;
      bottom: 0;
      width: 100%;
      height: 50%;
      cursor: pointer;
    }

    .color-panel-input {
      width: 80px;
      margin-top: 11px;
    }

    .vc-chrome {
      font-family: inherit;
      box-shadow: none;
      width: 100%;
      border-radius: 6px;
      background: transparent;
    }
    & /deep/ {
      .vc-chrome-body {
        padding: 10px 0 10px;
        background: transparent;
      }
      .vc-chrome-saturation-wrap {
        border-radius: 0 6px 0 0;
      }
      .vc-chrome-controls {
        align-items: center;
      }
      .vc-chrome-hue-wrap {
        margin-bottom: 0;
      }
      .vc-chrome-color-wrap,
      .vc-chrome-alpha-wrap,
      .vc-chrome-fields-wrap {
        display: none;
      }
    }
  }
</style>
