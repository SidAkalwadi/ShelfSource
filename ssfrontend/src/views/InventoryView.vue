<template>
  <div id="title">
    <h1>ShelfSource Dashboard</h1>
  </div>
  <div id="flexbox">
    <div id="comboContainer" class="mainContainer">
      <div id="comboBlur" class="blurCard"></div>
      <div id="comboFormCard" class="formCard">
        <h1>Add a Combo</h1>
        <table>
          <tr>
            <th>
              <p>Combo Name</p>
            </th>
            <th>
              <input type="text" id="comboName" autocomplete="off" />
            </th>
          </tr>
          <tr>
            <th>
              <p>Component</p>
            </th>
            <th>
              <input type="text" id="comboComponentName" autocomplete="off" />
            </th>
          </tr>
          <tr>
            <th>
              <p>Quantity</p>
            </th>
            <th>
              <input type="text" id="componentQuantity" autocomplete="off" />
            </th>
          </tr>
        </table>
        <button class="miniButton" @click="appendComponent()">
          Add Component
        </button>
        <ul v-if="Object.keys(this.newCombo.comboData).length > 0">
          <li
            v-for="componentName in Object.keys(this.newCombo.comboData)"
            :key="componentName"
          >
            {{ componentName }} : {{ this.newCombo.comboData[componentName] }}
          </li>
        </ul>
        <div class="horizontalFlexHolder">
          <button class="submitButton" @click="submitCombo(false)">
            Submit
          </button>
          <button class="cancelButton" @click="submitCombo(true)">
            Cancel
          </button>
        </div>
      </div>
      <div class="horizontalFlexHolder">
        <h2>Combos</h2>
        <button class="addButton" @click="addCombo()">
          <img src="../assets/plus.png" />
        </button>
      </div>
      <ul>
        <li
          v-for="comboName in Object.keys(this.combos)"
          :key="comboName"
          @click="selectElem"
        >
          <p class="listP">
            <b>{{ comboName }}</b>
          </p>
          <ul>
            <li
              v-for="componentName in Object.keys(this.combos[comboName])"
              :key="componentName"
            >
              <p class="listP">
                {{ componentName }}: {{ this.combos[comboName][componentName] }}
              </p>
            </li>
          </ul>
          <button class="deleteButton" @click="deleteCombo($event, comboName)">
            <img src="../assets/trash.png" />
          </button>
        </li>
      </ul>
    </div>
    <div id="componentContainer" class="mainContainer">
      <div id="componentBlur" class="blurCard"></div>
      <div id="componentFormCard" class="formCard">
        <h1>Add a Component</h1>
        <table>
          <tr>
            <th>
              <p>Component Name</p>
            </th>
            <th>
              <input type="text" id="componentName" autocomplete="off" />
            </th>
          </tr>
          <tr>
            <th>
              <p>Source</p>
            </th>
            <th>
              <input type="text" id="componentSource" autocomplete="off" />
            </th>
          </tr>
        </table>
        <button class="miniButton" @click="addComponentSource()">
          Add Source
        </button>
        <ul v-if="this.newComponent.refs.length > 0">
          <li
            v-for="componentSourceId in this.newComponent.refs"
            :key="componentSourceId"
          >
            {{ this.sources[componentSourceId].name }}
          </li>
        </ul>
        <div class="horizontalFlexHolder">
          <button class="submitButton" @click="submitComponent(false)">
            Submit
          </button>
          <button class="cancelButton" @click="submitComponent(true)">
            Cancel
          </button>
        </div>
      </div>
      <div class="horizontalFlexHolder">
        <h2>Components</h2>
        <button class="addButton" @click="addComponent()">
          <img src="../assets/plus.png" />
        </button>
      </div>
      <ul>
        <li
          v-for="componentName in Object.keys(this.components)"
          :key="componentName"
          @click="selectElem"
        >
          <p class="listP">
            {{ componentName }}:
            <b>{{ this.components[componentName].count }}</b>
          </p>
          <ul>
            <li
              v-for="source in this.filterLoadedSources(
                this.components[componentName].sources
              )"
              :key="source"
            >
              <p class="listP">
                {{ this.sources[source].name }}
              </p>
            </li>
          </ul>
          <button
            class="deleteButton"
            @click="deleteComponent($event, componentName)"
          >
            <img src="../assets/trash.png" />
          </button>
        </li>
      </ul>
    </div>
    <div id="sourceContainer" class="mainContainer">
      <h2>Sources</h2>
      <ul>
        <li
          v-for="sourceId in Object.keys(this.sources)"
          :key="sourceId"
          @click="selectElem"
        >
          <p class="listP">
            {{ this.sources[sourceId].name }}
          </p>
          <ul>
            <li>
              <p><b>Address: </b>{{ this.sources[sourceId].address }}</p>
            </li>
            <li>
              <p><b>Website: </b>{{ this.sources[sourceId].website }}</p>
            </li>
          </ul>
          <button
            class="deleteButton"
            @click="deactivateSource($event, sourceId)"
          >
            <img src="../assets/eye.png" />
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>
<script>
var baseUrl = "";
var locationId = "";
var selected = null;

export default {
  name: "InventoryView",
  data() {
    return {
      combos: {},
      components: {},
      sources: {},
      newCombo: {
        comboName: "",
        comboData: {},
      },
      newComponent: {
        componentName: "",
        refs: [],
      },
    };
  },
  methods: {
    async populateComboData() {
      fetch(baseUrl + "/getCombos", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          this.combos = data;
        });
    },
    async populateComponentData() {
      fetch(
        baseUrl +
          "/getComponents?" +
          new URLSearchParams({
            locationId: locationId,
          }).toString(),
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          this.components = data;
        });
    },
    async populateSourceData() {
      fetch(baseUrl + "/getSources", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          this.sources = data;
        });
    },
    filterLoadedSources(sources) {
      return sources.filter(
        (source) => source in this.sources && !this.sources[source].inactive
      );
    },
    deleteCombo(event, comboName) {
      event.target.parentNode.classList.add("hide");
      setTimeout(() => {
        delete this.combos[comboName];
      }, 600);
      fetch(
        baseUrl +
          "/removeCombo?" +
          new URLSearchParams({
            combo: comboName,
          }).toString(),
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      ).catch((err) => {
        console.log(err);
      });
    },
    async deleteComponent(event, componentName) {
      event.target.parentNode.classList.add("hide");
      setTimeout(() => {
        delete this.components[componentName];
      }, 600);
      fetch(
        baseUrl +
          "/removeComponent?" +
          new URLSearchParams({
            component: componentName,
          }).toString(),
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      ).catch((err) => {
        console.log(err);
      });
    },
    deactivateSource(event, sourceId) {
      this.sources[sourceId].inactive = !this.sources[sourceId].inactive;
      if (this.sources[sourceId].inactive) {
        event.target.parentNode.classList.add("inactive");
      } else {
        event.target.parentNode.classList.remove("inactive");
      }
    },
    selectElem(event) {
      if (selected) {
        selected.classList.remove("selected");
      }
      event.target.classList.add("selected");
      selected = event.target;
    },
    addCombo() {
      document.getElementById("comboBlur").classList.add("active");
      document.getElementById("comboFormCard").classList.add("active");
      this.newCombo = {
        comboName: "",
        comboData: {},
      };
    },
    addComponent() {
      document.getElementById("componentBlur").classList.add("active");
      document.getElementById("componentFormCard").classList.add("active");
      this.newComponent = {
        componentName: "",
        refs: [],
      };
    },
    submitCombo(cancel) {
      let comboName = document.getElementById("comboName").value;
      if (cancel) {
        document.getElementById("comboBlur").classList.remove("active");
        document.getElementById("comboFormCard").classList.remove("active");
      } else if (comboName != "") {
        document.getElementById("comboComponentName").value = "";
        this.newCombo.comboName = comboName;

        fetch(baseUrl + "/createCombo", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(this.newCombo),
        }).then(() => {
          this.populateComboData();
        });
        document.getElementById("comboBlur").classList.remove("active");
        document.getElementById("comboFormCard").classList.remove("active");
      }
    },
    appendComponent() {
      let componentName = document.getElementById("comboComponentName").value;
      let componentAmount = parseFloat(
        document.getElementById("componentQuantity").value
      );
      if (
        componentAmount >= 0 &&
        componentName !== "" &&
        this.components[componentName]
      ) {
        document.getElementById("comboComponentName").value = "";
        document.getElementById("componentQuantity").value = "";

        this.newCombo.comboData[componentName] = componentAmount;
      }
    },
    submitComponent(cancel) {
      let componentName = document.getElementById("componentName").value;
      if (cancel) {
        document.getElementById("componentBlur").classList.remove("active");
        document.getElementById("componentFormCard").classList.remove("active");
      } else if (componentName != "") {
        document.getElementById("comboComponentName").value = "";
        this.newComponent.componentName = componentName;

        fetch(baseUrl + "/createComponent", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(this.newComponent),
        }).then(() => {
          this.populateComponentData;
        });
        document.getElementById("componentBlur").classList.remove("active");
        document.getElementById("componentFormCard").classList.remove("active");
      }
    },
    addComponentSource() {
      let sourceName = document.getElementById("componentSource").value;
      if (sourceName != "") {
        Object.keys(this.sources).forEach((sourceId) => {
          if (this.sources[sourceId].name === sourceName) {
            document.getElementById("componentSource").value = "";
            this.newComponent.refs.push(sourceId);
          }
        });
      }
    },
  },
  mounted() {
    this.populateComboData();
    this.populateComponentData();
    this.populateSourceData();
  },
};
</script>
<style>
@import url("https://fonts.googleapis.com/css2?family=Raleway:wght@300;400&display=swap");

body {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: white;
  padding: 0px;
  margin: 0px;
  height: 100vh;
  width: 100vw;
}

* {
  font-family: "Raleway", sans-serif;
}

#title h1 {
  margin: 0px;
  padding: 0px;
  line-height: 120px;
  color: white;
  font-size: 40px;
  font-weight: 600;
}

#title {
  background-color: rgb(0, 162, 255);
  background-image: url("../assets/wave.jpg");
  background-size: cover;
  background-position-y: 40%;
  position: absolute;
  width: 100vw;
  height: 120px;
  top: 0px;
  left: 0px;
}

#flexbox {
  position: absolute;
  left: 0;
  top: 120px;
  width: 100vw;
  height: calc(100vh - 120px);
  flex-direction: row;
  display: flex;
  overflow: clip;
}

.mainContainer {
  flex: 1;
  position: relative;
  text-align: left;
  overflow-y: auto;
  text-align: left;
}

.mainContainer .blurCard.active {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0px;
  z-index: 10;
  background-color: rgba(212, 223, 233, 0.541);
  filter: blur(5px);
}

.formCard.active {
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 10;
  width: 25vw;
  height: 50vh;
  border-radius: 30px;
  background-color: white;
  border: 1px solid rgb(216, 216, 216);
  position: absolute;
  top: 25vh;
  left: 4vw;
}

.formCard h1 {
  color: rgb(167, 167, 167);
  max-height: 100px;
}

.formCard p {
  color: rgb(167, 167, 167);
  font-weight: 400;
}

.formCard li {
  color: rgb(167, 167, 167);
  font-weight: 400;
}

.formCard ul {
  border: 1px solid rgb(167, 167, 167);
  border-radius: 20px;
  padding: 10px;
  max-height: 300px;
  overflow-y: scroll;
}

.formCard {
  display: none;
}

.formCard * {
  flex-grow: 1;
  text-align: center;
}

.mainContainer ul {
  list-style-type: none;
  width: fit-content;
}

.mainContainer > ul > li {
  border: 1px solid white;
  border-radius: 5px;
  margin: none;
  margin-top: 20px;
  padding: 10px;
  position: relative;
  transition: border 0.2s, max-height 0.55s, opacity 0.25s, padding 0.25s,
    margin-top 0.25s, color 0.25s;
  max-height: 300px;
}

.mainContainer > ul > li.inactive {
  color: rgb(206, 206, 206);
}

.mainContainer > ul > li.hide {
  max-height: 0px;
  margin-top: 0px;
  padding: 0px;
  opacity: 0;
  border: none;
}

.mainContainer > ul > li:hover {
  border: 1px solid rgb(190, 190, 190);
}

.mainContainer > ul > li.selected {
  border: 1px solid rgb(190, 190, 190);
}

.mainContainer > ul > li:not(.selected) .deleteButton {
  display: none;
}

.mainContainer > ul > li *:not(.deleteButton) {
  pointer-events: none;
}

.deleteButton {
  position: absolute;
  top: calc(50% - 20px);
  right: -55px;
  height: 40px;
  width: 40px;
  border-radius: 20px;
  border: 1px solid rgb(216, 216, 216);
  background-color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: background-color 0.1s;
}

.deleteButton img {
  height: 23px;
  width: 23px;
}

.deleteButton:hover {
  background-color: rgb(247, 247, 247);
}

.listP {
  margin: 0px;
  padding: 0px;
}

.mainContainer h2 {
  text-align: center;
  color: rgb(167, 167, 167);
  font-weight: 600;
}

#componentContainer {
  border: 3px solid rgb(216, 216, 216);
  border-top: none;
  border-bottom: none;
}

/* width */
*::-webkit-scrollbar {
  width: 10px;
}

/* Track */
*::-webkit-scrollbar-track {
  background-color: transparent;
  margin-top: 10px;
  margin-bottom: 10px;
}

/* Handle */
*::-webkit-scrollbar-thumb {
  background: rgb(216, 216, 216);
  border-radius: 5px;
}

/* Handle on hover */
*::-webkit-scrollbar-thumb:hover {
  background: rgb(197, 197, 197);
}

.addButton {
  height: 35px;
  width: 35px;
  border-radius: 3px;
  border: none;
  background-color: rgb(120, 241, 140);
  display: flex;
  justify-content: center;
  align-items: center;
  transition: background-color 0.1s;
}

.addButton img {
  height: 23px;
  width: 23px;
}

.addButton:hover {
  background-color: rgb(113, 226, 132);
}

.horizontalFlexHolder {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: row;
  max-height: 100px;
  gap: 20px;
}

.submitButton {
  background-color: rgb(94, 236, 118);
  border: none;
  outline: none;
  height: 50px;
  line-height: 50px;
  font-size: 25px;
  color: white;
  font-weight: 400;
  border-radius: 5px;
  transition: background-color 0.25s;
}

.submitButton:hover {
  background-color: rgb(87, 224, 110);
}

.cancelButton {
  background-color: rgb(245, 115, 115);
  border: none;
  outline: none;
  height: 50px;
  line-height: 50px;
  font-size: 25px;
  color: white;
  font-weight: 400;
  border-radius: 5px;
  transition: background-color 0.25s;
}

.cancelButton:hover {
  background-color: rgb(233, 109, 109);
}

.miniButton {
  background-color: rgb(94, 236, 118);
  border: none;
  outline: none;
  max-height: 30px;
  line-height: 30px;
  font-size: 15px;
  color: white;
  font-weight: 600;
  border-radius: 5px;
  transition: background-color 0.25s;
}

.miniButton:hover {
  background-color: rgb(87, 224, 110);
}
</style>
