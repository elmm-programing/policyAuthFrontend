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

interface RoleResourcePermission {
  id: number;
  resource_role_id: number;
  resource_name: string;
  role_name: string;
  permission_id: number;
  permission_name: string;
}

interface ResourceRole {
  id: number;
  resource_id: number;
  resource_name: string;
  role_id: number;
  role_name: string;
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
  role_name: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
  permission_name: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
});

const newRoleResourcePermission = ref<RoleResourcePermission>({ id: 0, resource_role_id: 0, resource_name: '', role_name: '', permission_id: 0, permission_name: '' });

const showAddRoleResourcePermissionDialog = ref(false);

const selectedResourceRole = ref<ResourceRole | null>(null);
const selectedPermission = ref<Permission | null>(null);

const { data: roleResourcePermissions, error: roleResourcePermissionError, refresh: refreshRoleResourcePermissions } = await useFetch<RoleResourcePermission[]>('/role_resource_permissions', {
  baseURL: config.public.apiBase
});
const { data: resourceRoles, error: resourceRoleError, refresh: refreshResourceRoles } = await useFetch<ResourceRole[]>('/resource_roles', {
  baseURL: config.public.apiBase
});
const { data: permissions, error, refresh } = await useFetch<ResourcePermission[]>('/resource_permissions', {
  baseURL: config.public.apiBase
});

const filterPermissions = computed(()=>{
  return permissions.value != null? permissions.value.filter((value)=>value.resource_name ==selectedResourceRole.value?.resource_name):[]
})


if (roleResourcePermissionError.value) {
  toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch role resource permissions', life: 3000 });
}

const onAddRoleResourcePermission = async () => {
  if (!selectedResourceRole.value || !selectedPermission.value) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Please select both resource role and permission', life: 3000 });
    return;
  }

  try {
    await $fetch('/role_resource_permissions', {
      baseURL: config.public.apiBase,
      method: 'POST',
      body: JSON.stringify({ resource_role_id: selectedResourceRole.value.id, permission_id: selectedPermission.value.permission_id }),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    newRoleResourcePermission.value = { id: 0, resource_role_id: 0, resource_name: '', role_name: '', permission_id: 0, permission_name: '' };
    showAddRoleResourcePermissionDialog.value = false;
    refreshRoleResourcePermissions();
    toast.add({ severity: 'success', summary: 'Success', detail: 'Role resource permission added successfully', life: 3000 });
  } catch (error) {
    console.error('Error adding role resource permission:', error);
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to add role resource permission', life: 3000 });
  }
};

const onRowDeleteRoleResourcePermission = async (data: RoleResourcePermission) => {
  try {
    await $fetch(`/role_resource_permissions/${data.id}`, {
      baseURL: config.public.apiBase,
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    refreshRoleResourcePermissions();
    toast.add({ severity: 'success', summary: 'Success', detail: 'Role resource permission deleted successfully', life: 3000 });
  } catch (error) {
    console.error('Error deleting role resource permission:', error);
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete role resource permission', life: 3000 });
  }
};
</script>

<template>
  <!-- Role Resource Permissions Section -->
  <div class="mt-8">
    <h2>Role Resource Permissions</h2>
    <div class="flex flex-row justify-end mx-3">
      <Button label="Add Role Resource Permission" icon="pi pi-plus" class="p-button-success mb-4 w-[15%]"
        @click="showAddRoleResourcePermissionDialog = true" />
    </div>
    <Dialog header="Add Role Resource Permission" v-model:visible="showAddRoleResourcePermissionDialog" modal>
      <form @submit.prevent="onAddRoleResourcePermission">
        <div class="flex flex-wrap align-items-center mb-3 gap-2">
          <label for="resource_role_id" class="p-sr-only">Resource Role</label>
          <Dropdown id="resource_role_id" v-model="selectedResourceRole" :options="resourceRoles"  placeholder="Select a Resource Role" class="ml-2" required>
              <template #value="slotProps">
        <div v-if="slotProps.value" class="flex align-items-center">
            <div>{{ slotProps.value.resource_name + '|'+slotProps.value.role_name }}</div>
        </div>
        <span v-else>
            {{ slotProps.placeholder }}
        </span>
    </template>
              <template #option="slotProps">
        <div class="flex align-items-center">
            <div>{{ slotProps.option.resource_name + '|'+slotProps.option.role_name  }}</div>
        </div>
    </template>
          </Dropdown>
        </div>
        <div class="flex flex-wrap align-items-center mb-3 gap-2">
          <label for="permission_id" class="p-sr-only">Permission</label>
          <Dropdown id="permission_id" v-model="selectedPermission" :options="filterPermissions" optionLabel="permission_name" placeholder="Select a Permission" class="ml-2" required />
        </div>
        <Button label="Add Role Resource Permission" type="submit" class="p-button-success" />
      </form>
    </Dialog>
    <DataTable :value="roleResourcePermissions" v-model:filters="filters" dataKey="id" paginator :rows="20" filterDisplay="row"
      :globalFilterFields="['resource_name', 'role_name', 'permission_name']">
      <Column field="resource_role_id" header="Resource Role ID" style="width: 20%">
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
      <Column field="role_name" header="Role Name" style="width: 20%">
        <template #body="{ data, field }">
          {{ data[field] }}
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <InputText v-model="filterModel.value" type="text" @input="filterCallback()" class="p-column-filter" placeholder="Search by role name" />
        </template>
      </Column>
      <Column field="permission_id" header="Permission ID" style="width: 20%">
        <template #body="{ data, field }">
          {{ data[field] }}
        </template>
      </Column>
      <Column field="permission_name" header="Permission Name" style="width: 20%">
        <template #body="{ data, field }">
          {{ data[field] }}
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <InputText v-model="filterModel.value" type="text" @input="filterCallback()" class="p-column-filter" placeholder="Search by permission name" />
        </template>
      </Column>
      <Column style="width: 10%; min-width: 8rem" bodyStyle="text-align:center">
        <template #body="{ data }">
          <Button icon="pi pi-trash" class="p-button-danger" @click="onRowDeleteRoleResourcePermission(data)" />
        </template>
      </Column>
    </DataTable>
  </div>
</template>

