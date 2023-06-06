<template>
  <head>
    <title>Test</title>
  </head>
  <title>The ShelfSource Sample</title>
  <div id="title">
    <h1>The ShelfSource Sample</h1>
  </div>
  <button id="scrollLeft" class="scrollButton" @click="scrollLeft">
    &#60;
  </button>
  <button id="scrollRight" class="scrollButton" @click="scrollRight">
    &#62;
  </button>
  <div id="blur">
    <div id="checkoutButton" @click="checkout()">
      <p>Payment</p>
      <img src="../assets/creditCard.png" />
    </div>
  </div>
  <div id="cardContainer" @scroll="setScrolling">
    <div
      class="foodCard"
      v-for="(item, index) in items"
      :key="item.name"
      v-on:click="customize(index)"
    >
      <img :src="getBackgroundImage(item)" />
    </div>
  </div>
  <div id="description">
    <h1 id="descriptionName">
      {{ this.items[selected] ? this.items[selected]?.name : "" }}
    </h1>
    <p id="descriptionData">
      {{ this.items[selected] ? this.items[selected]?.description : "" }}
    </p>
    <div id="counterFrame">
      <button @click="subtractAmount()">-</button>
      <h1 id="amount">
        {{ this.items[selected] ? this.items[selected]?.amount : "" }}
      </h1>
      <button @click="addAmount()">+</button>
    </div>
  </div>
  <div id="cart">
    <ul>
      <li v-for="item in items" :key="item.name">
        {{ item.name }} : {{ item.amount }}
      </li>
    </ul>
  </div>
  <div id="cartButton" @click="toggleCart()">
    <p></p>
    <img src="../assets/basket.png" />
  </div>
</template>

<script>
var combos = {};
var baseUrl = "";
var locationId = "";

export default {
  name: "MenuView",
  data() {
    return {
      items: [
        {
          name: "Burger",
          description:
            "A huge single or triple burger with all the fixings, cheese, lettuce, tomato, onions and special sauce or mayonnaise",
          amount: 0,
        },
        {
          name: "Taco",
          description:
            "A soft flour tortilla filled with chicken with cheddar cheese, shredded lettuce, avocado, salsa, fresh diced tomato, and garnished with cilantro",
          amount: 0,
        },
        {
          name: "Pizza",
          description:
            "Wood fired pizza baked with fresh dough, crushed red tomatoes, fresh mozzerella, basil leaves, and garlic",
          amount: 0,
        },
        {
          name: "Salad",
          description:
            "A crisp salad made with lettuce, avocado, onions, tomatoes",
          amount: 0,
        },
        {
          name: "Sushi",
          description:
            "Handmade rolls with seasoned rice, smoked salmon, cucumbers, avocado, and spicy mayo",
          amount: 0,
        },
        {
          name: "Eggs Benedict",
          description:
            "A brunch specialty consisting of hot buttered English muffins, smoked atlantic salmon (or choise of crispy bacon), poached eggs, topped with a rich Hollandaise sauce",
          amount: 0,
        },
        {
          name: "Tiramisu",
          description:
            "An elegant and rich layered Italian dessert made with delicate ladyfinger cookies, fine espresso, mascarpone cheese, Marsala wine, rum and cocoa powder",
          amount: 0,
        },
      ],
      cartView: false,
      scrolling: true,
      selected: -1,
    };
  },
  methods: {
    customize(index) {
      document.getElementById("description").classList.add("showing");
      this.selected = index;
    },
    toggleCart() {
      this.cartView = !this.cartView;
      if (this.cartView) {
        document.getElementById("cart").classList.add("showCart");
        document.getElementById("cartButton").classList.add("showCart");
        document.getElementById("cartButton").classList.remove("hideCart");
        document.getElementById("blur").classList.add("showing");
      } else {
        document.getElementById("cart").classList.remove("showCart");
        document.getElementById("cartButton").classList.remove("showCart");
        document.getElementById("cartButton").classList.add("hideCart");
        document.getElementById("blur").classList.remove("showing");
      }
      document.getElementById("description").classList.remove("showing");
    },
    setScrolling() {
      document.getElementById("description").classList.remove("showing");
    },
    getBackgroundImage(item) {
      return require("../assets/" + item.name.toLowerCase() + ".jpg");
    },
    subtractAmount() {
      this.items[this.selected].amount = Math.max(
        --this.items[this.selected].amount,
        0
      );
    },
    addAmount() {
      this.items[this.selected].amount++;
    },
    checkout() {
      let counts = {};
      let bought = false;
      if (Object.keys(combos).length === 0) {
        alert("Combos not loaded yet, please try again later");
        return;
      }
      this.items.forEach((item) => {
        if (item.amount > 0) {
          bought = true;
        }
        Object.keys(combos[item.name]).forEach((key) => {
          if (!counts[key]) {
            counts[key] = 0;
          }
          counts[key] -= item.amount * combos[item.name][key]; //minus because we are using up this ingredient
        });
        item.amount = 0;
      });
      console.log(bought, counts);
      setTimeout(() => {
        this.toggleCart();
      }, 1000);
      if (bought) {
        let body = { counts: counts, locationId: locationId };
        console.log(JSON.stringify(body));
        fetch(baseUrl + "/batchChangeInventory", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }).then(function (response) {
          if (response.status == 200) {
            alert("Checkout Successful");
          }
        });
      } else {
        alert("Cart Empty");
      }
    },
    scrollLeft() {
      document.getElementById("cardContainer").scrollBy({
        top: 0,
        left: (window.innerWidth * -60) / 100,
        behavior: "smooth",
      });
    },
    scrollRight() {
      document.getElementById("cardContainer").scrollBy({
        top: 0,
        left: (window.innerWidth * 60) / 100,
        behavior: "smooth",
      });
    },
    populateComboData() {
      fetch(baseUrl + "/getCombos", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then(function (response) {
          return response.json();
        })
        .then(function (data) {
          combos = data;
        });
    },
  },
  mounted() {
    this.populateComboData();
  },
};
</script>
<style>
@import url("https://fonts.googleapis.com/css2?family=Raleway:wght@300;400&display=swap");
@import url("https://fonts.googleapis.com/css2?family=Caveat&family=Raleway:wght@300;400&display=swap");

body {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: white;
  padding: 0px;
  margin: 0px;
  height: 100vh;
  width: 100vw;
}

#title {
  position: absolute;
  top: -10px;
  left: calc(50% - 150px);
  width: 410px;
  height: 145px;
  background-image: url("../assets/brush\ stroke.png");
  background-size: contain;
  background-repeat: no-repeat;
  display: flex;
  justify-content: center;
  align-items: center;
}

#title h1 {
  font-family: "Caveat", cursive;
  font-size: 37px;
  color: white;
  padding-top: 15px;
}

#cart {
  z-index: 10;
  position: absolute;
  width: 200px;
  height: 30px;
  right: calc(5vw + 15px);
  top: calc(95vh - 35px);
  background-color: rgb(247, 247, 247);
  transition: width, height, top, right;
  transition-duration: 0.2s;
  transition-timing-function: linear;
  overflow: clip;
}

#cart ul {
  margin-top: 10vh;
  padding: 0;
  list-style-type: none;
  height: 70%;
  display: flex;
  flex-direction: column;
}

#cart li {
  flex-grow: 1;
  padding: 0px;
  margin: 20px;
  color: rgb(59, 59, 59);
  font-family: "Raleway", sans-serif;
  font-size: 20px;
}

#cart.showCart {
  width: calc(250px + 8vw);
  height: 100vh;
  right: 0px;
  top: 0px;
}

#cartButton {
  z-index: 100;
  background-color: rgb(0, 204, 78);
  color: white;
  width: 220px;
  height: 40px;
  line-height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3px 15px 3px 15px;
  border-radius: 5px;
  position: absolute;
  right: 4vw;
  bottom: 5vh;
  transition: transform 0.35s, background-color 0.1s;
}

#cartButton.showCart {
  background-color: rgb(241, 109, 109);
  transform: rotateX(180deg);
}

#cartButton p {
  margin: 0px;
  font-size: 35px;
  margin-right: 15px;
  font-family: "Raleway", sans-serif;
  font-weight: 400;
}

#cartButton p::after {
  content: "Cart View";
  animation-duration: 0.35s;
  animation-fill-mode: forwards;
}

#cartButton.showCart p::after {
  animation-name: changeContentForwards;
}

#cartButton.hideCart p::after {
  animation-name: changeContentBackwards;
}

@keyframes changeContentForwards {
  0% {
    content: "Cart View";
  }

  100% {
    content: "Go Back";
  }
}

@keyframes changeContentBackwards {
  0% {
    content: "Go Back";
  }

  100% {
    content: "Cart View";
  }
}

#cartButton img {
  height: 30px;
  animation-duration: 0.35s;
  animation-fill-mode: forwards;
  animation-name: changeImageBackwards;
}

#cartButton.showCart img {
  animation-name: changeImageForwards;
}

@keyframes changeImageForwards {
  0% {
    content: url("../assets/basket.png");
  }

  100% {
    content: url("../assets/back\ arrow.png");
  }
}

@keyframes changeImageBackwards {
  0% {
    content: url("../assets/back\ arrow.png");
  }

  100% {
    content: url("../assets/basket.png");
  }
}

#cartButton:not(.showCart):hover {
  background-color: rgb(0, 189, 72);
  cursor: pointer;
}

#cartButton.showCart:hover {
  background-color: rgb(226, 91, 91);
  cursor: pointer;
}

#cartButton * {
  transition: transform;
  transition-duration: 0.35s;
}

#cartButton.showCart * {
  transform: rotateX(-180deg);
}

#cartButton:not(.showCart) * {
  transform: rotateX(0deg);
}

#cardContainer {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  overflow-y: clip;
  overflow-x: scroll;
  white-space: nowrap;
}

#cardContainer::-webkit-scrollbar {
  display: none;
}

.foodCard {
  height: 40vh;
  width: 40vh;
  border-radius: 20px;
  margin: 10vh;
  margin-top: 30vh;
  transition: transform 0.25s;
  display: inline-block;
  overflow: clip;
  z-index: 0;
}

.foodCard:hover {
  transform: scale(1.1);
}

.foodCard img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scale(1.1);
  transition: transform 0.25s;
}

.foodCard:hover img {
  transform: scale(1);
}

#description {
  position: absolute;
  left: -70vw;
  top: 75vh;
  width: 70vw;
  height: 20vh;
  background-color: black;
  color: white;
  transition: left 0.3s;
  font-family: "Raleway", sans-serif;
}

#description.showing {
  left: 0px;
}

#description > h1 {
  font-weight: 300;
  margin: 0;
  margin-top: 10px;
  font-size: 4vh;
}

#description p {
  margin: 10px;
  font-size: 2vh;
}

#counterFrame {
  width: 10vw;
  height: 6vh;
  position: absolute;
  left: 30vw;
  bottom: 10px;
  display: flex;
  white-space: nowrap;
  justify-content: space-between;
}

#counterFrame button {
  user-select: none;
  outline: none;
  border: 1px solid white;
  box-shadow: 0 0 1px 0px white inset, 0 0 1px 0px white;
  font-family: "Raleway", sans-serif;
  font-size: 4vh;
  color: white;
  background-color: black;
  width: 6vh;
  height: 6vh;
  border-radius: 3vh;
  line-height: 5vh;
}

#counterFrame > h1 {
  color: white;
  font-weight: 300;
  margin: 0;
  line-height: 5vh;
  font-size: 4vh;
}

#counterFrame button:hover {
  background-color: rgb(27, 27, 27);
}

#blur {
  position: absolute;
  background-color: white;
  height: 100%;
  width: 100%;
  top: 0;
  left: 0;
  animation-duration: 0.35s;
  animation-fill-mode: forwards;
  animation-name: changeBlurBackwards;
}

#blur.showing {
  animation-name: changeBlurForwards;
}

@keyframes changeBlurForwards {
  0% {
    opacity: 0;
    z-index: 5;
  }

  100% {
    opacity: 1;
    z-index: 5;
  }
}

@keyframes changeBlurBackwards {
  0% {
    opacity: 1;
    z-index: 5;
  }

  99% {
    opacity: 0;
    z-index: 5;
  }

  100% {
    opacity: 0;
    z-index: 0;
  }
}

.scrollButton {
  position: absolute;
  z-index: 4;
  height: 16vh;
  width: 30px;
  user-select: none;
  outline: none;
  top: 42vh;
  font-size: 30px;
  font-family: "Raleway", sans-serif;
  background-color: white;
  transition: width background-color;
  transition-duration: 0.25s;
  border: none;
  background-color: rgb(236, 236, 236);
}

#scrollLeft {
  left: 0;
  border-top-right-radius: 20px;
  border-top-left-radius: 0;
  border-bottom-right-radius: 20px;
  border-bottom-left-radius: 0;
}

#scrollRight {
  right: 0;
  border-top-right-radius: 0;
  border-top-left-radius: 20px;
  border-bottom-right-radius: 0;
  border-bottom-left-radius: 20px;
}

.scrollButton:hover {
  background-color: rgb(207, 207, 207);
  width: 50px;
}

#checkoutButton {
  z-index: 100;
  background-color: rgb(41, 191, 236);
  color: white;
  width: 220px;
  height: 40px;
  line-height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3px 15px 3px 15px;
  border-radius: 5px;
  position: absolute;
  left: 35vw;
  top: 50vh;
}

#checkoutButton img {
  height: 30px;
}

#checkoutButton:hover {
  background-color: rgb(33, 172, 214);
  cursor: pointer;
}

#checkoutButton p {
  margin: 0px;
  font-size: 35px;
  margin-right: 15px;
  font-family: "Raleway", sans-serif;
  font-weight: 400;
}
</style>
