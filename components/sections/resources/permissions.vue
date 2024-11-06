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

interface Permission {
  permission_id: number;
  permission_name: string;
}

interface ResourcePermission {
  id: number;
  resource_id: number;
  resource_name: string;
  permission_id: number;
  permission_name: string;
}

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  resource_name: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
  permission_name: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
});

const newResourcePermission = ref<ResourcePermission>({ id: 0, resource_id: 0, resource_name: '', permission_id: 0, permission_name: '' });

const showAddResourcePermissionDialog = ref(false);

const selectedResource = ref<Resource | null>(null);
const selectedPermission = ref<Permission | null>(null);

const { data: resources, error: resourceError, refresh: refreshResources } = await useFetch<Resource[]>('/resources', {
  baseURL: config.public.apiBase
});

const { data: permissions, error: permissionError } = await useFetch<Permission[]>('/permissions', {
  baseURL: config.public.apiBase
});

const { data: resourcePermissions, error: resourcePermissionError, refresh: refreshResourcePermissions } = await useFetch<ResourcePermission[]>('/resource_permissions', {
  baseURL: config.public.apiBase
});

if (resourceError.value) {
  toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch resources', life: 3000 });
}

if (permissionError.value) {
  toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch permissions', life: 3000 });
}

if (resourcePermissionError.value) {
  toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch resource permissions', life: 3000 });
}

const onAddResourcePermission = async () => {
  if (!selectedResource.value || !selectedPermission.value) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Please select both resource and permission', life: 3000 });
    return;
  }

  try {
    await $fetch('/resource_permissions', {
      baseURL: config.public.apiBase,
      method: 'POST',
      body: JSON.stringify({ resource_id: selectedResource.value.resource_id, permission_id: selectedPermission.value.permission_id }),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    newResourcePermission.value = { id: 0, resource_id: 0, resource_name: '', permission_id: 0, permission_name: '' };
    showAddResourcePermissionDialog.value = false;
    refreshResourcePermissions();
    toast.add({ severity: 'success', summary: 'Success', detail: 'Resource permission added successfully', life: 3000 });
  } catch (error) {
    console.error('Error adding resource permission:', error);
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to add resource permission', life: 3000 });
  }
};

const onRowDeleteResourcePermission = async (data: ResourcePermission) => {
  try {
    await $fetch(`/resource_permissions/${data.id}`, {
      baseURL: config.public.apiBase,
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    refreshResourcePermissions();
    toast.add({ severity: 'success', summary: 'Success', detail: 'Resource permission deleted successfully', life: 3000 });
  } catch (error) {
    console.error('Error deleting resource permission:', error);
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete resource permission', life: 3000 });
  }
};
</script>

<template>
  <!-- Resource Permissions Section -->
  <div class="mt-8">
    <h2 class="font-bold text-xl">Resource Permissions:</h2>

    <div class="flex flex-row justify-end mx-3">
      <Button label="Add Resource Permission" icon="pi pi-plus" class="p-button-success mb-4 w-[15%]"
        @click="showAddResourcePermissionDialog = true" />
    </div>
    <Dialog header="Add Resource Permission" v-model:visible="showAddResourcePermissionDialog" modal>
      <form @submit.prevent="onAddResourcePermission">
        <div class="flex flex-wrap align-items-center mb-3 gap-2">
          <label for="resource_id" class="p-sr-only">Resource</label>
          <Dropdown id="resource_id" v-model="selectedResource" :options="resources" optionLabel="resource_name"
            placeholder="Select a Resource" class="ml-2" required />
        </div>
        <div class="flex flex-wrap align-items-center mb-3 gap-2">
          <label for="permission_id" class="p-sr-only">Permission</label>
          <Dropdown id="permission_id" v-model="selectedPermission" :options="permissions" optionLabel="permission_name"
            placeholder="Select a Permission" class="ml-2" required />
        </div>
        <Button label="Add Resource Permission" type="submit" class="p-button-success" />
      </form>
    </Dialog>
    <DataTable :value="resourcePermissions" v-model:filters="filters" dataKey="id" paginator :rows="20"
      filterDisplay="row" :globalFilterFields="['resource_name', 'permission_name']">
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
          <InputText v-model="filterModel.value" type="text" @input="filterCallback()" class="p-column-filter"
            placeholder="Search by resource name" />
        </template>
      </Column>
      <Column field="permission_id" header="Permission ID" style="width: 20%">
        <template #body="{ data, field }">
          {{ data[field] }}
        </template>
      </Column>
      <Column field="permission_name" filterField="permission_name" header="Permission Name" style="width: 20%">
        <template #body="{ data, field }">
          {{ data[field] }}
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <InputText v-model="filterModel.value" type="text" @input="filterCallback()" class="p-column-filter"
            placeholder="Search by permission name" />
        </template>
      </Column>
      <Column style="width: 10%; min-width: 8rem" bodyStyle="text-align:center">
        <template #body="{ data }">
          <Button icon="pi pi-trash" class="p-button-danger" @click="onRowDeleteResourcePermission(data)" />
        </template>
      </Column>
    </DataTable>
</div></template>
