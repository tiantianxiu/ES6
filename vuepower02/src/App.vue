<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
    export default {
        name: 'app'
    }
</script>

<style lang="scss">
  * {
    margin: 0;
    padding: 0;
  }

  #app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: left;
    color: #2c3e50;
    max-width: 640px;
    margin: 0 auto;
  }

  body {
    font-size: 14px;
  }

  h1, h2 {
    font-weight: normal;
  }

  ul {
    list-style-type: none;
    padding: 0;
  }

  li {
    display: inline-block;
    margin: 0 10px;
  }

  a {
    color: #42b983;
  }

  em, i {
    font-style: normal;
  }

  .has-header{
    margin-top: 50px;
  }

  /* 引用回复的样式 */

  .quote {
    background-color: #e5e5e5;
    color: #858585;
    font-size: 13px;
    padding: 10px;
    box-shadow: inset 0 0 4px 4px rgba(0, 0, 0, 0.01);
    a {
      color: #858585;
    }
  }

  .icon-width {
    width: 16px;
    height: 16px;
    margin-left: 5px;
    vertical-align: middle;
  }

  .tag-item {
    height: 14px;
    line-height: 14px;
    text-align: center;
    background-color: #000;
    font-size: 10px;
    color: #fff;
    border-radius: 7px;
    margin: auto 5px auto 0;
    display: inline-block;
    padding: 0 6px;
  }

  .tag-green {
    background-color: #00c481;
  }

  .tag-red {
    background-color: #e92323;
  }

  .icon-v {
    width: 11px;
    height: 11px;
    display: inline-block;
    vertical-align: middle;
    margin-right: 2px;
  }

  .ib-width {
    width: 26px;
    height: 26px;
    vertical-align: middle;
  }

  .section-title {
    padding: 10px 15px;
    text-align: left;
    border-bottom: 1px solid #eee;
    background-color: #fff;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    span {
      color: #676767;
      font-size: 14px;
      height: 14px;
      line-height: 14px;
      padding-left: 10px;
      border-left: 2px solid #00c481;
    }
  }

  .article {
    border-bottom: 1px solid #eee;
    padding: 10px 15px;
    position: relative;
    align-items: center;
    background-color: #fff;
    .author-info {
      margin-bottom: 5px;
      padding-left: 50px;
      position: relative;
      min-height: 45px;
      .author {
        img {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          position: absolute;
          top: 50%;
          left: 0;
          margin-top: -20px;
        }
      }
      .author-name {
        font-size: 15px;
        line-height: 25px;
        display: flex;
        span {
          text-overflow: ellipsis;
          overflow: hidden;
          display: inline-block;
          vertical-align: middle;
          margin-right: 5px;
        }
        .icon1 {
          display: inline-block;
          margin-right: 3px;

          img {
            width: 17px;
            height: 17px;
            margin: 0;
            vertical-align: middle;
          }
        }
      }
      .tag-item-wrap {
        display: flex;
        align-items: center;
        .e-power {
          img {
            width: 14px;
            height: 10px;
            margin-right: 4px;
            vertical-align: middle;
          }
          span {
            font-size: 14px;
            color: #00c481;
            i {
              vertical-align: middle;
              font-size: 10px;
              color: #6a6a6a;

            }
          }

        }

      }
      .ext {
        position: absolute;
        top: 5px;
        right: 0;
        color: #757575;
        font-size: 10px;

      }
    }
  }

  .box-wrap {
    display: flex;
    box-align: center;
    align-items: center;
    justify-content: center;
  }
  img {
    max-width: 100%;
  }
  video{
    width: 100%
  }
</style>
