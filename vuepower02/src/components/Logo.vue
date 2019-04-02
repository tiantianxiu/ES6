<template>
    <div class="logo">
        <!--<a href="#popover" id="openPopover" class="mui-btn mui-btn-primary mui-btn-block">-->
        <!--打开弹出菜单-->
        <!--</a>-->

        <div class="fiexd fiexd-top">
            <img src="http://www.e-power.vip/template/color_luntan18/images/logo.png" alt="">

        </div>

    </div>
</template>

<script>
    import Vue from 'vue'

    export default {
        name: 'Logo',
        data() {
            return {}
        },

    }
</script>

<style lang="scss">
    .logo {
        .fiexd {
            width: 100%;
            max-width: 640px;
            height: 50px;
            position: fixed;
            top: 0;
            left: 0;
            z-index: 3;
            background-color: #fff;
            img{
                width: 40%;
                position: absolute;
                left: 10px;
                bottom: 0;
            }
        }
    }
    .mui-scroll-wrapper{
        top: 50px;
    }
</style>
