import { createRouter, createWebHashHistory } from "vue-router";
import MenuView from "../views/MenuView.vue";

const routes = [
  {
    path: "/",
    name: "menu",
    component: MenuView,
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
