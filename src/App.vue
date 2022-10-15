<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<style lang="scss">
* {
  &:focus {
    outline: none;
  }
}

body {
  margin: 0;
  padding: 0;
}
.ant-layout {
  background-color: transparent !important;
}
</style>
