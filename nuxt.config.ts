// https://nuxt.com/docs/api/configuration/nuxt-config
// import Aura from '@primevue/themes/aura';
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
 runtimeConfig: {
    public: {
      apiBase: '', // can be overridden by NUXT_PUBLIC_API_BASE environment variable
    }
  }, 
   modules: ['nuxt-primevue', '@nuxtjs/tailwindcss'],
      primevue: {
    cssLayerOrder: 'tailwind-base, primevue, tailwind-utilities',
      options: {
        ripple: true,
        inputStyle: 'filled'
    } 
        /* Options */
    },
  css: ['primevue/resources/themes/aura-light-green/theme.css','assets/css/tailwind.css','primeicons/primeicons.css']
})
