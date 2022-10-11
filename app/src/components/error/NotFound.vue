<template>
  <div class="main-content">
    <div class="container h-100">
      <div class="row align-items-center h-100">
        <div class="col-8 mx-auto">
          <div class="jumbotron -100">
            <h3>Sorry, this page could not be found :(</h3>
            <hr />
            <p class="lead">
              Return <router-link to="/">Home</router-link>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {defineComponent} from "vue";

export default defineComponent({
  name: "NotFound",
})
</script>
