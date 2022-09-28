<template>
  <div>
    <h2 class="month">{{ month.name }}</h2>
    <div class="article-list container">
      <div v-for="(day, index) in month.days" :key="index">
        <Day :day="day" />
      </div>
    </div>
  </div>
</template>

<script>
import Day from "./Day";

export default {
  name: "Month",
  props: ["month"],
  components: {
    Day,
  },
};
</script>