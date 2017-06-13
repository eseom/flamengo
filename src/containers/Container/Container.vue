<template>
  <div>
    <div class="left-bar">
      <i class="fa fa-home button-home"></i>
      <a href @click.prevent="disconnect" class="button-disconnect">
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

<style scoped>
.left-bar {
  position: fixed;
  top: 0;
  padding-top: 8px;
  width: 55px;
  height: 100%;
  background-color: #2c2c2c;
}

.button-home {
  color: #ababab;
  font-size: 25px;
  margin-left: 16px;
  margin-top: 15px;
}

.button-disconnect {
  position: absolute;
  color: red;
  font-size: 25px;
  left: 17px;
  bottom: 20px;
}
</style>