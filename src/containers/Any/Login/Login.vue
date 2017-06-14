<template>
  <div class="centered">
    <div class="box-body box-centered style-inverse">
      <div class="pattern-bg"></div>
      <h2 class="text-light" style="margin-bottom: 20px;">Connect</h2>
  
      <form method="POST" name="login_user_form" v-on:submit.prevent="onSubmit">
        <div class="alert alert-info" v-if="!error || dirty">
          Input database connection information
        </div>
        <div class="alert alert-danger" v-else>
          {{error}}
        </div>
  
        <div class="form-group">
          <p>
            <input class="form-control" id="host" v-model="host" name="host" placeholder="Host" @keyup="setDirty">
          </p>
        </div>
        <div class="form-group">
          <p>
            <input class="form-control" id="port" v-model="port" name="port" placeholder="Port" @keyup="setDirty">
          </p>
        </div>
        <div class="form-group">
          <p>
            <input class="form-control" id="username" v-model="username" name="username" placeholder="Username" type="text" value="" @keyup="setDirty">
          </p>
        </div>
        <div class="form-group">
          <p>
            <input class="form-control" id="password" v-model="password" name="password" placeholder="Password" type="password" value="" @keyup="setDirty">
          </p>
        </div>
        <div class="form-group">
          <p>
            <input class="form-control" id="dbname" v-model="dbname" name="dbname" placeholder="Database name" type="text" value="" @keyup="setDirty">
          </p>
        </div>
  
        <div class="form-group">
          <input class="btn btn-primary" id="submit" name="submit" type="submit" value="Connect">
        </div>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: '',
  async created() {
  },
  nes: {
    subscribe: [
      '/item/5',
    ],
  },
  methods: {
    async onSubmit() {
      try {
        const result = await this.$http.post('/api/db/connect', {
          host: this.host,
          port: this.port,
          username: this.username,
          password: this.password,
          dbname: this.dbname,
        }).then(response => response.body)
        console.log(result)
        this.$router.push('/query')
      } catch (e) {
        this.dirty = false
        this.error = e.response.body.message
      }
    },
    setDirty(e) {
      if (e.key === 'Enter') return
      this.dirty = true
    },
    test() {
      this.$nes.request('hello')
        .then((response) => {
          console.log('============', response)
        })
    }
  },
  data() {
    return {
      loginURL: 'qwer',

      host: 'localhost',
      port: '5432',
      username: '',
      password: '',
      dbname: '',

      error: '',
      dirty: '',
    }
  }
}
</script>

<style>
.centered {
  position: fixed;
  width: 400px;
  top: 50%;
  left: 50%;
  /* bring your own prefixes */
  transform: translate(-50%, -50%);
}
</style>