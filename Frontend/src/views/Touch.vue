<script>
import grabTouch from '../components/touch/grabTouch.vue';
export default {
  components: {
    grabTouch,
  },
};
</script>

<template>
<!--  为660 * 374的倍数-->
  <grabTouch :width="1650" :height="935"/>
</template>

<style scoped>
</style>
