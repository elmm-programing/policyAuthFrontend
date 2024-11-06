<template>
  <div class="h-screen">
    <div class="text-center  h-[7%] text-white font-bold text-2xl py-5 bg-[#10b981]">Policy Base Auth</div>
    <div class="flex flex-col  h-[93%]  gap-3  justify-center ">
      <div class="flex flex-row mx-auto w-4/5 h-2/6 gap-2  ">
        <NuxtLink class="basis-3/6 h-[100%] " to="/users">
          <Button outlined class="border-2 w-[100%] h-[100%]   justify-center   ">
            Users
          </Button>
        </NuxtLink>
        <NuxtLink class="basis-3/6 h-[100%] " to="/roles">
          <Button outlined class="border-2 w-[100%] h-[100%]   justify-center   ">
            Roles
          </Button>
        </NuxtLink>

      </div>
      <div class="flex flex-row mx-auto w-4/5 h-2/6 gap-2  ">
        <NuxtLink class="basis-3/6 h-[100%] " to="/resources">
          <Button outlined class="border-2 w-[100%] h-[100%]   justify-center   ">
            Resources
          </Button>
        </NuxtLink>
        <NuxtLink class="basis-3/6 h-[100%] " to="/permissions">
          <Button outlined class="border-2 w-[100%] h-[100%]   justify-center   ">
            Permissions
          </Button>
        </NuxtLink>

      </div>
    </div>
  </div>

</template>
