const admin = require('firebase-admin');
const functions = require('firebase-functions');
const {Client, Environment} = require('square');
const {randomUUID} = require('crypto');

const cors = require('cors')({origin: true});
admin.initializeApp();

const client = new Client({
  accessToken: '',
  environment: Environment.Sandbox,
});

// Takes in a document id and removes it from the combos collection
exports.removeCombo = functions.https.onRequest((request, response) => {
  cors(request, response, () => {
    const combo = request.query.combo;
    const collection = admin.firestore().collection('Combos');
    collection
        .doc(combo)
        .delete({exists: true})
        .then(() => {
          response.sendStatus(200);
        })
        .catch(() => {
          response.sendStatus(400);
        });
  });
});

// takes in a json object and name for a combo and stores it in the combos collection, updates existing if already there
exports.createCombo = functions.https.onRequest((request, response) => {
  cors(request, response, () => {
    const comboName = request.body.comboName;
    const comboData = request.body.comboData;
    const collection = admin.firestore().collection('Combos');
    collection
        .doc(comboName)
        .set(comboData)
        .then(() => {
          response.sendStatus(200);
        })
        .catch(() => {
          response.sendStatus(400);
        });
  });
});

// Returns all combos
exports.getCombos = functions.https.onRequest((request, response) => {
  cors(request, response, () => {
    const collection = admin.firestore().collection('Combos');

    collection.get().then((querySnapshot) => {
      const results = {};
      querySnapshot.forEach((doc) => {
        results[doc.id] = doc.data();
      });
      response.send(results);
    });
  });
});

// Returns the sources and variation IDs for all components
exports.getComponents = functions.https.onRequest((request, response) => {
  cors(request, response, () => {
    const collection = admin.firestore().collection('Components');
    collection.get().then((querySnapshot) => {
      const results = {};
      const varIdMapping = {};
      querySnapshot.forEach((doc) => {
        const sources = [];
        const docData = doc.data();
        docData['source'].forEach((element) => {
          sources.push(element['_path']['segments'][1]);
        });
        varIdMapping[docData['variationId']] = doc.id; // keeping track for mapping variation id back to name

        results[doc.id] = {sources: sources, count: 0};
      });

      client.inventoryApi
          .batchRetrieveInventoryCounts({
            catalogObjectIds: Object.keys(varIdMapping),
            locationIds: [request.query.locationId],
            limit: 1000,
          })
          .then((res) => {
            const squareResponse = JSON.parse(res.body.toString());
            squareResponse.counts.forEach((countObj) => {
              const componentName = countObj.catalog_object_id;
              results[varIdMapping[componentName]].count = parseFloat(
                  countObj.quantity,
              ); // append count to the sources
            });
            response.send(results);
          });
    });
  });
});

// Takes in a document id and removes it from the components collection
exports.removeComponent = functions.https.onRequest((request, response) => {
  cors(request, response, () => {
    const component = request.query.component;
    const collection = admin.firestore().collection('Components');

    collection // get square id from firebase and call square api
        .doc(component)
        .get()
        .then((docRef) => {
          const itemId = docRef.data()['itemId'];
          client.catalogApi.deleteCatalogObject(itemId);
        });

    collection // delete it from firebase
        .doc(component)
        .delete({exists: true})
        .then(() => {
          response.sendStatus(200);
        })
        .catch(() => {
          response.sendStatus(400);
        });
  });
});

// takes in a JSON object and name for a component and stores it in the components collection, updates existing if already there. Doesn't check is source exists
exports.createComponent = functions.https.onRequest((request, response) => {
  cors(request, response, () => {
    const componentName = request.body.componentName;

    client.catalogApi
        .upsertCatalogObject({
          idempotencyKey: randomUUID(),
          object: {
            type: 'ITEM',
            id: '#' + componentName,
            itemData: {
              name: componentName,
              variations: [
                {
                  type: 'ITEM_VARIATION',
                  id: '#ShelfSource ' + componentName,
                  itemVariationData: {
                    name: componentName,
                    pricingType: 'VARIABLE_PRICING',
                    trackInventory: true,
                  },
                },
              ],
            },
          },
        })
        .then((res) => {
          const squareResponse = JSON.parse(res.body.toString());
          const itemId = squareResponse['catalog_object']['id']; // used for deletion
          const variationId =
          squareResponse['catalog_object']['item_data']['variations'][0]['id']; // stores the first variation of the item as the reference for inventory counting

          const refs = request.body.refs; // string array of source ids
          const source = [];
          refs.forEach((sourceId) => {
            source.push(admin.firestore().collection('Sources').doc(sourceId)); // add references to source array
          });
          const componentData = {
            source: source,
            variationId: variationId,
            itemId: itemId,
          };
          const collection = admin.firestore().collection('Components');
          collection
              .doc(componentName)
              .set(componentData)
              .then(() => {
                response.sendStatus(200); // success
              })
              .catch((err) => {
                response.status(400).send(err); // firebase error
              });
        })
        .catch((err) => {
          response.status(400).send(err); // square error
        });
  });
});

// Returns a JSON object of all the sources with the stored ID
exports.getSources = functions.https.onRequest((request, response) => {
  cors(request, response, () => {
    const collection = admin.firestore().collection('Sources');

    collection.get().then((querySnapshot) => {
      const results = {};
      querySnapshot.forEach((doc) => {
        results[doc.id] = doc.data();
      });
      response.send(results);
    });
  });
});

// adds/subtracts the inventory from square for each component name given
// component totals are made on frontend given basic combo data, so any adjustments made in the combo will be passed in here
exports.batchChangeInventory = functions.https.onRequest(
    (request, response) => {
      cors(request, response, () => {
      // const componentCollection = admin.firestore().collection('Components');

        const changes = [];
        const counts = request.body.counts;
        const collection = admin.firestore().collection('Components');
        const varIdMapping = {};

        collection
            .get()
            .then((querySnapshot) => {
              querySnapshot.forEach((doc) => {
                const docData = doc.data();
                varIdMapping[doc.id] = docData['variationId']; // keeping track for mapping variation id back to name
              });

              Object.keys(counts).forEach((componentName) => {
                const variationId = varIdMapping[componentName];
                if (variationId != undefined) {
                  const amount = counts[componentName];

                  const fromState = amount < 0 ? 'IN_STOCK' : 'NONE';
                  const toState = amount < 0 ? 'SOLD' : 'IN_STOCK';
                  const adjustment = {
                    type: 'ADJUSTMENT',
                    adjustment: {
                      fromState: fromState,
                      toState: toState,
                      locationId: request.body.locationId,
                      catalogObjectId: variationId,
                      quantity: Math.abs(amount) + '', // needs to be a positive number as a string
                      occurredAt: new Date().toISOString(),
                    },
                  };
                  changes.push(adjustment);
                }
              });
              client.inventoryApi
                  .batchChangeInventory({
                    idempotencyKey: randomUUID(),
                    changes: changes,
                  })
                  .then(() => {
                    response.sendStatus(200); // success
                  })
                  .catch(() => {
                    response.send(500); // square error
                  });
            })
            .catch(() => {
              response.send(500); // firebase error
            });
      });
    },
);

// ////////////////////////////////// create/edit combo (default no components, assume user passed body is valid for time being)

// ////////////////////////////////// remove combo

// ////////////////////////////////// get all combos

// ////////////////////////////////// batch change inventory, uses batch change inventory function with the stored IDs in firebase for each component

// ////////////////////////////////// create/edit component, add to catalog then add to firebase with returned square ID

// ////////////////////////////////// remove component, remove from catalog with stored ID and delete from firebase

// ////////////////////////////////// get all component sources and inventory counts

// ////////////////////////////////// get all sources

// add source

// remove source
