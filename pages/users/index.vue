<template>
  <div class="h-screen">
    <Navbar hideItem="/users" />
    <div class="mt-2 ">
      <div class="flex flex-row justify-end mx-3">
        <Button label="Add New User" icon="pi pi-plus" class="p-button-success mb-4 w-[15%]"
          @click="showAddUserDialog = true" />
      </div>
      <Dialog header="Add New User" v-model:visible="showAddUserDialog" modal>
        <form @submit.prevent="onAddUser">
          <div class="flex flex-wrap align-items-center mb-3 gap-2">
            <label for="username" class="p-sr-only">Username</label>
            <InputText id="username" placeholder="username" class="ml-2" v-model="newUser.username" required />
          </div>
          <div class="flex flex-wrap align-items-center mb-3 gap-2">
            <label for="password" class="p-sr-only">Password</label>
            <InputText id="password" placeholder="password" class="ml-2" v-model="newUser.password" required />
          </div>
          <Button label="Add User" type="submit" class="p-button-success" />
        </form>
      </Dialog>
      <DataTable v-model:editingRows="editingRows" :value="users" editMode="row" dataKey="userID"
        @row-edit-save="onRowEdit" :pt="{
          table: { style: 'min-width: 50rem' },
          column: {
            bodycell: ({ state  }:any ) => ({
              style: state['d_editing'] && 'padding-top: 0.6rem; padding-bottom: 0.6rem'
            })
          }
        }">
        <Column field="user_id" header="ID" style="width: 20%">
          <template #body="{ data, field }">
            {{ data[field] }}
          </template>
        </Column>
        <Column field="username" header="Username" style="width: 20%">
          <template #editor="{ data, field }">
            <InputText v-model="data[field]" />
          </template>
        </Column>
        <Column field="password" header="Password" style="width: 20%">
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

      <!-- User Roles Section -->
      <div class="mt-8">
        <h2>User Roles</h2>
        <div class="flex flex-row justify-end mx-3">
          <Button label="Add User Role" icon="pi pi-plus" class="p-button-success mb-4 w-[15%]"
            @click="showAddUserRoleDialog = true" />
        </div>
        <Dialog header="Add User Role" v-model:visible="showAddUserRoleDialog" modal>
          <form @submit.prevent="onAddUserRole">
            <div class="flex flex-wrap align-items-center mb-3 gap-2">
              <label for="user_id" class="p-sr-only">User</label>
              <Dropdown id="user_id" v-model="selectedUser" :options="users" optionLabel="username" placeholder="Select a User" class="ml-2" required />
            </div>
            <div class="flex flex-wrap align-items-center mb-3 gap-2">
              <label for="role_id" class="p-sr-only">Role</label>
              <Dropdown id="role_id" v-model="selectedRole" :options="roles" optionLabel="role_name" placeholder="Select a Role" class="ml-2" required />
            </div>
            <Button label="Add User Role" type="submit" class="p-button-success" />
          </form>
        </Dialog>
        <DataTable :value="userRoles" v-model:filters="filters" dataKey="user_id" paginator :rows="20"  filterDisplay="row" 

                :globalFilterFields="['username', 'role_name']">
          <Column field="user_id" header="User ID" style="width: 20%">
            <template #body="{ data, field }">
              {{ data[field] }}
            </template>
          </Column>
          <Column field="username" header="Username" style="width: 20%">
            <template #body="{ data, field }">
              {{ data[field] }}
            </template>
            <template #filter="{ filterModel, filterCallback }">
                    <InputText v-model="filterModel.value" type="text" @input="filterCallback()" class="p-column-filter" placeholder="Search by username" />

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
              <Button icon="pi pi-trash" class="p-button-danger" @click="onRowDeleteUserRole(data)" />
            </template>
          </Column>
        </DataTable>
      </div>
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
import Dropdown from 'primevue/dropdown';
import { useToast } from "primevue/usetoast";
import { FilterMatchMode } from 'primevue/api';

const toast = useToast();
const config = useRuntimeConfig();

interface User {
  user_id: number;
  username: string;
  password: string;
}

interface Role {
  role_id: number;
  role_name: string;
}

interface UserRole {
  user_id: number;
  username: string;
  role_id: number;
  role_name: string;
}

const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    role_name: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    username: { value: null, matchMode: FilterMatchMode.STARTS_WITH },

});

const editingRows = ref([]);
const newUser = ref<User>({ user_id: 0, username: '', password: '' });
const showAddUserDialog = ref(false);

const newUserRole = ref<UserRole>({ user_id: 0, username: '', role_id: 0, role_name: '' });
const showAddUserRoleDialog = ref(false);

const selectedUser = ref<User | null>(null);
const selectedRole = ref<Role | null>(null);


const { data: users, error: userError, refresh: refreshUsers } = await useFetch<User[]>('/users', {
  baseURL: config.public.apiBase
});

const { data: roles, error: roleError } = await useFetch<Role[]>('/roles', {
  baseURL: config.public.apiBase
});

const { data: userRoles, error: userRoleError, refresh: refreshUserRoles } = await useFetch<UserRole[]>('/user_roles', {
  baseURL: config.public.apiBase
});

if (userError.value) {
  toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch users', life: 3000 });
}

if (roleError.value) {
  toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch roles', life: 3000 });
}

if (userRoleError.value) {
  toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch user roles', life: 3000 });
}


const onRowEdit = async (event: any) => {
  const data = event.newData as User;
  try {
    await $fetch(`/users?id=${data.user_id}`, {
      baseURL: config.public.apiBase,
      method: 'PUT',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    refreshUsers();
    toast.add({ severity: 'success', summary: 'Success', detail: 'User updated successfully', life: 3000 });
  } catch (error) {
    console.error('Error saving user:', error);
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to update user', life: 3000 });
  }
};

const onRowDelete = async (data: User) => {
  try {
    await $fetch(`/users?id=${data.user_id}`, {
      baseURL: config.public.apiBase,
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    refreshUsers();
    toast.add({ severity: 'success', summary: 'Success', detail: 'User deleted successfully', life: 3000 });
  } catch (error) {
    console.error('Error deleting user:', error);
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete user', life: 3000 });
  }
};

const onAddUser = async () => {
  try {
    await $fetch('/users', {
      baseURL: config.public.apiBase,
      method: 'POST',
      body: JSON.stringify(newUser.value),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    newUser.value = { user_id: 0, username: '', password: '' };
    showAddUserDialog.value = false;
    refreshUsers();
    toast.add({ severity: 'success', summary: 'Success', detail: 'User added successfully', life: 3000 });
  } catch (error) {
    console.error('Error adding user:', error);
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to add user', life: 3000 });
  }
};

const onAddUserRole = async () => {
  if (!selectedUser.value || !selectedRole.value) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Please select both user and role', life: 3000 });
    return;
  }

  try {
    await $fetch('/user_roles', {
      baseURL: config.public.apiBase,
      method: 'POST',
      body: JSON.stringify({ user_id: selectedUser.value.user_id, role_id: selectedRole.value.role_id }),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    newUserRole.value = { user_id: 0, username: '', role_id: 0, role_name: '' };
    showAddUserRoleDialog.value = false;
    refreshUserRoles();
    toast.add({ severity: 'success', summary: 'Success', detail: 'User role added successfully', life: 3000 });
  } catch (error) {
    console.error('Error adding user role:', error);
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to add user role', life: 3000 });
  }
};

const onRowDeleteUserRole = async (data: UserRole) => {
  try {
    await $fetch(`/user_roles`, {
      baseURL: config.public.apiBase,
      method: 'DELETE',
      body: JSON.stringify({
         user_id: data.user_id,
        role_id:data.role_id 
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    refreshUserRoles();
    toast.add({ severity: 'success', summary: 'Success', detail: 'User role deleted successfully', life: 3000 });
  } catch (error) {
    console.error('Error deleting user role:', error);
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete user role', life: 3000 });
  }
};
</script>

