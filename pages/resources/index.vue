<template>
  <div class="h-screen">
    <Navbar hideItem="/resources" />
    <div class="mt-2 ">
      <div class="flex flex-row justify-end mx-3">
        <Button label="Add New Resource" icon="pi pi-plus" class="p-button-success mb-4 w-[15%]"
          @click="showAddResourceDialog = true" />
      </div>
      <Dialog header="Add New Resource" v-model:visible="showAddResourceDialog" modal>
        <form @submit.prevent="onAddResource">
          <div class="flex flex-wrap align-items-center mb-3 gap-2">
            <label for="resource_name" class="p-sr-only">Resource Name</label>
            <InputText id="resource_name" placeholder="Resource Name" class="ml-2" v-model="newResource.resource_name" required />
          </div>
          <Button label="Add Resource" type="submit" class="p-button-success" />
        </form>
      </Dialog>
      <DataTable v-model:editingRows="editingRows" :value="resources" editMode="row" dataKey="resource_id"
        @row-edit-save="onRowEdit" :pt="{
          table: { style: 'min-width: 50rem' },
          column: {
            bodycell: ({ state  }:any ) => ({
              style: state['d_editing'] && 'padding-top: 0.6rem; padding-bottom: 0.6rem'
            })
          }
        }">
        <Column field="resource_id" header="ID" style="width: 20%">
          <template #body="{ data, field }">
            {{ data[field] }}
          </template>
        </Column>
        <Column field="resource_name" header="Resource Name" style="width: 20%">
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

interface Resource {
  resource_id: number;
  resource_name: string;
}

const editingRows = ref([]);
const newResource = ref<Resource>({ resource_id: 0, resource_name: '' });
const showAddResourceDialog = ref(false);

const { data: resources, error, refresh } = await useFetch<Resource[]>('/resources', {
  baseURL: config.public.apiBase
});

if (error.value) {
  toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch resources', life: 3000 });
}

const onRowEdit = async (event: any) => {
  const data = event.newData as Resource;
  try {
    await $fetch(`/resources?id=${data.resource_id}`, {
      baseURL: config.public.apiBase,
      method: 'PUT',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    refresh();
    toast.add({ severity: 'success', summary: 'Success', detail: 'Resource updated successfully', life: 3000 });
  } catch (error) {
    console.error('Error saving resource:', error);
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to update resource', life: 3000 });
  }
};

const onRowDelete = async (data: Resource) => {
  try {
    await $fetch(`/resources?id=${data.resource_id}`, {
      baseURL: config.public.apiBase,
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    refresh();
    toast.add({ severity: 'success', summary: 'Success', detail: 'Resource deleted successfully', life: 3000 });
  } catch (error) {
    console.error('Error deleting resource:', error);
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete resource', life: 3000 });
  }
};

const onAddResource = async () => {
  try {
    await $fetch('/resources', {
      baseURL: config.public.apiBase,
      method: 'POST',
      body: JSON.stringify(newResource.value),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    newResource.value = { resource_id: 0, resource_name: '' };
    showAddResourceDialog.value = false;
    refresh();
    toast.add({ severity: 'success', summary: 'Success', detail: 'Resource added successfully', life: 3000 });
  } catch (error) {
    console.error('Error adding resource:', error);
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to add resource', life: 3000 });
  }
};
</script>

