<script setup lang="ts">
import { ref } from 'vue';
import { useFetch } from '#app';
import InputText from 'primevue/inputtext';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import Dropdown from 'primevue/dropdown';
import { useToast } from "primevue/usetoast";
import { FilterMatchMode } from 'primevue/api';

const toast = useToast();
const config = useRuntimeConfig();

interface Resource {
  resource_id: number;
  resource_name: string;
}

interface Role {
  role_id: number;
  role_name: string;
}

interface ResourceRole {
  id: number;
  resource_id: number;
  resource_name: string;
  role_id: number;
  role_name: string;
}

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  resource_name: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
  role_name: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
});


const newResourceRole = ref<ResourceRole>({ id: 0, resource_id: 0, resource_name: '', role_id: 0, role_name: '' });

const showAddResourceRoleDialog = ref(false);

const selectedResource = ref<Resource | null>(null);
const selectedRole = ref<Role | null>(null);

const { data: resources, error: resourceError, refresh: refreshResources } = await useFetch<Resource[]>('/resources', {
  baseURL: config.public.apiBase
});

const { data: roles, error: roleError } = await useFetch<Role[]>('/roles', {
  baseURL: config.public.apiBase
});

const { data: resourceRoles, error: resourceRoleError, refresh: refreshResourceRoles } = await useFetch<ResourceRole[]>('/resource_roles', {
  baseURL: config.public.apiBase
});

if (resourceError.value) {
  toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch resources', life: 3000 });
}

if (roleError.value) {
  toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch roles', life: 3000 });
}

if (resourceRoleError.value) {
  toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch resource roles', life: 3000 });
}
const onAddResourceRole = async () => {
  if (!selectedResource.value || !selectedRole.value) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Please select both resource and role', life: 3000 });
    return;
  }

  try {
    await $fetch('/resource_roles', {
      baseURL: config.public.apiBase,
      method: 'POST',
      body: JSON.stringify({ resource_id: selectedResource.value.resource_id, role_id: selectedRole.value.role_id }),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    newResourceRole.value = { id: 0, resource_id: 0, resource_name: '', role_id: 0, role_name: '' };
    showAddResourceRoleDialog.value = false;
    refreshResourceRoles();
    toast.add({ severity: 'success', summary: 'Success', detail: 'Resource role added successfully', life: 3000 });
  } catch (error) {
    console.error('Error adding resource role:', error);
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to add resource role', life: 3000 });
  }
};

const onRowDeleteResourceRole = async (data: ResourceRole) => {
  try {
    await $fetch(`/resource_roles/${data.id}`, {
      baseURL: config.public.apiBase,
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    refreshResourceRoles();
    toast.add({ severity: 'success', summary: 'Success', detail: 'Resource role deleted successfully', life: 3000 });
  } catch (error) {
    console.error('Error deleting resource role:', error);
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete resource role', life: 3000 });
  }
};



</script>
<template>
 <!-- Resource Roles Section -->
      <div class="mt-8">
        <h2 class="font-bold text-xl">Resource Roles:</h2>
        <div class="flex flex-row justify-end mx-3">
          <Button label="Add Resource Role" icon="pi pi-plus" class="p-button-success mb-4 w-[15%]"
            @click="showAddResourceRoleDialog = true" />
        </div>
        <Dialog header="Add Resource Role" v-model:visible="showAddResourceRoleDialog" modal>
          <form @submit.prevent="onAddResourceRole">
            <div class="flex flex-wrap align-items-center mb-3 gap-2">
              <label for="resource_id" class="p-sr-only">Resource</label>
              <Dropdown id="resource_id" v-model="selectedResource" :options="resources" optionLabel="resource_name" placeholder="Select a Resource" class="ml-2" required />
            </div>
            <div class="flex flex-wrap align-items-center mb-3 gap-2">
              <label for="role_id" class="p-sr-only">Role</label>
              <Dropdown id="role_id" v-model="selectedRole" :options="roles" optionLabel="role_name" placeholder="Select a Role" class="ml-2" required />
            </div>
            <Button label="Add Resource Role" type="submit" class="p-button-success" />
          </form>
        </Dialog>
        <DataTable :value="resourceRoles" v-model:filters="filters" dataKey="id" paginator :rows="20" filterDisplay="row"
          :globalFilterFields="['resource_name', 'role_name']">
          <Column field="resource_id" header="Resource ID" style="width: 20%">
            <template #body="{ data, field }">
              {{ data[field] }}
            </template>
          </Column>
          <Column field="resource_name" header="Resource Name" style="width: 20%">
            <template #body="{ data, field }">
              {{ data[field] }}
            </template>
            <template #filter="{ filterModel, filterCallback }">
              <InputText v-model="filterModel.value" type="text" @input="filterCallback()" class="p-column-filter" placeholder="Search by resource name" />
            </template>
          </Column>
          <Column field="role_id" header="Role ID" style="width: 20%">
            <template #body="{ data, field }">
              {{ data[field] }}
            </template>
          </Column>
          <Column field="role_name" filterField="role_name" header="Role Name" style="width: 20%">
            <template #body="{ data, field }">
              {{ data[field] }}
            </template>
            <template #filter="{ filterModel, filterCallback }">
              <InputText v-model="filterModel.value" type="text" @input="filterCallback()" class="p-column-filter" placeholder="Search by role name" />
            </template>
          </Column>
          <Column style="width: 10%; min-width: 8rem" bodyStyle="text-align:center">
            <template #body="{ data }">
              <Button icon="pi pi-trash" class="p-button-danger" @click="onRowDeleteResourceRole(data)" />
            </template>
          </Column>
        </DataTable>
      </div>
 
</template>
