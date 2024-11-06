<template>
    <div class="bg-[#10b981] m-0 p-0">
      <Menubar :model="filteredItems"  class="flex justify-center "  :pt="{root:{class:'bg-[#10b981] '}}">
      <template #item="{ item, props, hasSubmenu }">
        <router-link v-if="item.route" v-slot="{ href, navigate }" :to="item.route" custom>
          <a v-ripple class="mx-2" :href="href" v-bind="props.action" @click="navigate">
            <span class=" text-white hover:text-[#10b981]">{{ item.label }}</span>
          </a>
        </router-link>
        <a v-else v-ripple class="mx-2" :href="item.url" :target="item.target" v-bind="props.action">
          <span :class="item.icon" />
          <span class="ml-2">{{ item.label }}</span>
        </a>
      </template>
    </Menubar>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { defineProps } from 'vue';

const props = defineProps({
  hideItem: String
});

const items = ref([
  {
    label: 'Home',
    route: '/'
  },
  {
    label: 'Users',
    route: '/users'
  },
  {
    label: 'Roles',
    route: '/roles'
  },
  {
    label: 'Resources',
    route: '/resources'
  },
  {
    label: 'Permissions',
    route: '/permissions'
  }
]);

const filteredItems = computed(() => {
  return items.value.filter(item => item.route !== props.hideItem);
});
</script>
