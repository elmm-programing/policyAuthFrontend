<template>
  <div class="h-screen">
    <Navbar hideItem="/permissions" />
    <div class="mt-2 ">
      <div class="flex flex-row justify-end mx-3">
        <Button label="Add New Permission" icon="pi pi-plus" class="p-button-success mb-4 w-[15%]"
          @click="showAddPermissionDialog = true" />
      </div>
      <Dialog header="Add New Permission" v-model:visible="showAddPermissionDialog" modal>
        <form @submit.prevent="onAddPermission">
          <div class="flex flex-wrap align-items-center mb-3 gap-2">
            <label for="permission_name" class="p-sr-only">Permission Name</label>
            <InputText id="permission_name" placeholder="Permission Name" class="ml-2" v-model="newPermission.permission_name" required />
          </div>
          <Button label="Add Permission" type="submit" class="p-button-success" />
        </form>
      </Dialog>
      <DataTable v-model:editingRows="editingRows" :value="permissions" editMode="row" dataKey="permission_id"
        @row-edit-save="onRowEdit" :pt="{
          table: { style: 'min-width: 50rem' },
          column: {
            bodycell: ({ state  }:any ) => ({
              style: state['d_editing'] && 'padding-top: 0.6rem; padding-bottom: 0.6rem'
            })
          }
        }">
        <Column field="permission_id" header="ID" style="width: 20%">
          <template #body="{ data, field }">
            {{ data[field] }}
          </template>
        </Column>
        <Column field="permission_name" header="Permission Name" style="width: 20%">
          <template #editor="{ data, field }">
            <InputText v-model="data[field]" />
          </template>
        </Column>
        <Column :rowEditor="true" style="width: 10%; min-width: 8rem" bodyStyle="text-align:center"></Column>
        <Column style="width: 10%; min-width: 8rem" bodyStyle="text-align:center">
          <template #body="{ data }">
            <Button icon="pi pi-trash" class="p-button-danger" @click="onRowDelete(data)" />
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useFetch } from '#app';
import InputText from 'primevue/inputtext';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import { useToast } from "primevue/usetoast";

const toast = useToast();
const config = useRuntimeConfig();

interface Permission {
  permission_id: number;
  permission_name: string;
}

const editingRows = ref([]);
const newPermission = ref<Permission>({ permission_id: 0, permission_name: '' });
const showAddPermissionDialog = ref(false);

const { data: permissions, error, refresh } = await useFetch<Permission[]>('/permissions', {
  baseURL: config.public.apiBase
});

if (error.value) {
  toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch permissions', life: 3000 });
}

const onRowEdit = async (event: any) => {
  const data = event.newData as Permission;
  try {
    await $fetch(`/permissions?id=${data.permission_id}`, {
      baseURL: config.public.apiBase,
      method: 'PUT',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    refresh();
    toast.add({ severity: 'success', summary: 'Success', detail: 'Permission updated successfully', life: 3000 });
  } catch (error) {
    console.error('Error saving permission:', error);
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to update permission', life: 3000 });
  }
};

const onRowDelete = async (data: Permission) => {
  try {
    await $fetch(`/permissions?id=${data.permission_id}`, {
      baseURL: config.public.apiBase,
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    refresh();
    toast.add({ severity: 'success', summary: 'Success', detail: 'Permission deleted successfully', life: 3000 });
  } catch (error) {
    console.error('Error deleting permission:', error);
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete permission', life: 3000 });
  }
};

const onAddPermission = async () => {
  try {
    await $fetch('/permissions', {
      baseURL: config.public.apiBase,
      method: 'POST',
      body: JSON.stringify(newPermission.value),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    newPermission.value = { permission_id: 0, permission_name: '' };
    showAddPermissionDialog.value = false;
    refresh();
    toast.add({ severity: 'success', summary: 'Success', detail: 'Permission added successfully', life: 3000 });
  } catch (error) {
    console.error('Error adding permission:', error);
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to add permission', life: 3000 });
  }
};
</script>

