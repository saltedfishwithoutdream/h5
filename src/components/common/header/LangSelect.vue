<template>
  <a-dropdown>
    <span class="action lang-select-activator">
      <!-- <a-icon type="global" style="font-size: 16px"/> -->
      {{langFlag}}
    </span>
    <a-menu slot="overlay" style="width: 150px;" @click="SwitchLang">
      <a-menu-item key="zh-CN">
        <a rel="noopener noreferrer">
          <span role="img" aria-label="įŽäŊä¸­æ">đ¨đŗ</span> įŽäŊä¸­æ
        </a>
      </a-menu-item>
      <a-menu-item key="en-US">
        <a rel="noopener noreferrer">
          <span role="img" aria-label="English">đēđ¸</span> English
        </a>
      </a-menu-item>
    </a-menu>
  </a-dropdown>
</template>

<script>
import langMixin from 'core/mixins/i18n'

export default {
  name: 'LangSelect',
  mixins: [langMixin],
  computed: {
    langFlag () {
      switch (this.currentLang) {
        case 'zh-CN':
          return 'đ¨đŗ'
        case 'en-US':
          return 'đēđ¸'
        default:
          return 'đ¨đŗ'
      }
    }
  },
  methods: {
    SwitchLang (row) {
      this.setLang(row.key)
    }
  }
}
</script>
