<template>
  <div>
    <div style="position: fixed; top: 0; padding-top: 8px; width: 50px; height: 100%; background-color: #2c2c2c">
      <i class="fa fa-home" style="color: #ababab; font-size: 25px; margin-left: 13px; margin-top: 15px"></i>
      <a href @click.prevent="disconnect" style="position: absolute; color: red; font-size: 25px; left: 15px; bottom: 20px;">
        <i class="fa fa-power-off"></i>
      </a>
    </div>
    <div style="margin-top: 20px; margin-bottom: 20px; margin-left: 55px; margin-right: 10px;">
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
export default {
  name: 'container',
  methods: {
    disconnect() {
      this.$http.post('/api/db/disconnect')
        .then(response => this.$router.replace({ name: 'login' }))
    },
  },
  computed: {
  },
  data() {
    return {
      currentMenu: '',
      showDrop: false,
      DEVELOPMENT,
    }
  },
}
</script>