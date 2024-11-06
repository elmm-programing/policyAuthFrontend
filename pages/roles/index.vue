<template>
  <div class="h-screen">
    <Navbar hideItem="/roles" />
    <div class="mt-2 ">
      <div class="flex flex-row justify-end mx-3">
        <Button label="Add New Role" icon="pi pi-plus" class="p-button-success mb-4 w-[15%]"
          @click="showAddRoleDialog = true" />
      </div>
      <Dialog header="Add New Role" v-model:visible="showAddRoleDialog" modal>
        <form @submit.prevent="onAddRole">
          <div class="flex flex-wrap align-items-center mb-3 gap-2">
            <label for="role_name" class="p-sr-only">Role Name</label>
            <InputText id="role_name" placeholder="Role Name" class="ml-2" v-model="newRole.role_name" required />
          </div>
          <Button label="Add Role" type="submit" class="p-button-success" />
        </form>
      </Dialog>
      <DataTable v-model:editingRows="editingRows" :value="roles" editMode="row" dataKey="role_id"
        @row-edit-save="onRowEdit" :pt="{
          table: { style: 'min-width: 50rem' },
          column: {
            bodycell: ({ state  }:any ) => ({
              style: state['d_editing'] && 'padding-top: 0.6rem; padding-bottom: 0.6rem'
            })
          }
        }">
        <Column field="role_id" header="ID" style="width: 20%">
          <template #body="{ data, field }">
            {{ data[field] }}
          </template>
        </Column>
        <Column field="role_name" header="Role Name" style="width: 20%">
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
      <sectionsRolesResourcePermissions />
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

interface Role {
  role_id: number;
  role_name: string;
}

const editingRows = ref([]);
const newRole = ref<Role>({ role_id: 0, role_name: '' });
const showAddRoleDialog = ref(false);

const { data: roles, error, refresh } = await useFetch<Role[]>('/roles', {
  baseURL: config.public.apiBase
});

if (error.value) {
  toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch roles', life: 3000 });
}

const onRowEdit = async (event: any) => {
  const data = event.newData as Role;
  try {
    await $fetch(`/roles?id=${data.role_id}`, {
      baseURL: config.public.apiBase,
      method: 'PUT',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    refresh();
    toast.add({ severity: 'success', summary: 'Success', detail: 'Role updated successfully', life: 3000 });
  } catch (error) {
    console.error('Error saving role:', error);
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to update role', life: 3000 });
  }
};

const onRowDelete = async (data: Role) => {
  try {
    await $fetch(`/roles?id=${data.role_id}`, {
      baseURL: config.public.apiBase,
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    refresh();
    toast.add({ severity: 'success', summary: 'Success', detail: 'Role deleted successfully', life: 3000 });
  } catch (error) {
    console.error('Error deleting role:', error);
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete role', life: 3000 });
  }
};

const onAddRole = async () => {
  try {
    await $fetch('/roles', {
      baseURL: config.public.apiBase,
      method: 'POST',
      body: JSON.stringify(newRole.value),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    newRole.value = { role_id: 0, role_name: '' };
    showAddRoleDialog.value = false;
    refresh();
    toast.add({ severity: 'success', summary: 'Success', detail: 'Role added successfully', life: 3000 });
  } catch (error) {
    console.error('Error adding role:', error);
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to add role', life: 3000 });
  }
};
</script>

