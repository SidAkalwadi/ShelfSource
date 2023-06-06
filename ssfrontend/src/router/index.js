import { createRouter, createWebHashHistory } from "vue-router";
import InventoryView from "../views/InventoryView";

const routes = [
  {
    path: "/",
    name: "inventory",
    component: InventoryView,
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
